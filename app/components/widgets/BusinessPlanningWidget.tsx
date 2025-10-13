"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface BusinessPlanningWidgetProps {
  onBack?: () => void;
}

export default function BusinessPlanningWidget({ onBack }: BusinessPlanningWidgetProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'market' | 'strategy'>('overview');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome to the Business Planning Widget! I\'m here to help you develop a comprehensive business plan. You can work on three key areas: Business Overview, Market Analysis, and Strategy Development. Which section would you like to focus on?',
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
        // Add context about the current section to the message
        const contextualMessage = `[Business Planning - ${activeSection}] ${message}`;
        
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: contextualMessage,
            context: 'business_planning',
            section: activeSection
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const agentData = await response.json();
        
        let responseContent = '';
        if (typeof agentData.response === 'string') {
          responseContent = agentData.response;
        } else if (agentData.response?.reply) {
          responseContent = agentData.response.reply;
        } else {
          responseContent = 'I\'m here to help with your business planning. Could you be more specific about what you need?';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

      } catch (error: any) {
        console.error('Business Planning Agent error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I\'m having trouble connecting right now. Let me help you with some business planning guidance based on your current section.',
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSectionChange = (section: 'overview' | 'market' | 'strategy') => {
    setActiveSection(section);
    
    const sectionMessages = {
      overview: 'Let\'s work on your Business Overview. I can help you define your mission, vision, products/services, and target customers.',
      market: 'Time for Market Analysis! I\'ll help you research your industry, competitors, and market opportunities.',
      strategy: 'Let\'s develop your Strategy! We\'ll work on your business model, marketing plan, and operational strategy.'
    };

    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: sectionMessages[section],
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <button onClick={handleBack} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Dashboard
        </button>
        <h2>Business Planning Widget</h2>
      </div>

      <div className="widget-content">
        {/* Section Navigation */}
        <div className="section-tabs">
          <button 
            className={`section-tab ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => handleSectionChange('overview')}
          >
            Business Overview
          </button>
          <button 
            className={`section-tab ${activeSection === 'market' ? 'active' : ''}`}
            onClick={() => handleSectionChange('market')}
          >
            Market Analysis
          </button>
          <button 
            className={`section-tab ${activeSection === 'strategy' ? 'active' : ''}`}
            onClick={() => handleSectionChange('strategy')}
          >
            Strategy Development
          </button>
        </div>

        {/* Chat Interface */}
        <div className="widget-chat">
          <div className="widget-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`widget-message widget-message--${msg.sender}`}>
                <div className="widget-message-avatar">
                  {msg.sender === 'assistant' ? (
                    <div className="widget-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="widget-user-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="widget-message-content">
                  <div className="widget-message-bubble">
                    <p>{msg.content}</p>
                    <span className="widget-message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="widget-message widget-message--assistant">
                <div className="widget-message-avatar">
                  <div className="widget-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <div className="widget-message-content">
                  <div className="widget-message-bubble widget-typing">
                    <div className="widget-typing-indicator">
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
        <form className="widget-form" onSubmit={handleSubmit}>
          <div className="widget-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask about ${activeSection === 'overview' ? 'business overview' : activeSection === 'market' ? 'market analysis' : 'strategy development'}...`}
              className="widget-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="widget-send-btn"
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
      </div>
    </div>
  );
}