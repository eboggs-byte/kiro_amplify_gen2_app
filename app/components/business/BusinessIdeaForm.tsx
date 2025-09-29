"use client";

import React, { useState } from 'react';

export interface BusinessIdeaData {
  businessIdea: string;
  targetMarket: string;
}

interface BusinessIdeaFormProps {
  onFormChange: (data: BusinessIdeaData) => void;
  initialData?: BusinessIdeaData;
}

export default function BusinessIdeaForm({ onFormChange, initialData }: BusinessIdeaFormProps) {
  const [formData, setFormData] = useState<BusinessIdeaData>({
    businessIdea: initialData?.businessIdea || '',
    targetMarket: initialData?.targetMarket || ''
  });

  const handleInputChange = (field: keyof BusinessIdeaData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  const isComplete = formData.businessIdea.trim() && formData.targetMarket.trim();

  return (
    <div style={{
      padding: '32px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
        }}>
          💡
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Business Idea Validator
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          Share your business idea and target market. Claude will provide personalized feedback and insights.
        </p>
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Business Idea Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            What's your business idea? *
          </label>
          <textarea
            value={formData.businessIdea}
            onChange={(e) => handleInputChange('businessIdea', e.target.value)}
            placeholder="Describe your business concept, product, or service idea in detail..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Target Market Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Who is your target market? *
          </label>
          <textarea
            value={formData.targetMarket}
            onChange={(e) => handleInputChange('targetMarket', e.target.value)}
            placeholder="Describe your ideal customers, their demographics, needs, and pain points..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Progress Indicator */}
        <div style={{
          padding: '16px',
          background: isComplete ? '#dcfce7' : '#f8fafc',
          borderRadius: '12px',
          border: `1px solid ${isComplete ? '#10b981' : '#e2e8f0'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: isComplete ? '#10b981' : '#e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {isComplete ? '✓' : ''}
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isComplete ? '#059669' : '#6b7280'
            }}>
              {isComplete ? 'Ready for AI feedback!' : 'Fill out both fields to get started'}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            The more detailed your responses, the better feedback Claude can provide.
          </p>
        </div>
      </div>
    </div>
  );
}