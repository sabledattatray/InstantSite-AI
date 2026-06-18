import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Download, Code2, Play, Loader2, Sparkles, Wand2, MonitorPlay, 
  Smartphone, Tablet, Monitor, LayoutDashboard, History, LayoutTemplate, 
  FolderKanban, Settings, Search, Moon, Sun, Zap, User, Eraser, Dices, ChevronRight, Layout, Palette, Type, RefreshCw, PenTool, Globe, Focus, Layers, Check, Maximize, Minimize 
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';

import { GeneratedSite, TabType, ViewportSize } from './types';
import LivePreview from './components/LivePreview';

export default function App() {
  const [prompt, setPrompt] = useState('');
  
  // Customization
  const [stylePreset, setStylePreset] = useState('Modern SaaS');
  const [typography, setTypography] = useState('Inter (Sans-serif)');
  const [brandColor, setBrandColor] = useState('indigo');
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [activeNav, setActiveNav] = useState('generate');
  const [copySuccess, setCopySuccess] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Template Quick Starts
  const templates = [
    { title: "SaaS Landing Page", desc: "High-converting modern tech layout" },
    { title: "Portfolio Website", desc: "Clean minimalist design for creatives" },
    { title: "E-commerce Store", desc: "Product-focused storefront" }
  ];

  const generateSite = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stylePreset, typography, brandColor }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(errorData.error || 'Failed to generate website');
      }
      
      const data: GeneratedSite = await resp.json();
      setSite(data);
      setActiveTab('preview');
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!site) return;
    
    const actualTypography = typography || site.typography || 'Inter';
    let htmlStr = site.html;
    if (brandColor && site.brandColor && brandColor !== site.brandColor) {
      const regex = new RegExp(site.brandColor, 'g');
      htmlStr = htmlStr.replace(regex, brandColor);
    }

    const zip = new JSZip();
    zip.file('index.html', `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${site.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { 
      font-family: ${actualTypography.toLowerCase().includes('serif') ? '"Playfair Display", serif' : actualTypography.toLowerCase().includes('space') ? '"Space Grotesk", sans-serif' : '"Inter", sans-serif'}; 
      -webkit-font-smoothing: antialiased; 
    }
  </style>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="bg-gray-50 text-gray-900 selection:bg-indigo-500/30">
${htmlStr}
  <script src="script.js"></script>
</body>
</html>`);
    zip.file('style.css', site.css || '');
    zip.file('script.js', site.js || '');
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.title?.replace(/\\s+/g, '-').toLowerCase() || 'instantsite'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!site) return;
    let textToCopy = '';
    
    let htmlStr = site.html;
    if (brandColor && site.brandColor && brandColor !== site.brandColor) {
      const regex = new RegExp(site.brandColor, 'g');
      htmlStr = htmlStr.replace(regex, brandColor);
    }

    if (activeTab === 'html') textToCopy = htmlStr;
    if (activeTab === 'css') textToCopy = site.css;
    if (activeTab === 'js') textToCopy = site.js;
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const surpriseMe = () => {
    const ideas = [
      "A dark-themed landing page for a cutting-edge quantum computing startup, featuring a glowing interactive 3D hero section.",
      "E-commerce storefront for minimalist ceramic coffee setup, using beige tones and serif typography.",
      "Ultra-premium portfolio for a motion graphics designer in Tokyo, dark mode with neon accents.",
      "SaaS landing page for an AI-powered code review tool with a bento grid feature section."
    ];
    setPrompt(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeploySuccess(false);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-ai-bg text-ai-text font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      {!isFullscreen && (
      <aside className="w-[72px] lg:w-64 flex-shrink-0 bg-ai-surface/50 backdrop-blur-2xl border-r border-ai-text/5 flex flex-col transition-all duration-300 relative z-20">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-ai-text/5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-ai-primary to-ai-accent flex items-center justify-center shadow-lg shadow-ai-primary/20 shrink-0">
            <Sparkles className="w-4 h-4 text-ai-text" />
          </div>
          <span className="ml-3 font-bold text-lg hidden lg:block tracking-tight text-ai-text">InstantSite</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={<Sparkles size={18} />} label="Generate" active={activeNav === 'generate'} onClick={() => setActiveNav('generate')} />
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
          <NavItem icon={<History size={18} />} label="Prompt History" active={activeNav === 'history'} onClick={() => setActiveNav('history')} />
          <NavItem icon={<LayoutTemplate size={18} />} label="Templates" active={activeNav === 'templates'} onClick={() => setActiveNav('templates')} />
          <NavItem icon={<FolderKanban size={18} />} label="My Projects" active={activeNav === 'projects'} onClick={() => setActiveNav('projects')} />
        </nav>

        <div className="p-3 border-t border-ai-text/5 shrink-0">
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          <div className="mt-4 flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-ai-text/5 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-full border border-ai-text/10 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-ai-text/60" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium truncate">Pro User</p>
              <p className="text-[10px] text-ai-secondary uppercase tracking-wider font-semibold">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ai-primary/20 via-ai-bg/0 to-transparent -z-10 opacity-70 pointer-events-none"></div>
        
        {/* 2. TOP BAR */}
        {!isFullscreen && (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b border-ai-text/5 bg-ai-bg/60 backdrop-blur-lg z-10 w-full">
          <div className="flex-1 flex items-center max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-text/50" />
              <input 
                type="text" 
                placeholder="Search your projects..." 
                className="w-full bg-ai-surface border border-ai-text/5 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ai-primary/50 focus:border-ai-primary/30 transition-all text-ai-text/80 placeholder:text-white/30 truncate"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4 shrink-0">
            <div className="hidden md:flex items-center bg-ai-surface border border-ai-text/5 rounded-full p-1">
              <button className="px-3 py-1 flex items-center text-xs font-semibold rounded-full bg-ai-text/10 text-ai-text shadow-sm transition-colors">
                <Zap className="w-3 h-3 mr-1.5 text-yellow-400" /> Fast
              </button>
              <button className="px-3 py-1 flex items-center text-xs font-semibold rounded-full text-ai-text/60 hover:text-ai-text transition-colors">
                <Sparkles className="w-3 h-3 mr-1.5 text-ai-secondary" /> Pro
              </button>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 hidden sm:flex items-center justify-center rounded-full bg-ai-surface border border-ai-text/5 text-ai-text/60 hover:text-ai-text transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
        )}

        {/* 3 & 4. MAIN CONTENT */}
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-0">
          
          <div className={`overflow-hidden flex relative ${(!site || !isFullscreen) ? 'flex-1' : 'hidden'}`}>
            {/* Scrollable Main Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col lg:flex-row">
              {activeNav === 'generate' && (
                <>
                    {/* GENERATION / PROMPT AREA */}
                  <div className={`transition-all duration-500 ease-in-out ${(site && isFullscreen) ? 'hidden' : 'flex flex-col'} ${site ? 'w-full lg:w-[450px] xl:w-[500px] border-r border-ai-text/5 shrink-0 bg-ai-surface/30 backdrop-blur-md' : 'flex-1 w-full bg-transparent max-w-6xl mx-auto px-6'} overflow-y-auto`}>
                    
                    <div className={`flex flex-col flex-1 ${site ? 'p-6 pb-24 lg:pb-6' : 'pt-16 pb-12'}`}>

                  
                  {!site && (
                    <div className="mb-10 text-center space-y-4 pt-8">
                      <div className="inline-flex items-center px-3 py-1 rounded-full border border-ai-secondary/30 bg-ai-secondary/10 text-ai-secondary text-xs font-bold uppercase tracking-widest mb-4 animate-fade-in shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                        <Sparkles className="w-3 h-3 mr-2" /> InstantSite AI Core v2.0
                      </div>
                      <h1 className="text-4xl lg:text-5xl lg:leading-tight font-extrabold tracking-tight pb-2">
                        Build anything in <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-primary via-ai-accent to-ai-secondary">seconds.</span>
                      </h1>
                      <p className="text-ai-text/60 text-base max-w-xl mx-auto">
                        Describe your dream website below. Our AI architect will generate production-ready code, beautiful UI, and high-converting layouts instantly.
                      </p>
                    </div>
                  )}

              {site && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold tracking-tight text-ai-text flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2 text-ai-primary" /> Project Setup
                  </h2>
                </div>
              )}

              {/* Huge Prompt Input Box */}
              <div className={`relative group ${!site ? 'shadow-[0_0_50px_-12px_rgba(108,92,231,0.2)]' : ''}`}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-primary to-ai-accent rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
                <div className="relative bg-ai-surface border border-ai-text/10 rounded-[1.5rem] p-4 lg:p-6 flex flex-col focus-within:border-ai-primary/50 transition-colors">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your website idea... e.g. Modern portfolio for a UI designer with a dark theme and glassmorphism cards."
                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-ai-text text-base lg:text-lg min-h-[140px] placeholder:text-ai-text/30"
                    disabled={isGenerating}
                  />
                  
                  {/* Action Buttons inside/below input */}
                  <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-ai-text/5 gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button onClick={surpriseMe} disabled={isGenerating} className="p-2.5 text-ai-text/50 hover:text-ai-text hover:bg-ai-text/5 rounded-xl transition-colors" title="Surprise Me">
                        <Dices className="w-4 h-4" />
                      </button>
                      <button onClick={() => setPrompt('')} disabled={isGenerating} className="p-2.5 text-ai-text/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors" title="Clear">
                        <Eraser className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 text-xs font-semibold text-ai-text/60 hover:text-ai-text hover:bg-ai-text/5 rounded-xl transition-colors border border-ai-text/10 hidden sm:flex items-center gap-1.5 focus:outline-none">
                        <PenTool className="w-3 h-3" /> Improve Prompt
                      </button>
                    </div>
                    
                    <button
                      onClick={generateSite}
                      disabled={isGenerating || !prompt.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-ai-primary to-ai-accent hover:from-ai-primary/90 hover:to-ai-accent/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-ai-primary/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> {site ? 'Regenerate' : 'Generate Website'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2 animate-fade-in">
                  <div className="mt-0.5"><Focus className="w-4 h-4 shrink-0" /></div>
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Refinement Options */}
              <div className={`mt-6 lg:mt-8 space-y-5 ${!site ? 'opacity-80 hover:opacity-100 transition-opacity animate-fade-in' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest flex items-center gap-1.5"><Layout size={12}/> Style Preset</label>
                    <select 
                      value={stylePreset} onChange={(e) => setStylePreset(e.target.value)} disabled={isGenerating}
                      className="w-full bg-ai-surface/80 border border-ai-text/5 hover:border-ai-text/10 rounded-xl px-3 py-2.5 text-sm appearance-none outline-none focus:border-ai-primary/50 focus:ring-1 focus:ring-ai-primary/50 text-ai-text/80 transition-colors cursor-pointer shadow-inner shadow-black/20"
                    >
                      <option value="Modern SaaS">Modern SaaS</option>
                      <option value="Minimalist Portfolio">Minimalist Portfolio</option>
                      <option value="Premium Brutalist">Premium Brutalist</option>
                      <option value="Glassmorphism">Glassmorphism UI</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest flex items-center gap-1.5"><Type size={12}/> Typography</label>
                    <select 
                      value={typography} onChange={(e) => setTypography(e.target.value)} disabled={isGenerating}
                      className="w-full bg-ai-surface/80 border border-ai-text/5 hover:border-ai-text/10 rounded-xl px-3 py-2.5 text-sm appearance-none outline-none focus:border-ai-primary/50 focus:ring-1 focus:ring-ai-primary/50 text-ai-text/80 transition-colors cursor-pointer shadow-inner shadow-black/20"
                    >
                      <option value="Inter (Sans-serif)">Inter (Clean Sans)</option>
                      <option value="Space Grotesk (Tech)">Space Grotesk (Tech)</option>
                      <option value="Playfair (Serif)">Playfair (Elegant)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest flex items-center gap-1.5"><Palette size={12}/> Brand Colors</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'indigo', class: 'bg-indigo-500 shadow-indigo-500/40' },
                      { id: 'rose', class: 'bg-rose-500 shadow-rose-500/40' },
                      { id: 'emerald', class: 'bg-emerald-500 shadow-emerald-500/40' },
                      { id: 'cyan', class: 'bg-cyan-500 shadow-cyan-500/40' },
                      { id: 'slate', class: 'bg-slate-500 shadow-slate-500/40' },
                      { id: 'violet', class: 'bg-violet-600 shadow-violet-600/40' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setBrandColor(c.id)}
                        disabled={isGenerating}
                        className={`w-8 h-8 rounded-full ${c.class} shadow-lg border-2 transition-transform duration-200 flex items-center justify-center shrink-0 ${brandColor === c.id ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                        aria-label={`Select ${c.id} color`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {!site && (
                <div className="mt-12 border-t border-ai-text/5 pt-8 animate-fade-in relative z-10 pb-12">
                  <h3 className="text-ai-text/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                    <LayoutTemplate className="w-3.5 h-3.5" /> Start with a Template
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((tpl, i) => (
                      <div key={i} onClick={() => setPrompt(`Generate a ${tpl.title.toLowerCase()}. ${tpl.desc}. Make it look like a highly premium product.`)} className="bg-ai-surface/60 backdrop-blur border border-ai-text/5 hover:border-ai-text/10 hover:bg-ai-text/5 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group">
                        <div className="w-full h-16 rounded-xl bg-gradient-to-br from-white/5 to-transparent mb-3 border border-ai-text/5 group-hover:from-white/10 transition-colors"></div>
                        <h4 className="font-semibold text-sm leading-tight">{tpl.title}</h4>
                        <p className="text-xs text-ai-text/50 mt-1.5 leading-snug">{tpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 4. OUTPUT PREVIEW PANEL */}
          {site && (
            <div className="flex-1 flex flex-col min-w-0 bg-ai-bg relative animate-fade-in h-[50vh] lg:h-full z-10 w-full overflow-hidden">
              {/* Preview Header */}
              <div className="h-14 flex-shrink-0 border-b border-ai-text/5 bg-ai-surface/80 backdrop-blur-md flex items-center justify-between px-2 sm:px-4 z-20 w-full">
                
                <div className="flex items-center gap-1 bg-ai-text/5 p-1 rounded-xl border border-ai-text/5 shrink-0 overflow-x-auto no-scrollbar">
                  <PreviewTab active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}><MonitorPlay className="w-3.5 h-3.5 sm:mr-1.5" /><span className="hidden sm:inline">Preview</span></PreviewTab>
                  <PreviewTab active={activeTab === 'html'} onClick={() => setActiveTab('html')}><Code2 className="w-3.5 h-3.5 sm:mr-1.5" /><span className="hidden sm:inline">HTML</span></PreviewTab>
                  <PreviewTab active={activeTab === 'css'} onClick={() => setActiveTab('css')}><Code2 className="w-3.5 h-3.5 sm:mr-1.5" /><span className="hidden sm:inline">CSS</span></PreviewTab>
                  <PreviewTab active={activeTab === 'js'} onClick={() => setActiveTab('js')}><Layers className="w-3.5 h-3.5 sm:mr-1.5" /><span className="hidden sm:inline">JS</span></PreviewTab>
                  {activeTab === 'preview' && (
                    <button 
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`ml-2 px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs rounded-lg transition-colors font-semibold uppercase tracking-wider ${isEditMode ? 'bg-ai-primary/20 text-ai-primary border border-ai-primary/30 shadow-[0_0_10px_rgba(108,92,231,0.2)]' : 'bg-ai-text/5 text-ai-text/50 hover:text-ai-text border border-ai-text/5'}`}
                      title="Edit Elements"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Edit Mode</span>
                    </button>
                  )}
                </div>

                {activeTab === 'preview' && (
                  <div className="hidden sm:flex items-center gap-1 mx-2 bg-ai-text/5 p-1 rounded-xl border border-ai-text/5 shrink-0">
                    <ViewportBtn active={viewportSize === 'mobile'} onClick={() => setViewportSize('mobile')}><Smartphone className="w-4 h-4" /></ViewportBtn>
                    <ViewportBtn active={viewportSize === 'tablet'} onClick={() => setViewportSize('tablet')}><Tablet className="w-4 h-4" /></ViewportBtn>
                    <ViewportBtn active={viewportSize === 'desktop'} onClick={() => setViewportSize('desktop')}><Monitor className="w-4 h-4" /></ViewportBtn>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {activeTab !== 'preview' ? (
                    <button 
                      onClick={handleCopy}
                      className="px-3 sm:px-4 py-1.5 bg-ai-text/5 hover:bg-ai-text/10 text-ai-text rounded-lg text-[10px] sm:text-xs font-semibold font-sans uppercase tracking-widest transition-colors flex items-center border border-ai-text/5"
                    >
                      {copySuccess ? <><Check className="w-3 h-3 mr-1" /> Copied</> : 'Copy Code'}
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleDownload}
                        className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold bg-ai-text/5 hover:bg-ai-text/10 text-ai-text rounded-lg border border-ai-text/5 transition-colors flex items-center gap-1.5"
                        title="Download ZIP"
                      >
                        <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">ZIP</span>
                      </button>
                      <button 
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className="px-3 sm:px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-ai-primary to-ai-secondary text-ai-text rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(108,92,231,0.3)] hover:shadow-[0_0_20px_rgba(108,92,231,0.5)] disabled:opacity-70"
                      >
                        {isDeploying ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> <span className="hidden sm:inline">Deploying...</span></>
                        ) : deploySuccess ? (
                          <><Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Deployed!</span></>
                        ) : (
                          <><Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Deploy</span></>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold bg-ai-text/5 hover:bg-ai-text/10 text-ai-text rounded-lg border border-ai-text/5 transition-colors flex items-center gap-1.5"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Maximize className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Content Area */}
              <div className="flex-1 overflow-hidden flex bg-ai-bg relative z-10 h-full w-full">
                {activeTab === 'preview' ? (
                  <LivePreview site={site} viewportSize={viewportSize} isEditMode={isEditMode} typography={typography} activeBrandColor={brandColor} />
                ) : (
                  <div className="flex-1 w-full relative">
                    <Editor
                      height="100%"
                      language={activeTab === 'html' ? 'html' : activeTab === 'css' ? 'css' : 'javascript'}
                      theme="vs-dark"
                      value={activeTab === 'html' ? site?.html || '' : activeTab === 'css' ? site?.css || '' : site?.js || ''}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        wordWrap: 'on',
                        readOnly: true,
                        padding: { top: 24, bottom: 24 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                      }}
                      loading={<div className="flex items-center justify-center text-ai-text/60 h-full text-sm font-medium"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Editor...</div>}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}

          {activeNav === 'dashboard' && (
            <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-ai-surface border border-ai-text/5 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-ai-text/60 text-sm font-semibold mb-2">Total Sites Generated</h3>
                  <p className="text-4xl font-bold text-ai-text">24</p>
                </div>
                <div className="bg-ai-surface border border-ai-text/5 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-ai-text/60 text-sm font-semibold mb-2">Available Credits</h3>
                  <p className="text-4xl font-bold text-ai-secondary">Unlimited</p>
                </div>
                <div className="bg-ai-surface border border-ai-text/5 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-ai-text/60 text-sm font-semibold mb-2">Current Plan</h3>
                  <p className="text-2xl mt-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-ai-primary to-ai-accent">Pro</p>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'history' && (
            <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Prompt History</h2>
              <div className="space-y-4">
                {[
                  { id: 1, prompt: "A dark-themed landing page for a cutting-edge quantum computing startup", time: "2 hours ago" },
                  { id: 2, prompt: "Modern portfolio for a UI designer with glassmorphism", time: "Yesterday" },
                  { id: 3, prompt: "Minimalist coffee shop eCommerce site", time: "3 days ago" }
                ].map(item => (
                  <div key={item.id} className="bg-ai-surface/60 border border-ai-text/5 p-5 rounded-2xl hover:border-ai-text/10 transition-colors">
                    <p className="text-ai-text mb-2">{item.prompt}</p>
                    <p className="text-xs text-ai-text/50">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'templates' && (
            <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((tpl, i) => (
                  <div key={i} className="bg-ai-surface border border-ai-text/5 hover:border-ai-text/10 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 group">
                    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent mb-4 border border-ai-text/5 group-hover:from-white/10 transition-colors"></div>
                    <h4 className="font-semibold text-base mb-1">{tpl.title}</h4>
                    <p className="text-sm text-ai-text/50">{tpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'projects' && (
            <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">My Projects</h2>
              <div className="flex flex-col items-center justify-center p-12 bg-ai-surface/30 border border-ai-text/5 rounded-2xl border-dashed">
                <FolderKanban className="w-12 h-12 text-ai-text/30 mb-4" />
                <h3 className="text-lg font-semibold text-ai-text/80">No saved projects yet</h3>
                <p className="text-sm text-ai-text/50 max-w-sm text-center mt-2 mb-6">Generate a new website. Your saved projects will appear here.</p>
                <button onClick={() => setActiveNav('generate')} className="px-6 py-2 bg-ai-text/10 hover:bg-ai-text/20 rounded-xl transition-colors text-sm font-semibold">Start Generating</button>
              </div>
            </div>
          )}

          {activeNav === 'settings' && (
            <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Settings</h2>
              <div className="bg-ai-surface border border-ai-text/5 p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 text-lg">Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-ai-text/70 mb-1 block">Email</label>
                    <input type="text" readOnly value="user@example.com" className="w-full bg-ai-text/5 border border-ai-text/10 rounded-lg px-4 py-2 text-ai-text/60" />
                  </div>
                  <div>
                    <label className="text-sm text-ai-text/70 mb-1 block">Plan</label>
                    <div className="flex items-center gap-3 w-full bg-ai-text/5 border border-ai-text/10 rounded-lg px-4 py-2">
                       <Sparkles className="w-4 h-4 text-ai-secondary" />
                       <span className="text-ai-text/80">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* RIGHT SIDEBAR (AI SUGGESTIONS) */}
          {(!site || activeNav !== 'generate') && (
            <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-ai-text/5 bg-ai-surface/30 backdrop-blur-md overflow-y-auto z-10 p-6">
              <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-ai-text uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-ai-primary" /> AI Suggestions
              </h3>

              <div className="space-y-6">
                <div className="bg-ai-surface border border-ai-text/5 rounded-2xl p-4 shadow-sm">
                  <h4 className="text-[10px] font-bold text-ai-text/50 mb-3 uppercase tracking-wider">Trending Prompts</h4>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => { setPrompt('Modern SaaS landing page for an AI-powered CRM with a dark theme and glassmorphism'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-ai-text/5 rounded-xl text-xs transition-colors text-ai-text/80 hover:text-ai-text">SaaS Landing Page</button>
                    <button onClick={() => { setPrompt('Minimalist portfolio for a freelance UI/UX designer with bold typography and a light theme'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-ai-text/5 rounded-xl text-xs transition-colors text-ai-text/80 hover:text-ai-text">Designer Portfolio</button>
                    <button onClick={() => { setPrompt('Boutique e-commerce store selling premium coffee beans, warm color palette'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-ai-text/5 rounded-xl text-xs transition-colors text-ai-text/80 hover:text-ai-text">Coffee eCommerce</button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-ai-primary/10 to-ai-secondary/10 border border-ai-primary/20 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-ai-primary/30 to-transparent rounded-bl-full opacity-50"></div>
                  <h4 className="text-sm font-semibold text-ai-text mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-ai-secondary" /> Pro Features Upgrade
                  </h4>
                  <p className="text-xs text-ai-text/70 mb-4 leading-relaxed mt-2 relative z-10">
                    Unlock Figma export, unlimited AI generations, standard components library, and priority support.
                  </p>
                  <button className="w-full py-2.5 bg-ai-text text-ai-bg text-xs font-bold rounded-xl shadow-lg hover:bg-ai-text/90 transition-all relative z-10">
                    Upgrade to Pro Plan
                  </button>
                </div>

                <div className="flex flex-col pt-4 border-t border-ai-text/5 text-xs text-ai-text/40">
                  <p>© 2024 InstantSite AI</p>
                  <div className="flex items-center gap-3 mt-2">
                    <a href="#" className="hover:text-ai-text transition-colors">Documentation</a>
                    <a href="#" className="hover:text-ai-text transition-colors">Twitter</a>
                    <a href="#" className="hover:text-ai-text transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </aside>
          )}

          </div>

        </main>
      </div>

    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative focus:outline-none ${active ? 'bg-ai-primary/10 text-ai-primary shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)] border border-ai-primary/20' : 'text-ai-text/50 hover:text-ai-text hover:bg-ai-text/5 border border-transparent'}`}
      title={label}
    >
      <div className={`${active ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'} shrink-0`}>{icon}</div>
      <span className={`ml-3 text-sm font-semibold tracking-wide hidden lg:block truncate ${active ? 'text-white' : ''}`}>{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-ai-primary to-ai-accent rounded-r-full shadow-[0_0_10px_rgba(108,92,231,0.5)]"></div>
      )}
    </button>
  );
}

function PreviewTab({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none ${
        active 
          ? 'bg-ai-surface text-ai-text shadow-sm border border-ai-text/10' 
          : 'text-ai-text/50 hover:text-ai-text hover:bg-ai-text/5 border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

function ViewportBtn({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all focus:outline-none ${
        active ? 'bg-ai-primary/20 text-ai-primary border border-ai-primary/30' : 'text-ai-text/50 hover:text-ai-text hover:bg-ai-text/5 border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}
