import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import styled from 'styled-components';
import { Cell, CellT } from "./Cell";
import { PlayerColor } from "./Player";

const ENDPOINT = "http://127.0.0.1:4001";


type Board = ReadonlyArray<ReadonlyArray<CellT>>


function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState<string>('');
  const [player, setPlayer] = useState<{color: PlayerColor, name: string} | null>(null);
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    
    setSocket(socket);
    return () => {socket.disconnect();};
  }, []);
  
  const onJoinGameClick = () => {
    if(!socket) {
      alert('socket not initialized');
      return;
    }
    if(!name) {
      alert('Please write a name');
      return;
    }
    socket.emit("joinGame", {name}, (response:any) => {
      console.log(response)
      if(!response.ok) {
        alert('could not join');
        return;
      }
      socket.on("board", (board:Board) => {
        console.log('board received')
        setBoard(board);
      });
      setPlayer(response.player);
    })
  }

  if (player === null) {
    return <Container>
      <input onChange={e => setName(e.target.value)}/>
      <button onClick={onJoinGameClick}>Join game</button>
    </Container>
  }

  return (
    <Container>
      <div>
        <StyledPlayerColor color={player.color}> </StyledPlayerColor>
        {player.name}
      </div>
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

const StyledPlayerColor = styled.span<{color: string}>`
  background-color: ${({color}) => color};
  width: 10px;
  height: 10px;
  display: inline-block;
`;