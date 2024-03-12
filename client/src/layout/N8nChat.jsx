import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Loader2, MessageSquare, Send, X, Moon, Sun } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

const N8nChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { theme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme);

  const darkMode = localTheme === "dark";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8082/api/v1/webhook/chat/send",
        { userId, message: inputMessage }
      );

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.output,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your message. Please try again.",
        sender: "system",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors ${
          darkMode
            ? "bg-gray-800 text-blue-400 hover:bg-gray-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <MessageSquare className="h-8 w-8" />
        {messages.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center ${
              darkMode ? "bg-blue-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-full max-w-md h-[500px] flex flex-col rounded-lg shadow-xl z-50 transition-colors ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } border`}
    >
      <div
        className={`flex justify-between items-center p-4 rounded-t-lg ${
          darkMode ? "bg-gray-800 text-blue-400" : "bg-blue-600 text-white"
        }`}
      >
        <h2 className="text-lg font-semibold">Smart Learning Assistant</h2>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isLoading
                ? "bg-yellow-400 animate-pulse"
                : darkMode
                ? "bg-green-400"
                : "bg-green-300"
            }`}
          ></span>
          <span className="text-sm">
            {isLoading ? "Thinking..." : "Online"}
          </span>

        
          <button
            onClick={() => setLocalTheme(darkMode ? "light" : "dark")}
            className={`p-1 rounded-full ${
              darkMode
                ? "text-blue-400 hover:bg-gray-700"
                : "text-white hover:bg-blue-500"
            }`}
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded-full ${
              darkMode
                ? "text-blue-400 hover:bg-gray-700"
                : "text-white hover:bg-blue-500"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`flex-1 p-4 overflow-y-auto ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              How can I help you today?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-3 ${
                message.sender === "user"
                  ? "justify-end"
                  : message.sender === "bot"
                  ? "justify-start"
                  : "justify-center"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? darkMode
                      ? "bg-blue-700 text-white rounded-br-none"
                      : "bg-blue-600 text-white rounded-br-none"
                    : message.sender === "bot"
                    ? darkMode
                      ? "bg-gray-700 text-gray-100 rounded-bl-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: message.text }} />
                <span
                  className={`text-xs block mt-1 ${
                    message.sender === "user"
                      ? darkMode
                        ? "text-blue-200"
                        : "text-blue-100"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className={`flex p-3 border-t ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        } rounded-b-lg`}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 placeholder-gray-400"
              : "text-black border border-gray-300 focus:ring-blue-500"
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className={`ml-2 px-4 py-2 rounded-full flex items-center justify-center ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default N8nChat;
