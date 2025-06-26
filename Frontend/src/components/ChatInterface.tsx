import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Wallet,
  User,
  Bot,
  Plus,
  Menu,
  X,
  Trash2,
} from "lucide-react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([
    {
      id: "demo-1",
      title: "AI Assistant Help",
      messages: [
        {
          id: "demo-msg-1",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          sender: "ai",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: "demo-msg-2",
          content: "Can you help me understand how this platform works?",
          sender: "user",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        },
        {
          id: "demo-msg-3",
          content: "Of course! This platform allows you to manage cross-chain RWA investments using natural language commands. You can connect your wallet and start investing with simple text instructions.",
          sender: "ai",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
        },
      ],
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "demo-2",
      title: "Wallet Integration",
      messages: [
        {
          id: "demo-msg-4",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          sender: "ai",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: "demo-msg-5",
          content: "How do I connect my wallet to this platform?",
          sender: "user",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30000),
        },
        {
          id: "demo-msg-6",
          content: "You can connect your wallet using the Dynamic widget in the top-left corner of the landing page, or through the wallet connection options in the chat interface. We support both Ethereum and Solana wallets.",
          sender: "ai",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000),
        },
      ],
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate chat title from first user message
  const generateChatTitle = (firstUserMessage: string): string => {
    if (firstUserMessage.length <= 30) {
      return firstUserMessage;
    }
    return firstUserMessage.substring(0, 30) + "...";
  };

  // Save current chat to history
  const saveCurrentChat = () => {
    if (messages.length <= 1) return; // Don't save if only initial message

    const userMessages = messages.filter(msg => msg.sender === "user");
    if (userMessages.length === 0) return;

    const title = generateChatTitle(userMessages[0].content);
    const chatId = currentChatId || `chat-${Date.now()}`;
    
    const chatSession: ChatSession = {
      id: chatId,
      title,
      messages: [...messages],
      lastUpdated: new Date(),
    };

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(chat => chat.id === chatId);
      if (existingIndex >= 0) {
        // Update existing chat
        const updated = [...prev];
        updated[existingIndex] = chatSession;
        return updated;
      } else {
        // Add new chat
        return [chatSession, ...prev];
      }
    });

    setCurrentChatId(chatId);
  };

  // Start new chat
  const startNewChat = () => {
    // Save current chat before starting new one
    saveCurrentChat();
    
    // Reset to initial state
    setMessages([
      {
        id: Date.now().toString(),
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(null);
    setInput("");
    setIsSidebarOpen(false);
  };

  // Load chat from history
  const loadChat = (chatId: string) => {
    // Save current chat before loading another
    saveCurrentChat();
    
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages([...chat.messages]);
      setCurrentChatId(chatId);
      setIsSidebarOpen(false);
    }
  };

  // Delete chat from history
  const deleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering loadChat
    
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If we're currently viewing the deleted chat, start a new one
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you said: "${input}". This is a simulated response from the AI agent. In a real implementation, this would be connected to an actual AI service.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const connectWallet = async () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    setWalletAddress("0x1234...5678");
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-20 w-64 h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg`}
      >
        <div className="p-4 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold text-slate-800">
                AI Chat
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-sm font-medium text-slate-600 mb-2">
            Recent Chats
          </div>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`group p-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer relative ${
                  currentChatId === chat.id ? 'bg-slate-100/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800 truncate pr-2">
                      {chat.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatRelativeTime(chat.lastUpdated)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {chatHistory.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">
                No chat history yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-semibold text-slate-800">
                  AI Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isWalletConnected ? (
                <div className="flex items-center space-x-2 mr-48">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">
                    {walletAddress}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center mr-48 px-4 py-2">
                  {/* <ConnectButton /> */}
                  {/* <DynamicWidget /> */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`flex items-start space-x-3 max-w-md ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500"
                      : "bg-gradient-to-r from-slate-500 to-slate-600"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/80 backdrop-blur-sm text-slate-800 border border-slate-200/60"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-purple-100"
                        : "text-slate-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4">
          <div className="flex items-end space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                rows={1}
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                  height: "auto",
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;