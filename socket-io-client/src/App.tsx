import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import styled from 'styled-components';
import { Cell, CellT } from "./Cell";

const ENDPOINT = "http://127.0.0.1:4001";


type Board = ReadonlyArray<ReadonlyArray<CellT>>


function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("board", (board:Board) => {
      console.log('board received')
      setBoard(board);
    });
    
    setSocket(socket);
    return () => {socket.disconnect();};
  }, []);

  return (
    <Container>
      {board ?
        <StyledBoard>
          {board.map(row => <Row>{row.map(cell => <Cell cell={cell}/>)}</Row>)}
        </StyledBoard>
        :
        <>
          <div>Game not started!</div>
          <button onClick={() => socket && socket.emit("startGame")}>Start game</button>
        </>
      }
      <button onClick={() => socket && socket.emit("move:up")}>&#8593;</button>
      <div>
        <button onClick={() => socket && socket.emit("move:left")}>&#8592;</button>
        <button onClick={() => socket && socket.emit("move:right")}>&#8594;</button>
      </div>
      <button onClick={() => socket && socket.emit("move:down")}>&#8595;</button>
    </Container>
  );
}

export default App;


const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledBoard = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
`