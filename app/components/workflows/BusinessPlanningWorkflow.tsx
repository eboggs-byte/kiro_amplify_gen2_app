"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface BusinessPlanningWorkflowProps {
  onBack?: () => void;
}

export default function BusinessPlanningWorkflow({ onBack }: BusinessPlanningWorkflowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2); // Financial Planning step (0-indexed)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'I can help you with financial planning questions and provide industry benchmarks.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Investment form data
  const [investmentData, setInvestmentData] = useState({
    equipment: '',
    inventory: '',
    marketing: '',
    workingCapital: '',
    additionalNotes: ''
  });

  const steps: WorkflowStep[] = [
    { id: 'overview', title: 'Business Overview', status: 'completed' },
    { id: 'market', title: 'Market Analysis', status: 'completed' },
    { id: 'financial', title: 'Financial Planning', status: 'current' },
    { id: 'operations', title: 'Operations Plan', status: 'upcoming' },
    { id: 'marketing', title: 'Marketing Strategy', status: 'upcoming' },
    { id: 'risk', title: 'Risk Assessment', status: 'upcoming' },
    { id: 'implementation', title: 'Implementation', status: 'upcoming' },
    { id: 'review', title: 'Review & Finalize', status: 'upcoming' }
  ];

  const questions = [
    {
      title: 'Initial Investment Requirements',
      subtitle: 'Question 1 of 5 in this section',
      description: 'What is your estimated initial investment requirement to start your business? Please break down the major categories of expenses.'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    const equipment = parseFloat(investmentData.equipment) || 0;
    const inventory = parseFloat(investmentData.inventory) || 0;
    const marketing = parseFloat(investmentData.marketing) || 0;
    const workingCapital = parseFloat(investmentData.workingCapital) || 0;
    return equipment + inventory + marketing + workingCapital;
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: aiMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, userMessage]);
      setAiMessage('');
      setIsAiTyping(true);

      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: `[Business Planning Workflow - Financial Planning] ${aiMessage}`,
            context: 'business_planning_workflow',
            section: 'financial_planning'
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

        setAiMessages(prev => [...prev, assistantMessage]);

      } catch (error: any) {
        console.error('AI Assistant error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I\'m having trouble connecting right now. Let me help you with some financial planning guidance.',
          sender: 'assistant',
          timestamp: new Date()
        };

        setAiMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  const handleNextQuestion = () => {
    // Handle navigation to next question/step
    console.log('Next question clicked');
  };

  const handlePreviousQuestion = () => {
    // Handle navigation to previous question
    console.log('Previous question clicked');
  };

  const handleSkipForNow = () => {
    // Handle skip functionality
    console.log('Skip for now clicked');
  };

  return (
    <div className="workflow-container">
      {/* Header */}
      <div className="workflow-header">
        <div className="workflow-header-left">
          <button onClick={handleBack} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          <div className="workflow-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
            </svg>
            <span>PlanFlow</span>
          </div>
        </div>
        <div className="workflow-header-nav">
          <button className="nav-button active">Dashboard</button>
          <button className="nav-button">Templates</button>
          <button className="nav-button">Analytics</button>
          <button className="nav-button">Help</button>
        </div>
        <div className="workflow-header-right">
          <button className="notification-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <div className="user-avatar">
            <img src="/api/placeholder/32/32" alt="User" />
          </div>
        </div>
      </div>

      <div className="workflow-content">
        {/* Sidebar */}
        <div className="workflow-sidebar">
          <div className="workflow-progress">
            <h3>Business Planning Workflow</h3>
            <div className="progress-info">
              <span>Progress</span>
              <span>3 of 8</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '37.5%' }}></div>
            </div>
          </div>

          <div className="workflow-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`workflow-step workflow-step--${step.status}`}>
                <div className="step-indicator">
                  {step.status === 'completed' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  ) : step.status === 'current' ? (
                    <span>{index + 1}</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-status">
                    {step.status === 'completed' ? 'Completed' : 
                     step.status === 'current' ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-tip">
            <div className="quick-tip-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Quick Tip
            </div>
            <p>Answer honestly and thoroughly. You can always revise your responses later.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="workflow-main">
          <div className="workflow-question">
            <div className="question-header">
              <h1>Financial Planning</h1>
              <p>Step 3 of 8 - Let's analyze your financial projections and requirements</p>
              <div className="question-actions">
                <button className="save-draft-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Draft
                </button>
                <button className="previous-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Previous
                </button>
              </div>
            </div>

            <div className="question-content">
              <div className="question-section">
                <div className="section-header">
                  <div className="section-number">3</div>
                  <div className="section-info">
                    <h2>Initial Investment Requirements</h2>
                    <p>Question 1 of 5 in this section</p>
                  </div>
                </div>

                <p className="question-description">
                  What is your estimated initial investment requirement to start your business? Please break down the major categories of expenses.
                </p>

                <div className="investment-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Equipment & Technology</label>
                      <div className="input-with-currency">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          value={investmentData.equipment}
                          onChange={(e) => handleInputChange('equipment', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Inventory & Supplies</label>
                      <div className="input-with-currency">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          value={investmentData.inventory}
                          onChange={(e) => handleInputChange('inventory', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Marketing & Branding</label>
                      <div className="input-with-currency">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          value={investmentData.marketing}
                          onChange={(e) => handleInputChange('marketing', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Working Capital</label>
                      <div className="input-with-currency">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          value={investmentData.workingCapital}
                          onChange={(e) => handleInputChange('workingCapital', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field full-width">
                    <label>Additional Notes</label>
                    <textarea
                      value={investmentData.additionalNotes}
                      onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                      placeholder="Describe any additional investment requirements or special considerations..."
                      rows={4}
                    />
                  </div>

                  <div className="total-investment">
                    <span>Total Estimated Investment</span>
                    <span className="total-amount">${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="question-navigation">
                <button onClick={handlePreviousQuestion} className="nav-button secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Previous Question
                </button>
                <div className="question-info">
                  <span>1 of 5 questions</span>
                </div>
                <div className="nav-buttons-right">
                  <button onClick={handleSkipForNow} className="nav-button tertiary">
                    Skip for Now
                  </button>
                  <button onClick={handleNextQuestion} className="nav-button primary">
                    Next Question
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="ai-assistant-sidebar">
          <div className="ai-assistant-header">
            <h3>Need Help?</h3>
            <div className="ai-assistant-info">
              <div className="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <div className="ai-title">AI Assistant</div>
                <div className="ai-description">I can help you with financial planning questions and provide industry benchmarks.</div>
              </div>
            </div>
            <button 
              className="ask-ai-button"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              Ask AI Assistant
            </button>
          </div>

          {showAIAssistant && (
            <div className="ai-chat-container">
              <div className="ai-messages">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`ai-message ai-message--${msg.sender}`}>
                    <div className="ai-message-content">
                      <p>{msg.content}</p>
                      <span className="ai-message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="ai-message ai-message--assistant">
                    <div className="ai-message-content ai-typing">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <form className="ai-input-form" onSubmit={handleAiSubmit}>
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ask about financial planning..."
                  className="ai-input"
                  disabled={isAiTyping}
                />
                <button 
                  type="submit" 
                  className="ai-send-button"
                  disabled={!aiMessage.trim() || isAiTyping}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                  </svg>
                </button>
              </form>
            </div>
          )}

          <div className="helpful-resources">
            <h4>Helpful Resources</h4>
            <div className="resource-item">
              <div className="resource-icon startup-cost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="resource-title">Startup Cost Calculator</div>
                <div className="resource-description">Download our comprehensive calculator to estimate your startup costs.</div>
              </div>
            </div>

            <div className="resource-item">
              <div className="resource-icon industry-benchmarks">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <div>
                <div className="resource-title">Industry Benchmarks</div>
                <div className="resource-description">Compare your estimates with industry standards and averages.</div>
              </div>
            </div>

            <div className="resource-item">
              <div className="resource-icon video-tutorial">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23,7 16,12 23,17 23,7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <div>
                <div className="resource-title">Video Tutorial</div>
                <div className="resource-description">Watch our 5-minute guide on financial planning for startups.</div>
              </div>
            </div>
          </div>

          <div className="progress-summary">
            <h4>Your Progress</h4>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Questions Answered</span>
                <span className="stat-value">12/35</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time Spent</span>
                <span className="stat-value">45 min</span>
              </div>
              <div className="stat">
                <span className="stat-label">Estimated Completion</span>
                <span className="stat-value">2h 15min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}