import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import { MicIcon, StopIcon } from './icons';

const LiveConversation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionHistory, setTranscriptionHistory] = useState<{ type: 'user' | 'model'; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopAudioPlayback = () => {
    if (outputAudioContextRef.current) {
        audioQueueRef.current.forEach(source => {
            source.stop();
        });
        audioQueueRef.current.clear();
        nextStartTimeRef.current = 0;
    }
  };

  const startConversation = async () => {
    if (isRecording) return;
    setIsRecording(true);
    setError(null);
    setTranscriptionHistory([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('Session opened.');
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current && outputNodeRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioQueueRef.current.add(source);
                source.onended = () => audioQueueRef.current.delete(source);
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
                stopAudioPlayback();
            }

            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscription.current.trim();
              const fullOutput = currentOutputTranscription.current.trim();
              setTranscriptionHistory(prev => {
                const newHistory = [...prev];
                if (fullInput) newHistory.push({ type: 'user', text: fullInput });
                if (fullOutput) newHistory.push({ type: 'model', text: fullOutput });
                return newHistory;
              });
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }
          },
          onerror: (e) => {
            console.error('خطای جلسه:', e);
            setError('خطایی در مکالمه رخ داد. لطفاً دوباره تلاش کنید.');
            stopConversation();
          },
          onclose: () => {
            console.log('Session closed.');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a helpful assistant. Please respond in Persian.',
        },
      });
    } catch (e) {
      console.error(e);
      setError('شروع مکالمه با شکست مواجه شد. دسترسی میکروفون را بررسی کنید.');
      setIsRecording(false);
    }
  };

  const stopConversation = useCallback(async () => {
    if (!isRecording) return;
    
    if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        stopAudioPlayback();
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    
    setIsRecording(false);
  }, [isRecording]);

  useEffect(() => {
    return () => {
        stopConversation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">مکالمه زنده</h2>
        <p className="text-gray-400">با Gemini به صورت زنده صحبت کنید. صدای شما رونویسی شده و پاسخ آن را خواهید شنید.</p>
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={isRecording ? stopConversation : startConversation}
          className={`p-4 rounded-full transition-colors text-white ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRecording ? <StopIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
        </button>
      </div>
      
      {error && <p className="text-red-400 text-center">{error}</p>}
      
      <div className="bg-gray-900/50 p-4 rounded-lg min-h-[200px] flex flex-col gap-3">
        {transcriptionHistory.length === 0 && !isRecording && (
          <p className="text-gray-500 text-center m-auto">برای شروع مکالمه، دکمه میکروفون را فشار دهید.</p>
        )}
        {transcriptionHistory.length === 0 && isRecording && (
           <p className="text-gray-400 text-center m-auto">در حال شنیدن...</p>
        )}
        {transcriptionHistory.map((item, index) => (
          <div key={index} className={`p-2 rounded-lg ${item.type === 'user' ? 'bg-blue-900/50 self-end' : 'bg-gray-700/50 self-start'}`}>
            <p className="text-gray-200">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveConversation;
