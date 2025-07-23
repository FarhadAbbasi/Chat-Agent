// import { useState } from 'react'
// import './App.css'

// function App() {
//   return (
//     <h1 className='text-3xl  font-bold text-red-500'> Hello World</h1>
//   )
// }
// export default App




// App.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // const webhookURL = "https://proxpire.com/webhook-test/personalAssist";
  const webhookURL = "https://proxpire.com/webhook/personalAssist";
  const chatEndRef = useRef<HTMLDivElement | null>(null); // Create a ref for the chat end

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(webhookURL, { message: input });
      console.log("N8N response:", res);
      const botReply = res?.data[0]?.output || "I'm sorry, I didn't get that.";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error contacting webhook:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "⚠️ Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        className="w-full max-w-xl rounded-xl shadow-lg bg-gray-900 p-6 border border-gray-700"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-blue-400 mb-4 text-center">
        🤖🌍  Proxpire Chat Assistant
        </h1>
        <div className="h-96 overflow-y-auto scrollbar-hidden space-y-4 mb-4 p-3 bg-gray-800 rounded-md">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`p-3 rounded-lg w-fit max-w-[75%] ${
                msg.from === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-700 mr-auto"
              }`}
              initial={{ x: msg.from === "user" ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {msg.text}
            </motion.div>
          ))}
          <div ref={chatEndRef} /> {/* Empty div for scrolling */}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
