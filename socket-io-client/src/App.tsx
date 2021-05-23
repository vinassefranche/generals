import React, { useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import styled from 'styled-components';
import { Game } from "./Game";

const ENDPOINT = "http://127.0.0.1:4001";




export const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    
    setSocket(socket);
    return () => {socket.disconnect();};
  }, []);

  if(socket) {
    return <Game socket={socket} />
  }

  return (
    <Container>
      Waiting for server connection
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
