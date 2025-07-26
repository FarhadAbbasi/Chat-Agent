import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const DocumentUpload = () => {
//   const webhookURL = "https://proxpire.com/webhook/ingest-legal-document"; // Declare the webhook URL here
  const webhookURL = "https://proxpire.com/webhook-test/ingest-legal-document"; // Declare the webhook URL here

  const [file, setFile] = useState<File | null>(null); // Specify the type for file
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    category: "",
    court: "",
    case_number: "",
    date: "",
    tags: "",
    description: "",
    text_content: "", // Add text_content to the metadata state
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null); // Allow string or null
  const [error, setError] = useState<string>(""); // Specify type for error

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted"); // Log when the form is submitted

    if (!file && !metadata.text_content) {
      setError("Please select a file or enter document text.");
      console.log("Error: No file or text content provided."); // Log error condition
      return;
    }

    setUploading(true);
    setError("");
    setUploadSuccess(null);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
      formData.append(
        "metadata",
        JSON.stringify({
          ...metadata,
          tags: metadata.tags.split(",").map((tag) => tag.trim()),
        })
      );
      console.log("File and metadata prepared for upload:", { file, metadata }); // Log file and metadata
    }

    // For URL download or text content, we create the request body as JSON
    if (metadata.text_content) {
        // Method 3: Text Upload
      console.log("Uploading text content..."); // Log text upload
      try {
        const response = await axios.post(webhookURL, {
        //   text_content: metadata.text_content,
          ...metadata,
        });
        console.log("Text content upload response:", response.data); // Log response from upload
        setUploadSuccess("Document uploaded successfully!");
      } catch (err) {
        console.error("Error uploading document:", err); // Log error
        setError("Error uploading document.");
      }
    } else if (file) {
        // Method 1: File Upload with metadata
        console.log("Uploading file..."); // Log file upload
        console.log("Upload file :", formData); // Log file upload
      try {
        const response = await axios.post(webhookURL, formData, {
            headers: { "Content-Type": "multipart/form-data" }, // Ensure this header is set correctly
        });
        console.log("File upload response:", response.data); // Log response from upload
        setUploadSuccess("Document uploaded successfully!");
      } catch (err) {
        console.error("Error uploading document:", err); // Log error
        setError("Error uploading document.");
      }
    }
    setUploading(false);
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

        {uploadSuccess && (
          <div className="text-green-400 mb-4">{uploadSuccess}</div>
        )}
        {error && <div className="text-red-400 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-lg font-medium">Upload Document</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>

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
            <input
              type="text"
              name="category"
              value={metadata.category}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-lg font-medium">Court</label>
            <input
              type="text"
              name="court"
              value={metadata.court}
              onChange={handleMetadataChange}
              className="w-full text-white p-3 bg-gray-700 rounded-lg"
            />
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

          {/* Text Upload Option */}
          <div className="space-y-2">
            <label className="text-lg font-medium">Or Text Upload</label>
            <textarea
              name="text_content"
              value={metadata.text_content}
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
