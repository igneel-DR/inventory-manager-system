import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

const InventoryChat = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [thinking, setThinking] = useState([]);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [thinkingInterval, setThinkingIntervalId] = useState(null);
  const { token } = useAuth();
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversations]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');

    // Add user message to conversation
    setConversations(prev => [...prev, { 
      id: Date.now(), 
      text: userMessage, 
      sender: 'user' 
    }]);

    setLoading(true);

    // Default thinking steps (will be replaced by server response if available)
    const defaultThinking = [
      "Understanding your question...",
      "Analyzing inventory database schema...",
      "Translating to database query...",
      "Validating query safety...",
      "Executing database query...",
      "Formatting results into natural language...",
      "Preparing final response..."
    ];

    setThinking(defaultThinking);
    setThinkingIndex(0);

    // Start thinking animation
    const interval = setInterval(() => {
      setThinkingIndex(prev => {
        if (prev < defaultThinking.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    setThinkingIntervalId(interval);

    try {
      // Send message to backend API
      const baseUrl = import.meta.env.VITE_API_URL;
      // Remove trailing slash if present in VITE_API_URL
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // Debug the actual URL being constructed
      const apiUrl = `${cleanBaseUrl}/chat/query`;

      const response = await axios.post(
        apiUrl,
        { message: userMessage },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // If server returned thinking steps, update with those
        if (response.data.thinking && Array.isArray(response.data.thinking)) {
          setThinking(response.data.thinking);
          setThinkingIndex(response.data.thinking.length - 1);
        }

        // Add assistant response to conversation
        setConversations(prev => [...prev, { 
          id: Date.now() + 1, 
          text: response.data.response,
          originalQuery: userMessage,
          sqlQuery: response.data.sqlQuery,
          results: response.data.results,
          thinking: response.data.thinking,
          sender: 'assistant' 
        }]);
      } else {
        // Add error message to conversation
        setConversations(prev => [...prev, { 
          id: Date.now() + 1, 
          text: 'Sorry, I encountered an error processing your request.',
          error: true,
          sender: 'assistant' 
        }]);

        toast.error('Error processing your request. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to conversation
      setConversations(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Sorry, I encountered an error processing your request. Please try again later.',
        error: true,
        sender: 'assistant' 
      }]);

      toast.error(error.response?.data?.message || 'Network error');
    } finally {
      // Clear thinking animation
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
        setThinkingIntervalId(null);
      }
      setThinking([]);
      setThinkingIndex(0);
      setLoading(false);

      // Focus on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Clear all conversations
  const handleClear = () => {
    setConversations([]);
    toast.success('All messages have been cleared');
  };

  // Format the message text with line breaks
  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-120px)]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Inventory Assistant</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={conversations.length === 0 || loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <div className="mb-2">
                  <p className="text-lg font-medium">How can I help you today?</p>
                  <p className="text-sm mt-1">Ask me about inventory, stock levels, products, suppliers, etc.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 w-full max-w-md">
                  {["What products are low on stock?", 
                    "Show me products from supplier X",
                    "شنو سالا اليوم؟", // Arabic: "What ran out today?"
                    "Quels produits sont presque finis?" // French: "What products are almost finished?"
                  ].map((suggestion) => (
                    <Button 
                      key={suggestion} 
                      variant="outline" 
                      className="text-sm h-auto py-2 justify-start"
                      onClick={() => {
                        setMessage(suggestion);
                        setTimeout(() => {
                          if (inputRef.current) {
                            inputRef.current.focus();
                          }
                        }, 0);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              conversations.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.error
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMessageText(msg.text)}
                    </div>

                    {msg.sqlQuery && (
                      <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium">Show SQL Query</summary>
                          <pre className="mt-2 p-2 bg-muted-foreground/10 rounded overflow-auto">
                            {msg.sqlQuery}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start mb-2">
                <div className="bg-muted px-4 py-3 rounded-lg w-full max-w-[85%]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">AI Assistant is thinking</div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>

                    {thinking.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1 mt-1">
                        {thinking.map((step, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center ${index <= thinkingIndex ? 'opacity-100' : 'opacity-40'}`}
                          >
                            <div className="w-4 h-4 mr-2 flex-shrink-0">
                              {index < thinkingIndex ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : index === thinkingIndex ? (
                                <svg className="animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 ml-1"></div>
                              )}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask about inventory, stock levels, products..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || loading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default InventoryChat; 