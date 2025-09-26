import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "si-LK";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        addMessage(
          "system",
          "කථන හඳුනාගැනීමේ දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න."
        );
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, timestamp: new Date() }]);
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "si-LK";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const question = inputText.trim();
    setInputText("");
    addMessage("user", question);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      addMessage("bot", data.answer);
      speakText(data.answer);
    } catch (error) {
      console.error("Error:", error);
      addMessage("bot", "සේවාදායකයා සමඟ සම්බන්ධ වීමේ දෝෂයක් ඇති විය.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ගොවියාගේ මිතුරා</h1>
        <p>අනුරාධපුර වියලි කලාපයේ ගොවීන් සඳහා</p>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <p>ආයුබෝවන්! මම ඔබගේ කෘෂිකාර්මික සහායකයා ලෙස සේවය කරමි.</p>
              <p>ඔබට ගොවිතැන පිළිබඳ ප්‍රශ්න ඇසිය හැකිය.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString("si-LK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message bot">
              <div className="message-content loading">
                <span>පිළිතුරු සෙවීම...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ඔබේ ප්‍රශ්නය ඇතුළත් කරන්න..."
              disabled={isLoading}
            />
            <button
              className={`mic-btn ${isListening ? "listening" : ""}`}
              onClick={handleMicClick}
              disabled={isLoading}
              title="කථනය භාවිතා කරන්න"
            >
              🎤
            </button>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
            >
              යවන්න
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
