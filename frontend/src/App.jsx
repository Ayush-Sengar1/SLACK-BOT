import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

export default function App() {
  const channelId = "C08V8BJQ29F"; // Your Slack channel ID
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null); // ts of message being edited
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  // Fetch Slack messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/messages");
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
        setError("");
      } else {
        setError("No messages found.");
        setMessages([]);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError("Error fetching messages.");
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Send a new Slack message
  const sendSlackMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const response = await axios.post("http://localhost:3000/api/send-message", {
        channel: channelId,
        text,
      });
      console.log("Send message response:", response.data);
      setText("");
      fetchMessages();
    } catch (error) {
      console.error("Sending message failed:", error);
      setError("Failed to send message.");
    }
  };

  // Start editing a message
  const startEdit = (ts, currentText) => {
    setEditing(ts);
    setEditText(currentText);
  };

  // Save edited message
  const saveEdit = async (ts) => {
    if (!editText.trim()) return;
    console.log("Editing message:", { channel: channelId, ts, text: editText });

    try {
      const response = await axios.post("http://localhost:3000/api/edit-message", {
        channel: channelId,
        ts,
        text: editText,
      });
      console.log("Edit message response:", response.data);
      setEditing(null);
      setEditText("");
      fetchMessages();
    } catch (err) {
      console.error("Failed to edit message:", err);
      setError("Failed to edit message.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(null);
    setEditText("");
  };

  // Delete a message
  const deleteMessage = async (ts) => {
    try {
      const response = await axios.post("http://localhost:3000/api/delete-message", {
        channel: channelId,
        ts,
      });
      console.log("Delete message response:", response.data);
      fetchMessages();
    } catch (err) {
      console.error("Failed to delete message:", err);
      setError("Failed to delete message.");
    }
  };

 return (
  <div className="container">
    <h1>Messaging CRUD</h1>

    <form onSubmit={sendSlackMessage}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>

    {error && <p className="error-message">{error}</p>}

    <h2>Messages</h2>
    <div className="messages">
      {messages.length === 0 && <p>No messages available.</p>}

      {messages.map((msg) => (
        <div key={msg.ts} className="message">
          {editing === msg.ts ? (
            <>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="message-buttons">
                <button
                  className="save-button"
                  onClick={() => saveEdit(msg.ts)}
                >
                  Save
                </button>
                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{msg.text}</p>
              <div className="message-buttons">
                <button
                  className="edit-button"
                  onClick={() => startEdit(msg.ts, msg.text)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteMessage(msg.ts)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);}