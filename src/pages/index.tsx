/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from "axios";
import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface Message {
  id: number;
  sender: string;
  content: string;
}

const Chat = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((oldMessages) => [
      ...oldMessages,
      { id: Date.now(), sender: "User", content: input },
    ]);
    setChatHistory((old) => [...old, input]);
    setInput("");
    // Handle AI response here
    setLoading(true);
    axios
      .post("/api/langchain", {
        question: input,
        chat_history: chatHistory,
      })
      .then((resp) => {
        const answer = resp.data.answer;
        setChatHistory((old) => [...old, answer]);
        setMessages((oldMessages) => [
          ...oldMessages,
          { id: Date.now(), sender: "System", content: answer },
        ]);
      })
      .catch(() => {
        toast.error("Something went wrong. Please try again", {
          position: "bottom-right",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="mx-auto my-10 flex h-full max-w-3xl flex-col">
      <div className="flex-grow space-y-4 overflow-y-auto border-2 border-solid p-4">
        {messages.length === 0 && (
          <div>No messages yet. Start chatting below!</div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end ${
              message.sender === "User" ? "justify-end" : ""
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.sender === "User"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="my-4 flex">
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Type your message"
        />
        <button
          type="submit"
          className="ml-4 rounded-md bg-red-500 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
