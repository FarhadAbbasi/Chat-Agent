// src/App.tsx
// import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Use Routes instead of Switch
// import { motion } from "framer-motion";
import DocumentUpload from "./components/UploadFile";
import Chatbot from "./components/Chatbot"; // Import the Chatbot component

function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-gradient-to-b scrollbar-hidden from-gray-900 to-gray-800 text-white flex flex-col">
        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-white hover:underline">
                Chatbot
              </Link>
            </li>
            <li>
              <Link to="/upload" className="text-white hover:underline">
                File Upload
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex-grow flex items-center scrollbar-hidden justify-center">
          <Routes>
            <Route path="/" element={<Chatbot />} /> {/* Default route */}
            <Route path="/upload" element={<DocumentUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;


