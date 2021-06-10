import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import { Cell, CellT, CellType } from "./Cell";
import { PlayerColor } from "./Player";
import { SocketIOResponse } from "./SocketIoStuff";

type Direction = "left" | "right" | "up" | "down";
const columnShift = (direction: Direction) => {
  switch (direction) {
    case "left":
      return -1;
    case "right":
      return 1;
    case "up":
    case "down":
      return 0;
  }
};
const rowShift = (direction: Direction) => {
  switch (direction) {
    case "left":
    case "right":
      return 0;
    case "up":
      return -1;
    case "down":
      return 1;
  }
};

type Board = ReadonlyArray<ReadonlyArray<CellT>>;

type CursorPosition = {
  column: number;
  row: number;
};
const defaultCursorPosition: Record<PlayerColor, CursorPosition> = {
  blue: {
    column: 1,
    row: 1,
  },
  green: {
    column: 3,
    row: 1,
  },
  yellow: {
    column: 2,
    row: 2,
  },
  red: {
    column: 2,
    row: 2,
  },
};

const keyToDirectionMapping = {
  ArrowRight: "right",
  ArrowLeft: "left",
  ArrowDown: "down",
  ArrowUp: "up",
} as Record<string, Direction>;

type GameData = {
  board: Board;
  armyNumbers: Record<PlayerColor, number>;
};

export const JoinedGame = ({
  socket,
  player,
}: {
  socket: Socket;
  player: { color: PlayerColor; name: string };
}) => {
  const [game, setGame] = useState<GameData | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>(
    defaultCursorPosition[player.color]
  );

  useEffect(() => {
    socket.on("game", (game: GameData) => setGame(game));
    return () => {
      socket.off("game");
    };
  }, [socket]);

  const onMove = useCallback(
    (direction: Direction) => {
      const newPosition = {
        column: cursorPosition.column + columnShift(direction),
        row: cursorPosition.row + rowShift(direction),
      };

      if (
        !game ||
        !game.board[newPosition.row] ||
        !game.board[newPosition.row][newPosition.column] ||
        game.board[newPosition.row][newPosition.column].type ===
          CellType.Mountain
      ) {
        return;
      }
      setCursorPosition(newPosition);
      socket.emit("move", {
        from: cursorPosition,
        to: newPosition,
      });
    },
    [cursorPosition, socket, game]
  );

  useEffect(() => {
    const keyupHandler = (e: KeyboardEvent) => {
      if (Object.keys(keyToDirectionMapping).includes(e.key)) {
        e.preventDefault();
        onMove(keyToDirectionMapping[e.key]);
      }
    };
    document.addEventListener("keyup", keyupHandler);
    return () => {
      document.removeEventListener("keyup", keyupHandler);
    };
  }, [onMove]);

  const onStartGame = () => {
    socket.emit("startGame", (response: SocketIOResponse) => {
      if (!response.ok) {
        alert(`Cannot start game because ${response.reason}`);
        return;
      }
    });
  };

  const onEndGame = () => {
    socket.emit("endGame");
  };

  return (
    <>
      <GameHeader>
        <div>
          <StyledPlayerColor color={player.color}> </StyledPlayerColor>
          {player.name}
        </div>
        {game && (
          <div>
            {Object.entries(game.armyNumbers).map(([color, number]) => (
              <PlayerScore color={color}>
                <span>{color}:</span>
                <span>{number}</span>
              </PlayerScore>
            ))}
          </div>
        )}
      </GameHeader>
      {game?.board ? (
        <StyledBoard>
          {game.board.map((row, rowIndex) => (
            <Row>
              {row.map((cell, columnIndex) => (
                <Cell
                  cell={cell}
                  active={
                    columnIndex === cursorPosition.column &&
                    rowIndex === cursorPosition.row
                  }
                  onClick={() =>
                    setCursorPosition({ column: columnIndex, row: rowIndex })
                  }
                />
              ))}
            </Row>
          ))}
        </StyledBoard>
      ) : (
        <>
          <div>Game not started!</div>
          <button onClick={onStartGame}>Start game</button>
        </>
      )}
      <button onClick={onEndGame}>Stop game</button>
    </>
  );
};

const GameHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 260px;
  padding: 20px 0;
  justify-content: space-between;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledBoard = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledPlayerColor = styled.span<{ color: string }>`
  background-color: ${({ color }) => color};
  width: 10px;
  height: 10px;
  display: inline-block;
`;

const PlayerScore = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: white;
  display: flex;
  justify-content: space-between;
  :not(:last-child) {
    margin-bottom: 5px;
  }
`;
