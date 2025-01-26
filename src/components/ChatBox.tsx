'use client'

import { socket } from "@/lib/socket";
import { useState } from "react";

export default function ChatBox() {
  const [input, setInput] = useState("");

  const submitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log("truee!", {input})
    if (input) {
      console.log("Sending input: ", input)
      socket.emit("chat message", input);
      console.log("Resetting input...")
      setInput("");
    }
  };

  console.log("input: ", input)

  return (
    <form className="chat-form" onSubmit={submitHandler}>
      <input
        type="text"
        placeholder="Enter some input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <input type="submit" value="Send" />
    </form>
  );
}
