import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';
import { VideoIcon } from './icons';

const FRAME_COUNT = 8; // Number of frames to extract

const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('خلاصه اتفاقات این ویدیو را بگو.');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Cleanup function to revoke the object URL and prevent memory leaks
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      // Revoke the old URL before creating a new one
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis('');
      setError(null);
      setProgress('');
    } else {
      setError('لطفاً یک فایل ویدیویی معتبر انتخاب کنید.');
    }
  };

  const extractFrames = (): Promise<{ mimeType: string; data: string }[]> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !videoUrl) {
        return reject('عنصر ویدیو آماده نیست.');
      }
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const frames: { mimeType: string; data: string }[] = [];
      let framesExtracted = 0;
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        const interval = duration / (FRAME_COUNT + 1);

        const captureFrame = (time: number) => {
          video.currentTime = time;
        };
        
        video.onseeked = async () => {
          if (framesExtracted < FRAME_COUNT && context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            frames.push({
                mimeType: 'image/jpeg',
                data: dataUrl.split(',')[1],
            });
            framesExtracted++;
            setProgress(`در حال استخراج فریم‌ها... ${framesExtracted}/${FRAME_COUNT}`);
            if (framesExtracted < FRAME_COUNT) {
              captureFrame((framesExtracted + 1) * interval);
            } else {
              video.onseeked = null; // Clean up listener
              resolve(frames);
            }
          }
        };

        captureFrame(interval);
      };

      video.onerror = () => reject('خطا در بارگذاری ویدیو.');
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile || !prompt.trim()) {
      setError('لطفاً یک ویدیو انتخاب کرده و یک درخواست وارد کنید.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      setProgress('در حال استخراج فریم‌ها... 0/' + FRAME_COUNT);
      const frames = await extractFrames();
      setProgress('فریم‌ها استخراج شدند. در حال تحلیل با Gemini Pro...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const frameParts = frames.map(frame => ({
        inlineData: { mimeType: frame.mimeType, data: frame.data }
      }));
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [textPart, ...frameParts] },
      });

      setAnalysis(response.text);
    } catch (e) {
      console.error(e);
      setError('در حین تحلیل خطایی رخ داد. این مدل قدرتمند است اما ممکن است با برخی ویدیوها محدودیت داشته باشد. لطفاً دوباره یا با ویدیوی دیگری امتحان کنید.');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">تحلیل‌گر ویدیو</h2>
        <p className="text-gray-400">محتوای ویدیویی را با استخراج فریم‌های کلیدی توسط Gemini Pro تحلیل کنید.</p>
      </div>

      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl} muted className="max-h-64 rounded-lg" controls={!isLoading} />
        ) : (
          <>
            <VideoIcon />
            <p className="mt-2 text-gray-400">برای بارگذاری ویدیو کلیک کنید</p>
          </>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="درخواست خود را اینجا وارد کنید..."
          className="w-full p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          rows={3}
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !videoFile}
          className="w-full sm:w-auto self-start px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading ? 'در حال تحلیل...' : 'تحلیل ویدیو'}
        </button>
      </div>
      
      {isLoading && progress && <p className="text-blue-300 text-center">{progress}</p>}
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

export default VideoAnalyzer;