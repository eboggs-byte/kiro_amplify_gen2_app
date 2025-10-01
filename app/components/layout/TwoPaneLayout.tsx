"use client";

import React from 'react';

interface TwoPaneLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export default function TwoPaneLayout({ leftPane, rightPane }: TwoPaneLayoutProps) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#f3f4f6',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Main Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#1f2937',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Left Pane - Business Form */}
        <div style={{
          width: '30%',
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #374151'
        }}>
          {leftPane}
        </div>

        {/* Right Pane - Chatbot */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {rightPane}
        </div>
      </div>
    </div>
  );
}