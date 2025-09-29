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
      background: '#f8fafc'
    }}>
      {/* Left Pane - Business Form */}
      <div style={{
        width: '40%',
        minWidth: '400px',
        maxWidth: '600px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)'
      }}>
        {leftPane}
      </div>

      {/* Right Pane - Chatbot */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc'
      }}>
        {rightPane}
      </div>
    </div>
  );
}