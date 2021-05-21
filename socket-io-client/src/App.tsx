import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";

function App() {
  const [response, setResponse] = useState<string>("");
  const [ack, setAck] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", (data:any) => {
      setResponse(data);
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
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
      {ack && <p>Acknowlegment from server: {ack}</p>}
      <input onChange={e => setInput(e.target.value)}></input>
      <button onClick={() => socket && socket.emit("message", input)}>Toto</button>
    </>
  );
}

export default App;