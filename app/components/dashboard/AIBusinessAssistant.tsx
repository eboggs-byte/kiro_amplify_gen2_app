"use client";

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface AIBusinessAssistantProps {
  onSendMessage?: (message: string) => void;
}

export default function AIBusinessAssistant({ onSendMessage }: AIBusinessAssistantProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Business Assistant. I can help you with business planning, market research, financial projections, and much more. What would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(message),
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        onSendMessage?.(message);
      }, 1500);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Let me help you with that. Based on your business idea, I'd recommend starting with market research to validate your concept.",
      "I can definitely help you with that! Let's break this down into actionable steps. First, let's identify your target market and competition.",
      "Excellent! This is a common challenge for new businesses. Let me provide you with a structured approach to tackle this.",
      "Great question! I'll help you create a comprehensive plan for this. Let's start by understanding your current situation and goals.",
      "I'm here to help! Let me provide you with some expert guidance on this topic. Here's what I recommend..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const quickPrompts = [
    'Help me write a business plan',
    'What licenses do I need?',
    'Create a marketing strategy',
    'Calculate startup costs'
  ];

  return (
    <div className="ai-business-assistant">
      <div className="ai-business-assistant-header">
        <h3 className="ai-business-assistant-title">AI Business Assistant</h3>
        <p className="ai-business-assistant-subtitle">
          Describe your business idea or ask for help with any aspect of starting your business.
        </p>
      </div>

      {/* Chat Messages Area */}
      <div className="ai-business-assistant-chat">
        <div className="ai-business-assistant-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-business-assistant-message ai-business-assistant-message--${msg.sender}`}>
              <div className="ai-business-assistant-message-avatar">
                {msg.sender === 'assistant' ? (
                  <div className="ai-business-assistant-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                ) : (
                  <div className="ai-business-assistant-user-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="ai-business-assistant-message-content">
                <div className="ai-business-assistant-message-bubble">
                  <p>{msg.content}</p>
                  <span className="ai-business-assistant-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ai-business-assistant-message ai-business-assistant-message--assistant">
              <div className="ai-business-assistant-message-avatar">
                <div className="ai-business-assistant-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              <div className="ai-business-assistant-message-content">
                <div className="ai-business-assistant-message-bubble ai-business-assistant-typing">
                  <div className="ai-business-assistant-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form className="ai-business-assistant-form" onSubmit={handleSubmit}>
        <div className="ai-business-assistant-input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your business idea, or ask me anything about starting a business."
            className="ai-business-assistant-input"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="ai-business-assistant-send-btn"
            disabled={!message.trim() || isTyping}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            Send
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="ai-business-assistant-quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            className="ai-business-assistant-quick-prompt"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isTyping}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}