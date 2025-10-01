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
      padding: '40px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1f2937',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Validate Your Vision
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#d1d5db',
          lineHeight: '1.6'
        }}>
          AI-Powered Strategy & Marketing Intelligence
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
            color: 'white',
            marginBottom: '12px'
          }}>
            What's your business idea? *
          </label>
          <textarea
            value={formData.businessIdea}
            onChange={(e) => handleInputChange('businessIdea', e.target.value)}
            placeholder="What's your business idea?"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              background: '#374151',
              color: 'white'
            }}
            onFocus={(e) => {
              e.target.style.background = '#4b5563';
            }}
            onBlur={(e) => {
              e.target.style.background = '#374151';
            }}
          />
        </div>

        {/* Target Market Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            Who is your target market? *
          </label>
          <textarea
            value={formData.targetMarket}
            onChange={(e) => handleInputChange('targetMarket', e.target.value)}
            placeholder="Who is your target market?"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              background: '#374151',
              color: 'white'
            }}
            onFocus={(e) => {
              e.target.style.background = '#4b5563';
            }}
            onBlur={(e) => {
              e.target.style.background = '#374151';
            }}
          />
        </div>

        {/* Progress Indicator */}
        <div style={{
          padding: '20px',
          background: isComplete ? '#065f46' : '#374151',
          borderRadius: '12px',
          border: `1px solid ${isComplete ? '#10b981' : '#4b5563'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: isComplete ? '#10b981' : '#6b7280',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {isComplete ? '✓' : '...'}
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isComplete ? '#34d399' : '#d1d5db'
            }}>
              {isComplete ? 'Ready for AI feedback!' : 'Fill out both fields to get started'}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#9ca3af',
            lineHeight: '1.4'
          }}>
            The more detailed your responses, the better feedback Claude can provide.
          </p>
        </div>
      </div>
    </div>
  );
}