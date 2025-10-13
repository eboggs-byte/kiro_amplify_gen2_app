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

interface FinanceFundingWidgetProps {
  onBack?: () => void;
}

export default function FinanceFundingWidget({ onBack }: FinanceFundingWidgetProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'projections' | 'funding' | 'budgeting'>('projections');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome to the Finance & Funding Widget! I\'m your financial planning assistant. I can help you with Financial Projections, Funding Options, and Budgeting & Cash Flow. Which area would you like to explore first?',
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
        const contextualMessage = `[Finance & Funding - ${activeSection}] ${message}`;
        
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: contextualMessage,
            context: 'finance_funding',
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
          responseContent = 'I\'m here to help with your financial planning. Could you be more specific about what you need?';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

      } catch (error: any) {
        console.error('Finance & Funding Agent error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I\'m having trouble connecting right now. Let me help you with some financial planning guidance based on your current section.',
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSectionChange = (section: 'projections' | 'funding' | 'budgeting') => {
    setActiveSection(section);
    
    const sectionMessages = {
      projections: 'Let\'s work on your Financial Projections. I can help you create revenue forecasts, expense planning, and profit/loss projections.',
      funding: 'Time to explore Funding Options! I\'ll help you understand different funding sources, investment requirements, and funding strategies.',
      budgeting: 'Let\'s focus on Budgeting & Cash Flow. We\'ll work on cash flow management, budget planning, and financial controls.'
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
        <h2>Finance & Funding Widget</h2>
      </div>

      <div className="widget-content">
        {/* Section Navigation */}
        <div className="section-tabs">
          <button 
            className={`section-tab ${activeSection === 'projections' ? 'active' : ''}`}
            onClick={() => handleSectionChange('projections')}
          >
            Financial Projections
          </button>
          <button 
            className={`section-tab ${activeSection === 'funding' ? 'active' : ''}`}
            onClick={() => handleSectionChange('funding')}
          >
            Funding Options
          </button>
          <button 
            className={`section-tab ${activeSection === 'budgeting' ? 'active' : ''}`}
            onClick={() => handleSectionChange('budgeting')}
          >
            Budgeting & Cash Flow
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
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
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
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
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
              placeholder={`Ask about ${activeSection === 'projections' ? 'financial projections' : activeSection === 'funding' ? 'funding options' : 'budgeting & cash flow'}...`}
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