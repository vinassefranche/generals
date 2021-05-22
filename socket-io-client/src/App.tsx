import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import styled, { css } from 'styled-components';

const ENDPOINT = "http://127.0.0.1:4001";

type CellType = {
  type: 'empty' | 'mountain' | 'army',
  color?: 'blue'
}
type Board = ReadonlyArray<ReadonlyArray<CellType>>


function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [ack, setAck] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("board", (board:Board) => {
      setBoard(board);
    });

    socket.on("message", (data:string) => {
      console.log(data, 'atattat')
      setAck(data)
    });
    
    setSocket(socket);
    return () => {socket.disconnect();};
  }, []);

  return (
    <>
      <StyledBoard>
        {board && board.map(row => <Row>{row.map(cell => <Cell cell={cell}/>)}</Row>)}
      </StyledBoard>
      {ack && <p>Acknowlegment from server: {ack}</p>}
      <input onChange={e => setInput(e.target.value)}></input>
      <button onClick={() => socket && socket.emit("message", input)}>Toto</button>
    </>
  );
}

export default App;

const Cell = ({cell}:{cell: CellType}) => {
  if(cell.type === 'mountain'){
    return <StyledCell>&#9968;</StyledCell>
  }
  if(cell.type === 'army') {
    return <StyledCell color={cell.color}>1</StyledCell>
  }
  return <StyledCell> </StyledCell>
}

const StyledCell = styled.div<{color?: string}>`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({color}) => color && css`
    background-color: ${color};
  `}
  border: 1px solid black;
  width: 30px;
  height: 30px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledBoard = styled.div`
  display: flex;
  flex-direction: column;
`;