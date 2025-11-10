import React, { useState, Suspense } from 'react';
import { ChatIcon, ImageIcon, VideoIcon, FilmIcon, MicIcon, SpeakerIcon, DocumentTextIcon, GeminiIcon, CodeIcon, SettingsIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';

type Tab = 'chat' | 'pluginBuilder' | 'image' | 'video' | 'generate' | 'live' | 'tts' | 'summarize' | 'settings';

// Lazy load components for better performance
const ChatBot = React.lazy(() => import('./components/ChatBot'));
const ImageAnalyzer = React.lazy(() => import('./components/ImageAnalyzer'));
const VideoAnalyzer = React.lazy(() => import('./components/VideoAnalyzer'));
const VideoGenerator = React.lazy(() => import('./components/VideoGenerator'));
const LiveConversation = React.lazy(() => import('./components/LiveConversation'));
const TextToSpeech = React.lazy(() => import('./components/TextToSpeech'));
const Summarizer = React.lazy(() => import('./components/Summarizer'));
const PluginBuilder = React.lazy(() => import('./components/PluginBuilder'));
const Settings = React.lazy(() => import('./components/Settings'));


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatBot />;
      case 'pluginBuilder':
        return <PluginBuilder />;
      case 'image':
        return <ImageAnalyzer />;
      case 'video':
        return <VideoAnalyzer />;
      case 'generate':
        return <VideoGenerator />;
      case 'live':
        return <LiveConversation />;
      case 'tts':
        return <TextToSpeech />;
      case 'summarize':
        return <Summarizer />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-center sm:text-right">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col" dir="rtl">
      <header className="bg-gray-800 shadow-lg p-4 flex items-center justify-center gap-4">
        <GeminiIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          نمایشگاه هوش مصنوعی Gemini
        </h1>
      </header>

      <div className="flex flex-col md:flex-row flex-grow">
        <nav className="bg-gray-800 p-2 md:p-4 md:w-64">
          <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <TabButton tab="chat" label="چت‌بات" icon={<ChatIcon />} />
            <TabButton tab="pluginBuilder" label="افزونه ساز" icon={<CodeIcon />} />
            <TabButton tab="summarize" label="خلاصه‌ساز سریع" icon={<DocumentTextIcon />} />
            <TabButton tab="image" label="تحلیل‌گر تصویر" icon={<ImageIcon />} />
            <TabButton tab="video" label="تحلیل‌گر ویدیو" icon={<VideoIcon />} />
            <TabButton tab="generate" label="مولد ویدیو Veo" icon={<FilmIcon />} />
            <TabButton tab="live" label="مکالمه زنده" icon={<MicIcon />} />
            <TabButton tab="tts" label="تبدیل متن به گفتار" icon={<SpeakerIcon />} />
            <TabButton tab="settings" label="تنظیمات" icon={<SettingsIcon />} />
          </ul>
        </nav>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-gray-900 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Suspense fallback={
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {renderTabContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;