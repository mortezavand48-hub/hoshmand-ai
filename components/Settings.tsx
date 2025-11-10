import React, { useState, useEffect, useCallback } from 'react';

const Settings: React.FC = () => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyReady(hasKey);
      } else {
        setIsKeyReady(true);
      }
    } catch (e) {
      console.error("خطا در بررسی کلید API:", e);
      setIsKeyReady(true);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    setError(null);
    try {
       if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        await checkApiKey();
       } else {
         setError("این قابلیت در محیط توسعه محلی در دسترس نیست.")
       }
    } catch (e) {
      console.error('خطا در باز کردن انتخاب کلید API:', e);
      setError('امکان باز کردن پنجره انتخاب کلید API وجود نداشت.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-2">تنظیمات اپلیکیشن</h2>
        <p className="text-gray-400">کلید API خود را مدیریت کرده و با برنامه آشنا شوید.</p>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">مدیریت کلید API</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-grow">
                <p className="text-gray-300">وضعیت کلید: 
                    <span className={`font-bold ml-2 px-2 py-1 rounded-md text-sm ${isKeyReady ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                        {isKeyReady ? 'آماده و انتخاب شده' : 'انتخاب نشده'}
                    </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    برخی از مدل‌ها (مانند Veo) برای کار کردن به یک کلید API از یک پروژه با صورتحساب فعال نیاز دارند.
                </p>
            </div>
            <button
              onClick={handleSelectKey}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              انتخاب کلید API
            </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-center sm:text-right">{error}</p>}
        <p className="text-xs text-gray-500 mt-6">
            برای اطلاعات بیشتر در مورد صورتحساب، به <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">مستندات صورتحساب Google AI</a> مراجعه کنید.
        </p>
      </div>

       <div className="bg-gray-900/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">درباره نمایشگاه Gemini</h3>
        <p className="text-gray-400 leading-relaxed">
            این اپلیکیشن یک ویترین پیشرفته از قابلیت‌های متنوع ارائه شده توسط Gemini API است. هدف آن نمایش قدرت و انعطاف‌پذیری مدل‌های هوش مصنوعی گوگل در وظایف مختلف از جمله مکالمات متنی، تحلیل چندرسانه‌ای، تولید محتوای خلاقانه و تعاملات صوتی بی‌درنگ است. این برنامه با هدف بهینه‌سازی عملکرد و ارائه بهترین تجربه کاربری طراحی شده است.
        </p>
      </div>
    </div>
  );
};

export default Settings;