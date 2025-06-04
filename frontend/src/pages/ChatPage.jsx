import React from 'react';
import InventoryChat from '../components/chat/InventoryChat';

const ChatPage = () => {
  return (
    <div className="container px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">AI Inventory Assistant</h1>
      <p className="text-muted-foreground mb-6">
        Ask questions about inventory in natural language (English, Arabic, French). 
        The AI assistant will analyze inventory data and provide insights.
      </p>
      
      <InventoryChat />
    </div>
  );
};

export default ChatPage; 