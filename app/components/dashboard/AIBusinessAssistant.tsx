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

      try {
        console.log('🚀 Calling /api/agents with message:', message);
        
        // Call your existing agents API
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message }),
        });
        
        console.log('📡 API response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const agentData = await response.json();
        console.log('📥 Agent response data:', agentData);

        if (agentData.error) {
          throw new Error(agentData.error);
        }

        // Handle different response formats from your agents
        let responseContent = '';
        
        if (typeof agentData.response === 'string') {
          responseContent = agentData.response;
        } else if (agentData.response && typeof agentData.response === 'object') {
          // Handle object responses like {reply, state}
          if (agentData.response.reply) {
            responseContent = agentData.response.reply;
          } else if (agentData.response.message) {
            responseContent = agentData.response.message;
          } else if (agentData.response.content) {
            responseContent = agentData.response.content;
          } else {
            // Fallback: stringify the object
            responseContent = JSON.stringify(agentData.response, null, 2);
          }
        } else {
          responseContent = agentData.response || 'No response from agents';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        onSendMessage?.(message);

      } catch (error: any) {
        console.error('❌ Agent connection failed:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Connection failed: ${error.message}. Make sure your agents are running at http://localhost:8080/invoke`,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Removed generateAIResponse - now using real agents

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