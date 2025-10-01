"use client";

import React, { useState } from 'react';
import TwoPaneLayout from '../layout/TwoPaneLayout';
import BusinessIdeaForm, { BusinessIdeaData } from '../business/BusinessIdeaForm';
import Chat from '../chat/Chat';

export default function BusinessDashboard() {
  const [businessData, setBusinessData] = useState<BusinessIdeaData>({
    businessIdea: '',
    targetMarket: ''
  });

  const handleFormChange = (data: BusinessIdeaData) => {
    setBusinessData(data);
  };

  return (
    <TwoPaneLayout
      leftPane={
        <BusinessIdeaForm
          onFormChange={handleFormChange}
          initialData={businessData}
        />
      }
      rightPane={
        <Chat businessData={businessData} />
      }
    />
  );
}