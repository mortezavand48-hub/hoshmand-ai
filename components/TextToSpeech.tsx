import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';
import { SpeakerIcon, PlayIcon } from './icons';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('سلام! من Gemini هستم، یک مدل زبان بزرگ. من می‌توانم متن را به گفتار با صدای طبیعی تبدیل کنم.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('لطفاً متنی برای تولید گفتار وارد کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioBuffer(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        setAudioBuffer(buffer);
        // Automatically play the audio
        playAudio(buffer, outputAudioContext);
      } else {
        throw new Error("داده صوتی از API دریافت نشد.");
      }

    } catch (e) {
      console.error(e);
      setError('در هنگام تولید گفتار خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (buffer: AudioBuffer, context: AudioContext) => {
    if (!context) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  };
  
  const handleReplay = () => {
    if (audioBuffer) {
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        playAudio(audioBuffer, outputAudioContext);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">تبدیل متن به گفتار</h2>
        <p className="text-gray-400">متن را با Gemini به صدای با کیفیت تبدیل کنید.</p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="متن مورد نظر برای تبدیل به گفتار را وارد کنید..."
          className="w-full h-40 p-3 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          disabled={isLoading}
        />
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerateSpeech}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <SpeakerIcon />}
            {isLoading ? 'در حال تولید...' : 'تولید گفتار'}
          </button>
          
          {audioBuffer && (
             <button
                onClick={handleReplay}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <PlayIcon />
                پخش مجدد
              </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-400 text-center">{error}</p>}
    </div>
  );
};

export default TextToSpeech;
