import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';
import LoadingSpinner from './LoadingSpinner';
import { CodeIcon, PlusIcon, TrashIcon } from './icons';

// Define types for UI fields
type UIField = {
  id: number;
  type: 'text' | 'textarea' | 'checkbox';
  label: string;
  name: string;
};

type PluginType = 'wordpress' | 'browser';
type GeneratedFile = { filename: string; code: string };

const availableFeatures = [
    { key: 'Admin Menu Page', label: 'صفحه منوی مدیریت' },
    { key: 'Shortcode', label: 'کد کوتاه' },
    { key: 'Widget', label: 'ابزارک' },
    { key: 'Custom Post Type', label: 'نوع پست سفارشی' }
];


const PluginBuilder: React.FC = () => {
  const [pluginType, setPluginType] = useState<PluginType>('wordpress');

  // WordPress Plugin State
  const [pluginName, setPluginName] = useState('افزونه عالی من');
  const [description, setDescription] = useState('توضیح مختصری در مورد کاری که این افزونه انجام می‌دهد.');
  const [version, setVersion] = useState('1.0.0');
  const [author, setAuthor] = useState('نویسنده افزونه');
  const [features, setFeatures] = useState<string[]>(['Admin Menu Page']);
  const [uiFields, setUiFields] = useState<UIField[]>([
    { id: 1, type: 'text', label: 'کلید API', name: 'api_key' },
  ]);

  // Browser Extension State
  const [browserExtName, setBrowserExtName] = useState('افزونه مرورگر من');
  const [browserExtDesc, setBrowserExtDesc] = useState('این افزونه یک کار فوق‌العاده انجام می‌دهد.');
  const [browserExtFunctionality, setBrowserExtFunctionality] = useState('یک پاپ‌آپ ساده با یک دکمه بساز که با کلیک روی آن، یک هشدار "سلام دنیا" نمایش دهد.');

  // API State
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const addField = () => {
    const newField: UIField = {
      id: Date.now(),
      type: 'text',
      label: 'فیلد جدید',
      name: 'new_field',
    };
    setUiFields(prev => [...prev, newField]);
  };

  const removeField = (id: number) => {
    setUiFields(prev => prev.filter(field => field.id !== id));
  };

  const updateField = (id: number, updatedField: Partial<UIField>) => {
    setUiFields(prev =>
      prev.map(field => (field.id === id ? { ...field, ...updatedField } : field))
    );
  };

  const buildWordPressPrompt = (): string => {
    let prompt = `Act as a professional WordPress plugin developer. Generate the complete PHP code for a single-file WordPress plugin with the following specifications:\n\n`;
    prompt += `**Plugin Name:** ${pluginName}\n`;
    prompt += `**Description:** ${description}\n`;
    prompt += `**Version:** ${version}\n`;
    prompt += `**Author:** ${author}\n\n`;
    prompt += `**Core Features:**\n- ${features.join('\n- ')}\n\n`;

    if (features.includes('Admin Menu Page')) {
      prompt += `**Admin Menu Page Details:**\n`;
      prompt += `- Create a top-level menu page titled "${pluginName}".\n`;
      prompt += `- The page should have a settings form.\n`;
      prompt += `- The form should include the following fields to be saved in the wp_options table:\n`;
      uiFields.forEach(field => {
        prompt += `  - **Type:** ${field.type}, **Label:** "${field.label}", **Option Name:** "${pluginName.toLowerCase().replace(/\s/g, '_')}_${field.name}"\n`;
      });
      prompt += `- Use the Settings API to register settings and sanitize fields appropriately.\n\n`;
    }

    prompt += `**Instructions:**\n- Provide the code as a single, complete PHP file, including the plugin header comment block.\n- Ensure the code is secure, well-documented with inline comments, and follows WordPress coding standards.`;
    
    return prompt;
  };

  const buildBrowserPrompt = (): string => {
    let prompt = `Act as a professional browser extension developer. Generate all the necessary files for a Google Chrome browser extension (Manifest V3) with the following specifications:\n\n`;
    prompt += `**Extension Name:** ${browserExtName}\n`;
    prompt += `**Description:** ${browserExtDesc}\n\n`;
    prompt += `**Core Functionality:**\n${browserExtFunctionality}\n\n`;
    prompt += `**Instructions:**\n`;
    prompt += `- Generate the complete code for all required files, including manifest.json, popup.html, popup.js, content scripts, background scripts, etc., as needed to fulfill the request.\n`;
    prompt += `- For each file, clearly mark the beginning of its content with a comment like: // FILENAME: manifest.json\n`;
    prompt += `- Ensure the manifest.json is correctly configured with broad permissions suitable for a powerful extension. Include "storage", "tabs", "scripting", and host permissions for all websites ("<all_urls>") to ensure the core functionality can be implemented without permission issues.\n`;
    prompt += `- Write modern, clean, and well-commented JavaScript, HTML, and CSS.\n`;
    return prompt;
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles([]);
    setActiveFile(null);
    
    const prompt = pluginType === 'wordpress' ? buildWordPressPrompt() : buildBrowserPrompt();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      let rawResponse = '';
      const fileRegex = /\/\/\s*FILENAME:\s*(\S+)/g;

      for await (const chunk of responseStream) {
        rawResponse += chunk.text;

        const files: GeneratedFile[] = [];
        let match;
        let lastIndex = 0;

        // Find all file markers
        const markers = [...rawResponse.matchAll(fileRegex)];

        if (markers.length > 0) {
            markers.forEach((marker, i) => {
                const filename = marker[1];
                const startIndex = marker.index! + marker[0].length;
                const endIndex = i + 1 < markers.length ? markers[i+1].index! : rawResponse.length;
                const code = rawResponse.substring(startIndex, endIndex).trim();
                files.push({ filename, code });
            });
        } else if (pluginType === 'wordpress' && rawResponse) {
             // Handle single-file WordPress plugin
             files.push({ filename: `${pluginName.toLowerCase().replace(/\s/g, '-')}.php`, code: rawResponse });
        }
        
        setGeneratedFiles(files);
        if (files.length > 0 && !activeFile) {
            setActiveFile(files[0].filename);
        }
      }
    } catch (e) {
      console.error(e);
      setError('تولید کد افزونه با شکست مواجه شد. لطفاً درخواست خود را بررسی کرده و دوباره امتحان کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const activeCode = generatedFiles.find(f => f.filename === activeFile)?.code;
    if(activeCode) {
      navigator.clipboard.writeText(activeCode);
    }
  }

  const handleDownloadProject = async () => {
    if (generatedFiles.length === 0) return;

    const zip = new JSZip();
    generatedFiles.forEach(file => {
        // For nested structures, e.g. "icons/icon.png"
        const folders = file.filename.split('/');
        let currentFolder = zip;
        for (let i = 0; i < folders.length - 1; i++) {
            currentFolder = currentFolder.folder(folders[i])!;
        }
        currentFolder.file(folders[folders.length - 1], file.code);
    });

    try {
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const projectName = pluginType === 'wordpress' ? pluginName : browserExtName;
        link.download = `${projectName.toLowerCase().replace(/\s/g, '-')}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Failed to create zip file", error);
        setError("ایجاد فایل فشرده با شکست مواجه شد.");
    }
  };


  const renderWordPressForm = () => (
    <>
       {/* Plugin Details */}
        <details open className="space-y-4">
          <summary className="font-semibold text-lg cursor-pointer text-gray-300">جزئیات افزونه</summary>
          <div className="pr-4 space-y-3 pt-3">
             <div>
                <label className="block text-sm font-medium text-gray-400">نام افزونه</label>
                <input type="text" value={pluginName} onChange={e => setPluginName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-400">توضیحات</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">نسخه</label>
                    <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">نویسنده</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
             </div>
          </div>
        </details>
        
        {/* Functionality */}
        <details open className="space-y-4">
          <summary className="font-semibold text-lg cursor-pointer text-gray-300">عملکرد</summary>
          <div className="pr-4 space-y-2 pt-3">
            {availableFeatures.map(feature => (
              <label key={feature.key} className="flex items-center gap-2 text-white">
                <input type="checkbox" checked={features.includes(feature.key)} onChange={() => handleFeatureToggle(feature.key)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 rounded" />
                {feature.label}
              </label>
            ))}
          </div>
        </details>

        {/* UI Fields */}
        {features.includes('Admin Menu Page') && (
            <details open className="space-y-4">
                <summary className="font-semibold text-lg cursor-pointer text-gray-300">فیلدهای صفحه مدیریت</summary>
                <div className="pr-4 space-y-3 pt-3">
                    {uiFields.map(field => (
                        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-8 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
                            <div className="sm:col-span-3">
                                <label className="block text-xs font-medium text-gray-400">برچسب</label>
                                <input type="text" value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-1 px-2 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-xs font-medium text-gray-400">پسوند نام گزینه</label>
                                <input type="text" value={field.name} onChange={e => updateField(field.id, { name: e.target.value })} className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-1 px-2 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"/>
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-medium text-gray-400">نوع</label>
                                <select value={field.type} onChange={e => updateField(field.id, { type: e.target.value as UIField['type'] })} className="mt-1 block w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-1 px-2 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    <option>text</option>
                                    <option>textarea</option>
                                    <option>checkbox</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1 flex items-end justify-start h-full">
                                <button onClick={() => removeField(field.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addField} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold">
                        <PlusIcon className="w-4 h-4" /> افزودن فیلد
                    </button>
                </div>
            </details>
        )}
    </>
  );

  const renderBrowserForm = () => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-400">نام افزونه</label>
            <input type="text" value={browserExtName} onChange={e => setBrowserExtName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-400">توضیحات</label>
            <textarea value={browserExtDesc} onChange={e => setBrowserExtDesc(e.target.value)} rows={2} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-400">عملکرد اصلی</label>
            <textarea 
                value={browserExtFunctionality} 
                onChange={e => setBrowserExtFunctionality(e.target.value)} 
                rows={5} 
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: یک پاپ‌آپ بساز که ساعت را نشان دهد و رنگ پس‌زمینه سایت example.com را به آبی تغییر دهد."
            />
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Panel */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-2">سازنده افزونه هوشمند</h2>
          <p className="text-gray-400">افزونه خود را پیکربندی کنید و به Gemini Pro اجازه دهید کد را بنویسد.</p>
        </div>
        
        {/* Plugin Type Selector */}
        <div className="flex bg-gray-700/50 rounded-lg p-1">
            <button onClick={() => setPluginType('wordpress')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${pluginType === 'wordpress' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                افزونه وردپرس
            </button>
            <button onClick={() => setPluginType('browser')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${pluginType === 'browser' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                افزونه مرورگر
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            {pluginType === 'wordpress' ? renderWordPressForm() : renderBrowserForm()}
        </div>
        
        <div className="mt-auto pt-6 border-t border-gray-700">
             <button onClick={handleGenerateCode} disabled={isLoading} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg">
                {isLoading ? <LoadingSpinner size="sm" /> : <CodeIcon />}
                {isLoading ? 'در حال تولید کد...' : 'تولید کد افزونه'}
            </button>
        </div>
      </div>

      {/* Code Output */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">کد تولید شده</h2>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} disabled={!activeFile || isLoading} className="px-4 py-1 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                  کپی کردن کد
              </button>
              <button onClick={handleDownloadProject} disabled={generatedFiles.length === 0 || isLoading} className="px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                  دانلود پروژه (.zip)
              </button>
            </div>
        </div>
        <div className="bg-gray-900/70 rounded-md flex-grow flex flex-col">
            {/* File Tabs */}
            {generatedFiles.length > 0 && (
                <div className="flex border-b border-gray-700 overflow-x-auto" dir="ltr">
                    {generatedFiles.map(file => (
                        <button 
                            key={file.filename}
                            onClick={() => setActiveFile(file.filename)}
                            className={`py-2 px-4 text-sm transition-colors ${activeFile === file.filename ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}
                        >
                            {file.filename}
                        </button>
                    ))}
                </div>
            )}
            <div className="relative flex-grow">
                {isLoading && generatedFiles.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
                        <LoadingSpinner size="lg"/>
                        <p>در حال تولید کد با Gemini Pro...</p>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4">{error}</div>
                )}
                {!isLoading && generatedFiles.length === 0 && !error && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4">
                        <p>کد افزونه تولید شده شما در اینجا نمایش داده خواهد شد.</p>
                    </div>
                )}
                <pre className="h-full w-full overflow-auto p-4 text-left" dir="ltr"><code className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                    {generatedFiles.find(f => f.filename === activeFile)?.code || ''}
                </code></pre>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PluginBuilder;