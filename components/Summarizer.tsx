import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import LoadingSpinner from './LoadingSpinner';

const Summarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('لطفاً متنی برای خلاصه‌سازی وارد کنید.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        contents: `لطفاً متن زیر را به زبان فارسی خلاصه کن:\n\n${inputText}`,
      });

      for await (const chunk of responseStream) {
        setSummary((prev) => prev + chunk.text);
      }

    } catch (e) {
      console.error(e);
      setError('در هنگام تولید خلاصه خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">خلاصه‌ساز سریع</h2>
        <p className="text-gray-400">خلاصه‌های سریع و روان را با Gemini Flash Lite دریافت کنید.</p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="متنی که می‌خواهید خلاصه شود را اینجا جای‌گذاری کنید..."
          className="w-full h-48 p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          disabled={isLoading}
        />
        <button
          onClick={handleSummarize}
          disabled={isLoading}
          className="w-full sm:w-auto self-start px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading ? 'در حال خلاصه‌سازی...' : 'خلاصه کن'}
        </button>
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {summary && (
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">خلاصه:</h3>
          <p className="text-gray-200 whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
