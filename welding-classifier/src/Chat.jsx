import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const VF_API_KEY = "VF.DM.68cc1923d5c428eb2eb8cd8b.J5uE7hR675k9mKL8";
const USER_ID = "user_" + Math.random().toString(36).substring(2, 8);

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // <-- Added loading state

  // Generic send message function
  const sendMessage = async (messageToSend) => {
    const text = messageToSend || input;
    if (!text.trim()) return;

    // Show user's message immediately
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true); // <-- Start loading when message is sent

    try {
      const response = await fetch(
        `https://general-runtime.voiceflow.com/state/user/${USER_ID}/interact`,
        {
          method: "POST",
          headers: {
            Authorization: VF_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: {
              type: "text",
              payload: text,
            },
          }),
        }
      );

      const data = await response.json();
      console.log("Voiceflow Response:", data);

      if (!Array.isArray(data)) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Unexpected response format from Voiceflow." },
        ]);
        return;
      }

      // Process each event from Voiceflow
      data.forEach((event) => {
        if (event.type === "text" && event.payload?.message) {
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: event.payload.message },
          ]);
        }

        if (event.type === "choice" && event.payload?.buttons?.length > 0) {
          setMessages((prev) => [
            ...prev,
            { type: "choices", buttons: event.payload.buttons },
          ]);
        }

        if (event.type === "cardV2" && event.payload) {
          setMessages((prev) => [
            ...prev,
            {
              type: "card",
              title: event.payload.title,
              description: event.payload.description?.text,
              imageUrl: event.payload.imageUrl,
              buttons: event.payload.buttons || [],
            },
          ]);
        }
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Network error. Please try again later." },
      ]);
    } finally {
      setLoading(false); // <-- Stop loading after response or error
    }
  };

  // Handles clicking a choice button
  const handleChoiceClick = (choiceText) => {
    sendMessage(choiceText);
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => {
          // User message
          if (msg.type === "user") {
            return (
              <div key={index} className="flex justify-end">
                <div className="chat-bubble-user">{msg.text}</div>
              </div>
            );
          }

          // Bot message
          if (msg.type === "bot") {
            return (
              <div key={index} className="flex justify-start">
                <div className="chat-bubble-bot"> <ReactMarkdown>{msg.text}</ReactMarkdown> </div>
              </div>
            );
          }

          // Choice buttons
          if (msg.type === "choices") {
            return (
              <div key={index} className="chat-choices">
                {msg.buttons.map((btn, i) => (
                  <button
                    key={i}
                    className="chat-choice-btn"
                    onClick={() => handleChoiceClick(btn.name)}
                  >
                    {btn.name}
                  </button>
                ))}
              </div>
            );
          }

          // Card with buttons
          if (msg.type === "card") {
            return (
              <div key={index} className="chat-card">
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt={msg.title}
                    className="chat-card-image"
                  />
                )}
                <div className="chat-card-content">
                  <h3 className="chat-card-title">{msg.title}</h3>
                  <p className="chat-card-description">{msg.description}</p>
                  {msg.buttons.length > 0 && (
                    <div className="chat-choices mt-3">
                      {msg.buttons.map((btn, i) => (
                        <button
                          key={i}
                          className="chat-choice-btn"
                          onClick={() => handleChoiceClick(btn.name)}
                        >
                          {btn.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start mt-2">
            <div className="chat-bubble-bot flex items-center space-x-2">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Weld Mentor..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="chat-send-btn" onClick={() => sendMessage()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
