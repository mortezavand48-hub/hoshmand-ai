import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';
import { ImageIcon } from './icons';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('در این تصویر چه می‌بینی؟');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to clean up the object URL and prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Revoke the old URL before creating a new one to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis('');
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !prompt.trim()) {
      setError('لطفاً یک تصویر انتخاب کرده و یک درخواست وارد کنید.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Image = await fileToBase64(image);

      const imagePart = {
        inlineData: {
          mimeType: image.type,
          data: base64Image,
        },
      };
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
      });

      setAnalysis(response.text);
    } catch (e) {
      console.error(e);
      setError('در حین تحلیل خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">تحلیل‌گر تصویر</h2>
        <p className="text-gray-400">یک تصویر بارگذاری کنید و از Gemini در مورد آن سؤال بپرسید.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          {previewUrl ? (
            <img src={previewUrl} alt="پیش‌نمایش" className="max-h-64 rounded-lg object-contain" />
          ) : (
            <>
              <ImageIcon />
              <p className="mt-2 text-gray-400">برای بارگذاری تصویر کلیک کنید</p>
            </>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="درخواست خود را اینجا وارد کنید..."
            className="w-full flex-grow p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            rows={5}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !image}
            className="w-full px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {isLoading ? 'در حال تحلیل...' : 'تحلیل تصویر'}
          </button>
        </div>
      </div>
      
      {error && <p className="text-red-400 text-center">{error}</p>}

      {analysis && (
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">نتیجه تحلیل:</h3>
          <p className="text-gray-200 whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;