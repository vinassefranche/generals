import React, { useState } from "react";
import { Socket } from "socket.io-client";
import styled from "styled-components";
import { JoinedGame } from "./JoinedGame";
import { Player } from "./Player";
import { SocketIOResponse } from "./SocketIoStuff";

export const Game = ({ socket }: { socket: Socket }) => {
  const [name, setName] = useState<string>("");
  const [player, setPlayer] = useState<Player | null>(null);

  const onJoinGameClick = () => {
    if (!name) {
      alert("Please write a name");
      return;
    }
    socket.emit(
      "joinGame",
      { name },
      (response: SocketIOResponse<{ player: Player }>) => {
        console.log(response);
        if (!response.ok) {
          alert(`could not join because: ${response.reason}`);
          return;
        }
        setPlayer(response.player);
      }
    );
  };

  return (
    <Container>
      {player ? (
        <JoinedGame player={player} socket={socket} />
      ) : (
        <>
          <input onChange={(e) => setName(e.target.value)} />
          <button onClick={onJoinGameClick}>Join game</button>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
`;
