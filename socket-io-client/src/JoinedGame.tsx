import React, { useState } from "react";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import { Cell, CellT } from "./Cell";
import { PlayerColor } from "./Player";

type Board = ReadonlyArray<ReadonlyArray<CellT>>;

export const JoinedGame = ({
  socket,
  player,
}: {
  socket: Socket;
  player: { color: PlayerColor; name: string };
}) => {
  const [board, setBoard] = useState<Board | null>(null);

  socket.on("board", (board: Board) => {
    console.log("board received");
    setBoard(board);
  });

  return (
    <>
      <div>
        <StyledPlayerColor color={player.color}> </StyledPlayerColor>
        {player.name}
      </div>
      {board ? (
        <StyledBoard>
          {board.map((row) => (
            <Row>
              {row.map((cell) => (
                <Cell cell={cell} />
              ))}
            </Row>
          ))}
        </StyledBoard>
      ) : (
        <>
          <div>Game not started!</div>
          <button onClick={() => socket.emit("startGame")}>Start game</button>
        </>
      )}
      <button onClick={() => socket.emit("move:up")}>&#8593;</button>
      <div>
        <button onClick={() => socket.emit("move:left")}>&#8592;</button>
        <button onClick={() => socket.emit("move:right")}>&#8594;</button>
      </div>
      <button onClick={() => socket.emit("move:down")}>&#8595;</button>
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
