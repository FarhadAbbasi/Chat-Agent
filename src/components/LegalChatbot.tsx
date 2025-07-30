// src/components/Chatbot.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LegalChatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your assistant. Ask me anything!" },
    // { from: "bot", text: "HI'd be happy to help you understand Real Estate Purchase Agreements. A Real Estate Purchase Agreement (REPA) is a legally binding contract between a buyer and seller that outlines the terms and conditions of the sale of a residential dwelling. It's a crucial document in the real estate transaction process, as it provides a framework for both parties to agree on the purchase price, payment terms, and other essential aspects of the sale.  A typical REPA includes the following key elements:  1. **Offer**: The buyer submits an offer to purchase the property, which includes their desired purchase price, provisional requests (e.g., financing conditions), protective contingencies (e.g., inspection or appraisal), and earnest money deposit. 2. **Purchase Price**: The seller is given a time limit to accept, deny, or counteroffer the buyer's offer. If accepted, the seller signs the REPA creating a binding purchase agreement. 3. **Contingencies**: The REPA includes contingencies that can be triggered if certain conditions are not met, such as financing issues, inspection results, or appraisal values. /n /n These contingencies provide security for the transaction and allow buyers to renegotiate or walk away if necessary.  Some common contingencies found in REPAs include:  * Financing contingency (e.g., loan approval) * Inspection contingency (e.g., home inspection results) * Appraisal contingency (e.g., appraised value of the property) * Title contingency (e.g., ownership transfer)  It's essential to note that REPAs can vary depending on local laws, regulations, and market conditions. In some jurisdictions, additional contingencies or requirements may be necessary.  While Document 1-5 provide valuable information about Real Estate Purchase Agreements, it's clear that they don't fully address the complexities of a typical REPA. To answer your original query more comprehensively, I recommend consulting local real estate laws and regulations, as well as seeking guidance from a qualified attorney or real estate expert.  If you have any further questions or would like me to elaborate on specific aspects of Real Estate Purchase Agreements, please don't hesitate to ask!" },

  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDelayMessage, setShowDelayMessage] = useState(false);
  // const webhookURL = "https://proxpire.com/webhook-test/legal-query";
  const webhookURL = "https://proxpire.com/webhook/legal-query";
  const chatEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowDelayMessage(true);
      }, 30000); // 30 seconds to prompt user that AI-request is taking longer than usual
    } else {
      setShowDelayMessage(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);


  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Create an AbortController for the request
    const controller = new AbortController();
    const timeoutDuration = 120000; // 2 minutes in milliseconds

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error('Request timed out after 2 minutes'));
      }, timeoutDuration);
    });

    try {
      // Race between the API call and the timeout
      const response = await Promise.race([
        axios.post(
          webhookURL,
          { message: input },
          {
            signal: controller.signal,
          }
        ),
        timeoutPromise
      ]) as { data: { response: string } };

      console.log('Legal Assistant Reply:', response.data);
      const botReply = response?.data?.response || "I'm sorry, I didn't get that.";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (error: unknown) {
      console.error("Error contacting webhook:", error);
      let errorMessage = "⚠️ Sorry, something went wrong. Please try again later.";
      
      if (
        (error instanceof Error && error.message === 'Request timed out after 2 minutes') || 
        (axios.isAxiosError(error) && error.code === "ECONNABORTED")
      ) {
        errorMessage = "⚠️ Request timed out after 2 minutes. Please try again or rephrase your question.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
      controller.abort(); // Cleanup the controller
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const LoadingDots = () => {
    return (
      <div className="flex flex-col items-start gap-2">
        <motion.div
          className="flex space-x-2 p-3 rounded-lg bg-gray-700 w-fit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: dot * 0.2,
              }}
            />
          ))}
        </motion.div>
        {showDelayMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-400 ml-3"
          >
            Taking longer than usual...
          </motion.p>
        )}
      </div>
    );
  };


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
          🤖  Legal Chat Assistant
        </h1>
        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-3 bg-gray-800 rounded-md">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`p-3 rounded-lg w-fit max-w-[75%] ${
                msg.from === "user" ? "bg-blue-600 ml-auto" : "bg-gray-700 mr-auto"
              }`}
              initial={{ x: msg.from === "user" ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {msg.from === "user" ? (
                <span className="whitespace-pre-wrap">{msg.text}</span>
              ) : (
                <div className="prose prose-invert prose-p:my-2 prose-pre:my-2 prose-pre:bg-gray-800 prose-pre:p-2 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-li:my-0 prose-ul:my-2 prose-ol:my-2 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>
          ))}
          {loading && <LoadingDots />}
          <div ref={chatEndRef} />
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
};

export default LegalChatbot;


