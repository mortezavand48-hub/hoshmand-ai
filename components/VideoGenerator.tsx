import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import LoadingSpinner from './LoadingSpinner';

const loadingMessages = [
  "در حال احضار بازیگران دیجیتال...",
  "کالیبره کردن ماشین رویاپردازی...",
  "آموزش رقص به پیکسل‌ها...",
  "رندر کردن واقعیت‌های جایگزین...",
  "این فرآیند ممکن است چند دقیقه طول بکشد، صبور باشید!",
  "ساخت سمفونی از نور و صدا...",
  "بافتن خطوط زمانی در یک روایت بصری...",
  "هوش مصنوعی در حال نقاشی با نور است، لطفاً منتظر بمانید...",
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('یک شیر باشکوه با تاج، جزئیات سینمایی 4k');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Effect to clean up the object URL and prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('لطفاً یک درخواست وارد کنید.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio,
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(prevUrl => {
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl);
            }
            return URL.createObjectURL(videoBlob);
          });
      } else {
        throw new Error('تولید ویدیو به پایان رسید اما URI ویدیویی یافت نشد.');
      }
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'در حین تولید ویدیو خطایی رخ داد. لطفاً دوباره تلاش کنید.';
      if (e.message && e.message.includes('Requested entity was not found')) {
        errorMessage = "کلید API یافت نشد یا نامعتبر است. لطفاً به تب 'تنظیمات' رفته و یک کلید معتبر انتخاب کنید.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">تولید ویدیو با Veo</h2>
        <p className="text-gray-400">از روی متن، ویدیوهای باکیفیت بسازید.</p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="درخواست خود برای ویدیو را وارد کنید..."
          className="w-full p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          rows={3}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-gray-300 font-medium">نسبت تصویر:</label>
            <div className="flex gap-2">
              <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-1 rounded-md text-sm ${aspectRatio === '16:9' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>افقی (16:9)</button>
              <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-1 rounded-md text-sm ${aspectRatio === '9:16' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>عمودی (9:16)</button>
            </div>
          </div>
           <div className="flex items-center gap-2">
            <label className="text-gray-300 font-medium">کیفیت تصویر:</label>
            <div className="flex gap-2">
              <button onClick={() => setResolution('720p')} className={`px-4 py-1 rounded-md text-sm ${resolution === '720p' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>720p</button>
              <button onClick={() => setResolution('1080p')} className={`px-4 py-1 rounded-md text-sm ${resolution === '1080p' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>1080p</button>
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto self-start px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? 'در حال تولید...' : 'تولید ویدیو'}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 border border-gray-700 rounded-lg">
          <LoadingSpinner size="lg" />
          <p className="text-blue-300 text-lg animate-pulse">{loadingMessage}</p>
        </div>
      )}

      {error && <p className="text-red-400 text-center">{error}</p>}
      
      {videoUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">ویدیوی تولید شده:</h3>
          <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;