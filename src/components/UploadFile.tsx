import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface WebhookResponse {
  fileName: string;
  message: string;
  metadata: {
    title: string;
    author: string;
    category: string;
    court: string | null;
    caseNumber: string | null;
  };
  processingId: string;
  qdrantCollection: string;
  statistics: {
    failedInsertions: number;
    originalDocumentLength: number;
    successfulInsertions: number;
    totalChunks: number;
  };
  success: boolean;
  timestamp: string;
}

const DocumentUpload = () => {
  const webhookURL = "https://proxpire.com/webhook/ingest-legal-document";
  // const webhookURL = "https://proxpire.com/webhook-test/ingest-legal-document";

  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    category: "test_documents", // Set default category
    case_number: "",
    date: "",
    tags: "",
    description: "",
    text_content: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");

    if (uploadMode === 'file' && !file) {
      setError("Please select a file to upload.");
      return;
    }

    if (uploadMode === 'text' && !metadata.text_content) {
      setError("Please enter document text.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadSuccess(null);
    setWebhookResponse(null);

    try {
      let response;
      if (uploadMode === 'text') {
        const requestData = {
          ...metadata,
          tags: metadata.tags.split(",").map((tag) => tag.trim()),
        };
        console.log("Uploading text content with data:", requestData);
        response = await axios.post(webhookURL, requestData);
      } else {
        console.log("Uploading file...");
        const formData = new FormData();
        formData.append("file", file!);
        
        // Create metadata without text_content for file upload
        const fileMetadata = {
          ...metadata,
          text_content: null, // Explicitly set to null for file uploads
          tags: metadata.tags.split(",").map((tag) => tag.trim()),
        };
        formData.append("metadata", JSON.stringify(fileMetadata));
        
        // Log the actual data being sent
        console.log("Upload file metadata:", fileMetadata);
        // Log FormData entries
        for (const [key, value] of formData.entries()) {
          console.log(`FormData ${key}:`, value);
        }
        
        response = await axios.post(webhookURL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      console.log("Upload response:", response.data);
      setWebhookResponse(response.data);
      setUploadSuccess("Document uploaded successfully!");
    } catch (err) {
      console.error("Error uploading document:", err);
      setError("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSuccess = () => {
    setUploadSuccess(null);
    setWebhookResponse(null);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        className="w-full max-w-xl rounded-xl shadow-lg bg-gray-900 p-6 border border-gray-700"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-blue-400 mb-4 text-center">
          📂 Document Upload
        </h1>

        {uploadSuccess && webhookResponse && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-4 space-y-2 relative">
            <button
              onClick={handleCloseSuccess}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
            <div className="text-green-400 font-semibold">{webhookResponse.message}</div>
            <div className="text-sm space-y-1">
              <p><span className="text-green-400">Collection:</span> {webhookResponse.qdrantCollection}</p>
              <div className="mt-2">
                <p className="text-green-400 font-semibold">Statistics:</p>
                <ul className="list-disc list-inside pl-2">
                  <li>Total Chunks: {webhookResponse.statistics.totalChunks}</li>
                  <li>Successful Insertions: {webhookResponse.statistics.successfulInsertions}</li>
                  <li>Failed Insertions: {webhookResponse.statistics.failedInsertions}</li>
                  <li>Document Length: {webhookResponse.statistics.originalDocumentLength}</li>
                </ul>
              </div>
              <p className="text-xs text-green-400/70 mt-2">
                Timestamp: {new Date(webhookResponse.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
        
        {error && <div className="text-red-400 mb-4">{error}</div>}

        {/* Upload Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 p-1 gap-4 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                uploadMode === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-gray-200 hover:text-slate-600'
              }`}
              onClick={() => setUploadMode('file')}
            >
              Upload File
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                uploadMode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-gray-200 hover:text-slate-600'
              }`}
              onClick={() => setUploadMode('text')}
            >
              Upload Text
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          {uploadMode === 'file' && (
            <div className="space-y-2">
              <label className="text-lg font-medium">Upload Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="w-full text-white p-3 bg-gray-700 rounded-lg"
              />
            </div>
          )}

          {/* Text Upload */}
          {uploadMode === 'text' && (
            <div className="space-y-2">
              <label className="text-lg font-medium">Document Text</label>
              <textarea
                name="text_content"
                value={metadata.text_content}
                onChange={handleMetadataChange}
                className="w-full text-white p-3 bg-gray-700 rounded-lg min-h-[200px]"
                placeholder="Enter your document text here..."
              ></textarea>
            </div>
          )}

          {/* Metadata Form */}
          <div className="space-y-2">
            <label className="text-lg font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Author</label>
            <input
              type="text"
              name="author"
              value={metadata.author}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Category</label>
            <select
              name="category"
              value={metadata.category}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            >
              {/* <option value="">Select a category</option> */}
              <option value="test_documents">Test Documents</option>
              <option value="legal_documents">Legal Category</option>
              <option value="legal_cases">Legal Cases</option>
              <option value="test_cases">Test Cases</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Case Number</label>
            <input
              type="text"
              name="case_number"
              value={metadata.case_number}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={metadata.date}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Tags (Comma separated)</label>
            <input
              type="text"
              name="tags"
              value={metadata.tags}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Description</label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
