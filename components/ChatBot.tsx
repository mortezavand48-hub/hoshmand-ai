import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import { SendIcon, GeminiIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const ChatBot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and friendly assistant. Keep your responses concise and informative. Respond in Persian.',
        },
      });
      setChat(newChat);
    } catch (e) {
      setError('راه‌اندازی مدل هوش مصنوعی با مشکل مواجه شد. لطفاً کلید API خود را بررسی کنید.');
      console.error(e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chat.sendMessage({ message: input });
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      setError('در هنگام دریافت پاسخ خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      // remove the user message on error to allow resubmission
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl h-[calc(100vh-12rem)] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-200">چت با Gemini</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <GeminiIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-bl-none' : 'bg-gray-700 text-gray-200 rounded-br-none'}`}>
                 <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <GeminiIcon className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-br-none flex items-center">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="هر چیزی از Gemini بپرسید..."
            className="flex-grow bg-transparent text-gray-200 focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 text-blue-400 rounded-full hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
