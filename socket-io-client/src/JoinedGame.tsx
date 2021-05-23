import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import { Cell, CellT } from "./Cell";
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

export const JoinedGame = ({
  socket,
  player,
}: {
  socket: Socket;
  player: { color: PlayerColor; name: string };
}) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>(
    defaultCursorPosition[player.color]
  );

  useEffect(() => {
    socket.on("board", (board: Board) => setBoard(board));
    return () => {
      socket.off("board");
    };
  }, [socket]);

  const onMove = (direction: Direction) => {
    const newPosition = {
      column: cursorPosition.column + columnShift(direction),
      row: cursorPosition.row + rowShift(direction),
    };
    socket.emit(
      "move",
      {
        from: cursorPosition,
        to: newPosition,
      },
      (response: SocketIOResponse) => {
        if (!response.ok) {
          console.log("Move not possible because ", response.reason);
          return;
        }
        setCursorPosition(newPosition);
      }
    );
  };

  const onStartGame = () => {
    socket.emit("startGame", (response: SocketIOResponse) => {
      if (!response.ok) {
        alert(`Cannot start game because ${response.reason}`);
        return;
      }
    });
  };

  return (
    <>
      <div>
        <StyledPlayerColor color={player.color}> </StyledPlayerColor>
        {player.name}
      </div>
      {board ? (
        <StyledBoard>
          {board.map((row, rowIndex) => (
            <Row>
              {row.map((cell, columnIndex) => (
                <Cell
                  cell={cell}
                  active={
                    columnIndex === cursorPosition.column &&
                    rowIndex === cursorPosition.row
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
      <button onClick={() => onMove("up")}>&#8593;</button>
      <div>
        <button onClick={() => onMove("left")}>&#8592;</button>
        <button onClick={() => onMove("right")}>&#8594;</button>
      </div>
      <button onClick={() => onMove("down")}>&#8595;</button>
    </>
  );
};

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
