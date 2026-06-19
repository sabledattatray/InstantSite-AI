import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Download, Code2, Play, Loader2, Sparkles, Wand2, MonitorPlay, 
  Smartphone, Tablet, Monitor, LayoutDashboard, History, LayoutTemplate, 
  FolderKanban, Settings, Search, Moon, Sun, Zap, User, Eraser, Dices, ChevronRight, Layout, Palette, Type, RefreshCw, PenTool, Globe, Focus, Layers, Check, Maximize, Minimize, Compass, Star,
  Mail, Lock, ArrowRight, Github, CheckCircle2, Shield, Server
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';

import { GeneratedSite, TabType, ViewportSize } from './types';
import LivePreview from './components/LivePreview';

// Particle Field Backdrop matching NexDial
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId: number;
    let isCleanedUp = false;
    let resizeHandler: (() => void) | null = null;

    const start = () => {
      if (isCleanedUp) return;

      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const resize = () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      resizeHandler = resize;
      window.addEventListener("resize", resize);

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const particleCount = isMobile ? 12 : 45;
      const maxDistance = isMobile ? 65 : 150;

      const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
      const colors = ["#0057D9", "#00C2FF", "#00E5A0"];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      const animate = () => {
        if (isCleanedUp) return;
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - dist / maxDistance) * 0.06;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });

        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(animate);
      };

      animate();
    };

    let idleId: any = null;
    let timeoutId: any = null;

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        idleId = (window as any).requestIdleCallback(() => start(), { timeout: 1000 });
      } else {
        timeoutId = setTimeout(start, 200);
      }
    }

    return () => {
      isCleanedUp = true;
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-screen pointer-events-none z-0" />;
}

function LogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0057D9" />
          <stop offset="50%" stopColor="#00C2FF" />
          <stop offset="100%" stopColor="#00E5A0" />
        </linearGradient>
      </defs>
      {/* Outer Orbit Ring */}
      <circle cx="50" cy="50" r="38" stroke="url(#logoGrad)" strokeWidth="4" strokeDasharray="16 10" className="animate-spin" style={{ animationDuration: '20s', transformOrigin: 'center' }} />
      {/* Inner Diamonds */}
      <path d="M50 20 L75 50 L50 80 L25 50 Z" fill="url(#logoGrad)" />
      {/* Core glowing orb */}
      <circle cx="50" cy="50" r="10" fill="#FFFFFF" className="animate-pulse" />
    </svg>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; type: string; base64?: string; textContent?: string }[]>([]);
  
  // Git Integration State
  const [gitRepoPath, setGitRepoPath] = useState('dattasable/nextdial-crm');
  const [gitImporting, setGitImporting] = useState(false);
  const [gitExporting, setGitExporting] = useState(false);
  const [gitCommitMsg, setGitCommitMsg] = useState('feat: deploy interactive ast dashboard layouts');
  const [gitSuccessMsg, setGitSuccessMsg] = useState('');
  const [gitLogs, setGitLogs] = useState<string[]>([]);
  
  // Customization
  const [stylePreset, setStylePreset] = useState('Modern SaaS');
  const [typography, setTypography] = useState('Inter (Sans-serif)');
  const [brandColor, setBrandColor] = useState('indigo');
  
  // Path Router Synchronization
  const getRouteFromPath = (): 'landing' | 'auth' | 'workspace' | 'about' => {
    const path = window.location.pathname;
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/auth') || path.startsWith('/login') || path.startsWith('/register')) return 'auth';
    if (path.startsWith('/workspace')) return 'workspace';
    return 'landing';
  };

  const [currentRoute, setCurrentRouteState] = useState<'landing' | 'auth' | 'workspace' | 'about'>(getRouteFromPath());

  const setCurrentRoute = (route: 'landing' | 'auth' | 'workspace' | 'about') => {
    setCurrentRouteState(route);
    let path = '/';
    if (route === 'about') path = '/about';
    else if (route === 'auth') path = '/auth';
    else if (route === 'workspace') path = '/workspace';
    
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRouteState(getRouteFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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

  // AI & Build Parameters States
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [optFlags, setOptFlags] = useState({
    minify: true,
    jsxExport: false,
    enhancedPrompts: true
  });
  
  // Mobile UI Workspace active tab state
  const [workspaceMobileTab, setWorkspaceMobileTab] = useState<'prompt' | 'preview'>('prompt');

  // Simulated Log stream state for Developer Dashboard
  const [dashboardLogs, setDashboardLogs] = useState<string[]>([
    `[${new Date(Date.now() - 30000).toTimeString().split(' ')[0]}] [INFO] System boot sequence complete.`,
    `[${new Date(Date.now() - 25000).toTimeString().split(' ')[0]}] [DB] Connection established with Supabase PG cluster.`,
    `[${new Date(Date.now() - 20000).toTimeString().split(' ')[0]}] [AI] Warmed up Gemini-2.5-Flash model cache.`,
    `[${new Date(Date.now() - 15000).toTimeString().split(' ')[0]}] [SERVER] JIT style compiler listening on port 3005.`,
    `[${new Date(Date.now() - 10000).toTimeString().split(' ')[0]}] [WS] Web socket channel established with client preview frame.`
  ]);

  useEffect(() => {
    const logTemplates = [
      "[INFO] Garbage collection executed. Freed 42.4 MB heap space.",
      "[DB] Sync completed: Updated 2 records in 'generated_sites' table.",
      "[AI] Context optimized: 852 system tokens cached for generation.",
      "[SERVER] Route compiled: POST /api/generate (200 OK - 128ms)",
      "[COMPILER] Tailwind classes parsed and minified. Savings: 74.2%",
      "[DEPLOYER] Triggered Vercel webhook for project ID 'site-proj-91a'",
      "[INFO] Checking workspace integrity... Clean.",
      "[SERVER] Request received: GET /api/templates (200 OK - 8ms)"
    ];

    const interval = setInterval(() => {
      const time = new Date().toTimeString().split(' ')[0];
      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setDashboardLogs(prev => {
        const next = [...prev, `[${time}] ${randomTemplate}`];
        if (next.length > 8) {
          next.shift();
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Clear URL hash to ensure clean URLs
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState("", document.title, window.location.pathname + window.location.search);
    }
    if (currentRoute === 'landing') {
      window.scrollTo({ top: 0 });
    }
  }, [currentRoute]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen API failed", err);
      setIsFullscreen(!isFullscreen);
    }
  };

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
    { title: "SaaS Landing Page", desc: "High-converting modern tech layout", icon: <Layout className="w-4 h-4 text-[#00C2FF]" />, tag: "Popular" },
    { title: "Portfolio Website", desc: "Clean minimalist design for creatives", icon: <User className="w-4 h-4 text-[#00E5A0]" />, tag: "New" },
    { title: "E-commerce Store", desc: "Product-focused storefront", icon: <Palette className="w-4 h-4 text-rose-400" />, tag: "Hot" }
  ];

  const generateSite = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stylePreset, typography, brandColor, attachments, referenceUrl }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(errorData.error || 'Failed to generate website');
      }
      
      const data: GeneratedSite = await resp.json();
      setSite(data);
      setActiveTab('preview');
      setWorkspaceMobileTab('preview');
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
    a.download = `${site.title?.replace(/\s+/g, '-').toLowerCase() || 'instantsite'}.zip`;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      if (file.type.startsWith("image/")) {
        reader.onload = (ev) => {
          if (ev.target?.result && typeof ev.target.result === 'string') {
            const base64 = ev.target.result.split(',')[1];
            setAttachments(prev => [...prev, {
              name: file.name,
              type: file.type,
              base64: base64
            }]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Assume it is a text/code file
        reader.onload = (ev) => {
          if (ev.target?.result && typeof ev.target.result === 'string') {
            setAttachments(prev => [...prev, {
              name: file.name,
              type: file.type || "text/plain",
              textContent: ev.target.result
            }]);
          }
        };
        reader.readAsText(file);
      }
    }
    e.target.value = ''; // Reset uploader input
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    
    // Clean current prompt
    let clean = prompt.trim();
    
    // Check if it's already enhanced
    if (clean.includes("=== Elite Design Specification ===")) {
      // Extract the original prompt from the spec if they click it again
      const match = clean.match(/Generate a stunning, ultra-premium, and fully responsive website for:\s*"(.*?)"/s);
      if (match && match[1]) {
        clean = match[1];
      } else {
        return; // Avoid double enhancement
      }
    }
    
    // Technical upgrade addition
    let industry = "General Business";
    let details = "modern design system, fluid responsiveness, and crisp typography";
    let sections = "hero, bento-grid features, interactive client proof, FAQ accordion, contact form, and footer";
    let colors = brandColor || "indigo";
    let preset = stylePreset || "Modern SaaS";
    
    // Match common industries
    const lower = clean.toLowerCase();
    if (lower.includes("bakery") || lower.includes("food") || lower.includes("restaurant") || lower.includes("cafe")) {
      industry = "Food & Hospitality";
      details = "mouthwatering typography, elegant section separation, and warm accent highlights";
      sections = "hero with book-a-table CTA, visual menu bento grid, customer testimonials, contact form, and footer";
    } else if (lower.includes("portfolio") || lower.includes("designer") || lower.includes("resume") || lower.includes("developer")) {
      industry = "Creative Portfolio";
      details = "clean minimalist whitespace, micro-interactions, sleek dark cards, and fine outlines";
      sections = "hero intro, featured work grid, technical stack list, testimonial carousel, contact form, and footer";
    } else if (lower.includes("dentist") || lower.includes("medical") || lower.includes("clinic") || lower.includes("doctor")) {
      industry = "Healthcare & Medicine";
      details = "clean, trustworthy interface, professional layouts, and comforting color tones";
      sections = "hero intro with appointment booking, clinic features list, medical services overview, patient reviews, contact form, and footer";
    } else if (lower.includes("store") || lower.includes("shop") || lower.includes("ecommerce") || lower.includes("product")) {
      industry = "E-Commerce storefront";
      details = "product-focused grids, hover image zooms, clean price listings, and secure payment badge indicators";
      sections = "hero promo slider, feature product showcase, product bento card layout, client testimonials, contact form, and footer";
    } else if (lower.includes("saas") || lower.includes("tech") || lower.includes("software") || lower.includes("crm") || lower.includes("app")) {
      industry = "High-Growth Tech SaaS";
      details = "glassmorphic dashboard previews, bento grid feature showcases, and neon gradient text details";
      sections = "hero with live demo CTA, software key features bento grid, pricing tables (monthly/yearly), FAQ accordion, contact form, and footer";
    } else if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("sport")) {
      industry = "Fitness & Wellness";
      details = "energetic contrast elements, high-intensity color accents, and bold typography";
      sections = "hero banner, training plans grid, trainer profiles, reviews, contact form, and footer";
    }
    
    const enhanced = `=== Elite Design Specification ===
Industry Focus: ${industry}
Style Preset: ${preset}
Accent Color: ${colors}

[Core Objective]:
Generate a stunning, ultra-premium, and fully responsive website for: "${clean}"

[UI/UX Requirements]:
- Typography: Use elegant, premium fonts with maximum contrast.
- Visuals: Use high-resolution topic-relevant Unsplash images and inline SVG vector icons.
- Styling: Focus on a ${details}.
- Layout Sections: ${sections}.
- Interactivity: Fully interactive mobile menu, collapsible FAQ elements, and a stylized contact form submission simulation.`;
    
    setPrompt(enhanced);
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

  if (currentRoute === 'landing' || currentRoute === 'about') {
    return (
      <LandingPage 
        onStart={() => { setAuthView('register'); setCurrentRoute('auth'); }} 
        onStartWorkspace={() => { setUser({ name: 'Pro Developer', email: 'developer@instantsite.ai' }); setCurrentRoute('workspace'); }} 
        onLogin={() => { setAuthView('login'); setCurrentRoute('auth'); }} 
        onAbout={() => setCurrentRoute('about')}
        onGoHome={() => setCurrentRoute('landing')}
        activeView={currentRoute === 'about' ? 'about' : 'home'}
      />
    );
  }

  if (currentRoute === 'auth') {
    return (
      <AuthPage 
        authView={authView} 
        setAuthView={setAuthView} 
        onAuthSuccess={(userName, userEmail) => { setUser({ name: userName, email: userEmail }); setCurrentRoute('workspace'); }} 
        onBackHome={() => setCurrentRoute('landing')} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-ai-bg text-ai-text font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* Background noise and gradient overlays (NexDial style) */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none z-0" />
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      <ParticleField />

      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-[#0057D9]/10 rounded-full blur-[90px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-[#00E5A0]/6 rounded-full blur-[110px] pointer-events-none z-0" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[60%] left-[45%] w-[250px] h-[250px] bg-[#00C2FF]/8 rounded-full blur-[80px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '10s' }} />
      
      {/* 1. LEFT SIDEBAR */}
      {!isFullscreen && (
      <aside className="w-[72px] lg:w-64 flex-shrink-0 bg-[#0F172A]/40 backdrop-blur-3xl border-r border-white/[0.06] flex flex-col transition-all duration-300 relative z-20 shadow-2xl">
        <div className="h-20 flex items-center px-6 border-b border-white/[0.06] shrink-0 gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#090D1A] border border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0 group">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#0057D9] via-[#00C2FF] to-[#00E5A0] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <div className="relative z-10 w-5 h-5 flex items-center justify-center">
              <LogoIcon className="w-full h-full" />
            </div>
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="font-black text-sm tracking-tight text-white leading-none uppercase">
              Instant<span className="bg-gradient-to-r from-[#00C2FF] to-[#00E5A0] bg-clip-text text-transparent">Site</span>
            </span>
            <span className="text-[9px] text-[#64748B] font-semibold tracking-wider uppercase mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
              Core v2.5
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={<Sparkles size={18} />} label="Generate" active={activeNav === 'generate'} onClick={() => setActiveNav('generate')} />
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
          <NavItem icon={<History size={18} />} label="Prompt History" active={activeNav === 'history'} onClick={() => setActiveNav('history')} />
          <NavItem icon={<LayoutTemplate size={18} />} label="Templates" active={activeNav === 'templates'} onClick={() => setActiveNav('templates')} />
          <NavItem icon={<FolderKanban size={18} />} label="My Projects" active={activeNav === 'projects'} onClick={() => setActiveNav('projects')} />
          <NavItem icon={<Github size={18} />} label="Git Sync" active={activeNav === 'gitsync'} onClick={() => setActiveNav('gitsync')} />
        </nav>

        {/* Database & Latency Metrics */}
        <div className="hidden lg:flex flex-col gap-2 p-3.5 mx-3 mb-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="flex items-center justify-between text-[10px] font-semibold text-white/50">
            <span>Database Status</span>
            <span className="flex items-center gap-1 text-[#00E5A0] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span> Supabase PG
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-white/50">
            <span>Server Response</span>
            <span className="text-[#00C2FF] font-bold">124ms</span>
          </div>
        </div>

        <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-1">
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          
          {/* Logout Action button */}
          <button
            onClick={() => { setUser(null); setCurrentRoute('landing'); }}
            className="w-full flex items-center p-3 rounded-xl transition-all duration-200 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border border-transparent cursor-pointer text-left focus:outline-none"
            title="Log Out"
          >
            <History size={18} className="rotate-180 shrink-0" />
            <span className="ml-3 text-sm font-semibold tracking-wide hidden lg:block truncate">Log Out</span>
          </button>

          <div className="mt-4 flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/[0.04] rounded-xl transition-all border border-transparent hover:border-white/[0.05] group">
            <div className="w-8 h-8 rounded-full border border-white/10 bg-gradient-to-br from-[#0057D9] via-[#00C2FF] to-[#00E5A0] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,194,255,0.2)]">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-semibold truncate text-white group-hover:text-[#00C2FF] transition-colors">{user ? user.name : "Pro User"}</p>
              <p className="text-[9px] text-[#00E5A0] uppercase tracking-wider font-extrabold mt-0.5">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        
        {/* 2. TOP BAR */}
        {!isFullscreen && (
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06] bg-[#081120]/30 backdrop-blur-md z-10 w-full">
          <div className="flex-1 flex items-center max-w-md">
            <div className="relative w-full group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-primary to-ai-secondary rounded-full blur opacity-0 group-focus-within:opacity-20 transition duration-300"></div>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search your projects..." 
                  className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/15 focus:border-ai-primary/40 focus:outline-none rounded-full pl-11 pr-4 py-2 text-sm transition-all text-white placeholder:text-white/20 truncate"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4 shrink-0">
            <div className="hidden md:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-full p-1 shadow-inner">
              <button className="px-4 py-1.5 flex items-center text-xs font-bold rounded-full bg-white/[0.06] text-white shadow transition-colors">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-400" /> Fast
              </button>
              <button className="px-4 py-1.5 flex items-center text-xs font-bold rounded-full text-white/50 hover:text-white transition-colors">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-ai-secondary" /> Pro
              </button>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white hover:border-white/15 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
        )}

        {/* 3 & 4. MAIN CONTENT */}
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-0">
          
          <div className="overflow-hidden flex relative flex-1">
            {/* Scrollable Main Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col lg:flex-row">
              {activeNav === 'generate' && (
                <>
                  {/* Mobile View Toggle Switcher (Visible on mobile/tablet when a site is generated) */}
                  {site && !isFullscreen && (
                    <div className="sticky top-0 bg-[#081120]/95 backdrop-blur-md border-b border-white/[0.06] p-2 flex gap-2 z-40 lg:hidden w-full flex-shrink-0">
                      <button
                        onClick={() => setWorkspaceMobileTab('prompt')}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                          workspaceMobileTab === 'prompt'
                            ? 'bg-[#0057D9]/20 text-[#00C2FF] border-[#00C2FF]/30 shadow-inner'
                            : 'bg-white/[0.02] border-transparent text-white/40 hover:text-white'
                        }`}
                      >
                        Builder Setup
                      </button>
                      <button
                        onClick={() => setWorkspaceMobileTab('preview')}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                          workspaceMobileTab === 'preview'
                            ? 'bg-[#00E5A0]/20 text-[#00E5A0] border-[#00E5A0]/30 shadow-inner'
                            : 'bg-white/[0.02] border-transparent text-white/40 hover:text-white'
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>
                  )}

                  {/* GENERATION / PROMPT AREA */}
                  <div className={isFullscreen ? 'hidden' : `transition-all duration-500 ease-in-out flex flex-col ${site ? 'w-full lg:w-[450px] xl:w-[500px] border-r border-white/[0.06] shrink-0 bg-[#0F172A]/20 backdrop-blur-xl' : 'flex-1 w-full bg-transparent max-w-6xl mx-auto px-6'} ${
                    site && workspaceMobileTab !== 'prompt' ? 'hidden lg:flex' : 'flex'
                  } overflow-y-auto`}>
                    
                    <div className={`flex flex-col flex-1 ${site ? 'p-6 pb-24 lg:pb-6' : 'pt-16 pb-12'}`}>
                  
                  {!site && (
                    <div className="mb-10 text-center space-y-4 pt-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ai-secondary/30 bg-ai-secondary/10 text-[#00C2FF] text-xs font-bold uppercase tracking-widest mb-4 animate-scale-in shadow-[0_0_20px_rgba(0,194,255,0.2)]">
                        <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" /> InstantSite AI Core v2.0
                      </div>
                      <h1 className="text-4xl lg:text-5xl lg:leading-tight font-extrabold tracking-tight pb-2">
                        <span className="gradient-text-hero">Build anything in seconds.</span>
                      </h1>
                      <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed">
                        Describe your dream website below. Our AI architect will generate production-ready code, beautiful UI, and high-converting layouts instantly.
                      </p>
                    </div>
                  )}

                  {site && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold tracking-tight text-white flex items-center">
                        <LayoutDashboard className="w-4.5 h-4.5 mr-2.5 text-ai-primary" /> Project Setup
                      </h2>
                    </div>
                  )}

                  {/* Huge Prompt Input Box (Glass Card Style) */}
                  <div className={`relative group ${!site ? 'shadow-[0_0_60px_-12px_rgba(0,87,217,0.25)]' : ''}`}>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-primary via-[#00C2FF] to-ai-secondary rounded-[2rem] blur opacity-15 group-focus-within:opacity-35 transition duration-500"></div>
                    <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] group-focus-within:border-[#00C2FF]/30 rounded-[1.5rem] p-5 lg:p-6 flex flex-col transition-all duration-300 shadow-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Describe your website requirements</span>
                      </div>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your website idea... e.g. Modern portfolio for a UI designer with a dark theme and glassmorphism cards."
                        className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-white text-base lg:text-lg min-h-[140px] placeholder:text-white/15"
                        />
                      
                      {/* Render attachments */}
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 mb-1 animate-fade-in relative z-10">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] hover:border-white/15 rounded-lg text-[10px] sm:text-xs text-white/70 hover:text-white transition-all shadow-inner">
                              <span>{file.type.startsWith("image/") ? '🖼️' : '📄'}</span>
                              <span className="truncate max-w-[120px] font-semibold">{file.name}</span>
                              <button 
                                onClick={() => removeAttachment(idx)} 
                                className="ml-1.5 text-white/30 hover:text-red-400 font-bold focus:outline-none cursor-pointer"
                                title="Remove File"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons inside/below input */}
                      <div className="flex flex-wrap items-center justify-between mt-5 pt-4 border-t border-white/[0.06] gap-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button onClick={surpriseMe} disabled={isGenerating} className="p-2.5 text-white/40 hover:text-[#00C2FF] hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer" title="Surprise Me">
                            <Dices className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => setPrompt('')} disabled={isGenerating} className="p-2.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all cursor-pointer" title="Clear">
                            <Eraser className="w-4.5 h-4.5" />
                          </button>
                          
                          <input 
                            type="file" 
                            id="file-uploader" 
                            multiple 
                            className="hidden" 
                            onChange={handleFileUpload} 
                            disabled={isGenerating}
                          />
                          <button 
                            onClick={() => document.getElementById('file-uploader')?.click()} 
                            disabled={isGenerating} 
                            className={`p-2.5 text-white/40 hover:text-[#00E5A0] hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer border border-transparent ${attachments.length > 0 ? 'text-[#00E5A0] bg-[#00E5A0]/10 border-[#00E5A0]/20' : ''}`} 
                            title="Attach File (PRD, Text, Image)"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                          </button>

                          <button
                            onClick={enhancePrompt}
                            disabled={isGenerating || !prompt.trim()}
                            className="px-3.5 py-2 text-xs font-bold text-white/60 hover:text-[#00E5A0] hover:bg-white/[0.04] rounded-xl transition-all border border-white/[0.06] hover:border-[#00E5A0]/20 hidden sm:flex items-center gap-1.5 focus:outline-none disabled:opacity-40 disabled:hover:text-white/60 disabled:hover:bg-transparent disabled:border-white/[0.06] cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5" /> Improve Prompt
                          </button>
                        </div>
                        
                        <button
                          onClick={generateSite}
                          disabled={isGenerating || !prompt.trim()}
                          className={`px-6 py-3.5 btn-primary text-white font-extrabold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                            site && site.stylePreset !== stylePreset
                              ? 'animate-pulse shadow-[0_0_25px_rgba(0,194,255,0.45)] ring-2 ring-[#00C2FF]/50 border border-[#00C2FF]/60'
                              : 'shadow-lg shadow-ai-primary/20'
                          }`}
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="w-4.5 h-4.5" /> {site ? 'Regenerate' : 'Generate Website'}</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2 animate-fade-in">
                      <div className="mt-0.5"><Focus className="w-4 h-4 shrink-0" /></div>
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  {/* Refinement Options */}
                  <div className={`mt-6 lg:mt-8 space-y-6 ${!site ? 'opacity-90 hover:opacity-100 transition-all duration-300 animate-fade-in' : ''}`}>
                    
                    {/* Style Preset Selector Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Layout size={12} className="text-[#00C2FF]"/> Style Preset
                        </label>
                        {site && site.stylePreset !== stylePreset && (
                          <span className="text-[9px] text-[#00C2FF] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 bg-[#00C2FF]/10 px-2 py-0.5 rounded border border-[#00C2FF]/20">
                            ⚡ Preset modified
                          </span>
                        )}
                      </div>
                      {site && site.stylePreset !== stylePreset && (
                        <p className="text-[10px] text-white/50 bg-[#0057D9]/10 border border-[#0057D9]/20 p-2 rounded-xl leading-relaxed flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#00C2FF] shrink-0 mt-0.5 animate-pulse" />
                          <span>This preset alters structural CSS/HTML guidelines. Click <strong>Regenerate</strong> to rebuild your code.</span>
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'Modern SaaS', icon: <Zap size={14} className="text-indigo-400" />, desc: 'Modern tech & SaaS product styling' },
                          { id: 'Minimalist Portfolio', icon: <User size={14} className="text-emerald-400" />, desc: 'Clean, elegant personal presence' },
                          { id: 'Premium Brutalist', icon: <LayoutTemplate size={14} className="text-amber-400" />, desc: 'Bold typography & grid structures' },
                          { id: 'Glassmorphism', icon: <Layers size={14} className="text-pink-400" />, desc: 'Frosted overlays & glowing depths' }
                        ].map((preset) => {
                          const isActive = stylePreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => setStylePreset(preset.id)}
                              disabled={isGenerating}
                              className={`p-3.5 text-left rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden bg-white/[0.01] hover:bg-white/[0.03] ${isActive ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15),inset_0_0_12px_rgba(99,102,241,0.05)] bg-[#0057D9]/5' : 'border-white/[0.08]'}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 ${isActive ? 'border-indigo-500/30 bg-indigo-500/10' : ''}`}>
                                    {preset.icon}
                                  </div>
                                  <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{preset.id}</span>
                                </div>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                )}
                              </div>
                              <p className="text-[10px] text-white/40 mt-2 leading-relaxed group-hover:text-white/60 transition-colors">{preset.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Typography Selector Cards */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Type size={12} className="text-[#00E5A0]"/> Typography Font
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'Inter (Sans-serif)', label: 'Aa Inter', fontClass: 'font-sans', desc: 'Clean Sans' },
                          { id: 'Space Grotesk (Tech)', label: 'Aa Grotesk', fontClass: 'font-mono', desc: 'Modern Tech' },
                          { id: 'Playfair (Serif)', label: 'Aa Playfair', fontClass: 'font-serif', desc: 'Elegant Serif' }
                        ].map((font) => {
                          const isActive = typography === font.id;
                          return (
                            <button
                              key={font.id}
                              onClick={() => setTypography(font.id)}
                              disabled={isGenerating}
                              className={`p-3 text-center rounded-xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 bg-white/[0.01] hover:bg-white/[0.03] ${isActive ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15),inset_0_0_12px_rgba(16,185,129,0.05)] bg-[#00E5A0]/5' : 'border-white/[0.08]'}`}
                            >
                              <span className={`text-base font-bold tracking-wide ${font.fontClass} ${isActive ? 'text-white' : 'text-white/60'}`}>{font.label}</span>
                              <span className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">{font.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Brand Colors Color Picker */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Palette size={12} className="text-rose-400"/> Brand Primary Color
                      </label>
                      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white/[0.01] border border-white/[0.05] rounded-2xl w-full sm:w-max">
                        {[
                          { id: 'indigo', class: 'bg-indigo-500 shadow-indigo-500/20', label: 'Indigo' },
                          { id: 'rose', class: 'bg-rose-500 shadow-rose-500/20', label: 'Rose' },
                          { id: 'emerald', class: 'bg-emerald-500 shadow-emerald-500/20', label: 'Emerald' },
                          { id: 'cyan', class: 'bg-cyan-500 shadow-cyan-500/20', label: 'Cyan' },
                          { id: 'slate', class: 'bg-slate-500 shadow-slate-500/20', label: 'Slate' },
                          { id: 'violet', class: 'bg-violet-600 shadow-violet-600/20', label: 'Violet' }
                        ].map((c) => {
                          const isActive = brandColor === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setBrandColor(c.id)}
                              disabled={isGenerating}
                              className={`w-10 h-10 rounded-xl ${c.class} shadow-lg border transition-all duration-300 flex flex-col items-center justify-center shrink-0 cursor-pointer relative group ${isActive ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent hover:scale-105'}`}
                              aria-label={`Select ${c.id} color`}
                              title={c.label}
                            >
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              )}
                              <span className="absolute -bottom-8 bg-black/80 border border-white/10 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Website Reference Matcher */}
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe size={12} className="text-[#00C2FF] animate-pulse"/> Match Design Aesthetic (Optional URL)
                      </label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] rounded-xl blur opacity-10 group-focus-within:opacity-25 transition"></div>
                        <input
                          type="url"
                          value={referenceUrl}
                          onChange={(e) => setReferenceUrl(e.target.value)}
                          placeholder="e.g. https://stripe.com or https://linear.app"
                          className="w-full bg-white/[0.01] border border-white/[0.08] focus:border-[#00C2FF]/30 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-white/30 leading-snug">Input any website URL. The JIT compiler will fetch or mimic its style, spacing, cards, and aesthetic grids.</p>
                    </div>

                  </div>

                  {!site && (
                    <div className="mt-12 border-t border-white/[0.06] pt-8 animate-fade-in relative z-10 pb-12">
                      <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <LayoutTemplate className="w-3.5 h-3.5 text-ai-primary" /> Start with a Template
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {templates.map((tpl, i) => (
                          <div 
                            key={i} 
                            onClick={() => setPrompt(`Generate a ${tpl.title.toLowerCase()}. ${tpl.desc}. Make it look like a highly premium product.`)} 
                            className="glass-card hover-3d-lift animate-shine p-4 cursor-pointer bg-white/[0.01] border border-white/[0.08] hover:border-[#00C2FF]/30 hover:bg-[#00C2FF]/5 transition-all duration-300 relative group overflow-hidden"
                          >
                            <div className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 group-hover:bg-[#00C2FF]/20 group-hover:text-white transition-colors">{tpl.tag}</div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">{tpl.icon}</div>
                            <h4 className="font-semibold text-sm leading-tight text-white">{tpl.title}</h4>
                            <p className="text-xs text-white/50 mt-1.5 leading-snug">{tpl.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                    </div>
                  </div>

                  {/* 4. OUTPUT PREVIEW PANEL */}
                  {site && (
                    <div className={`flex-1 flex flex-col min-w-0 bg-[#081120]/40 relative animate-fade-in h-full z-10 w-full overflow-hidden ${
                      isFullscreen ? 'flex' : (workspaceMobileTab === 'preview' ? 'flex h-[calc(100vh-140px)] lg:h-full' : 'hidden lg:flex')
                    }`}>
                      {/* Preview Header */}
                      <div className={`h-14 flex-shrink-0 border-b border-white/[0.06] bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-between px-2 sm:px-4 z-20 w-full ${isFullscreen ? 'hidden' : ''}`}>
                        
                        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
                          <PreviewTab active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}><MonitorPlay className="w-3.5 h-3.5 sm:mr-1.5 text-ai-secondary" /><span className="hidden sm:inline">Preview</span></PreviewTab>
                          <PreviewTab active={activeTab === 'html'} onClick={() => setActiveTab('html')}><Code2 className="w-3.5 h-3.5 sm:mr-1.5 text-orange-400" /><span className="hidden sm:inline">HTML</span></PreviewTab>
                          <PreviewTab active={activeTab === 'css'} onClick={() => setActiveTab('css')}><Code2 className="w-3.5 h-3.5 sm:mr-1.5 text-[#00C2FF]" /><span className="hidden sm:inline">CSS</span></PreviewTab>
                          <PreviewTab active={activeTab === 'js'} onClick={() => setActiveTab('js')}><Layers className="w-3.5 h-3.5 sm:mr-1.5 text-[#00E5A0]" /><span className="hidden sm:inline">JS</span></PreviewTab>
                          {activeTab === 'preview' && (
                            <button 
                              onClick={() => setIsEditMode(!isEditMode)}
                              className={`ml-2 px-2.5 py-1 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs rounded-lg transition-all font-bold uppercase tracking-wider ${isEditMode ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/30 shadow-[0_0_10px_rgba(0,229,160,0.15)] animate-pulse' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}
                              title="Edit Elements"
                            >
                              <Wand2 className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Edit Mode</span>
                            </button>
                          )}
                        </div>

                        {activeTab === 'preview' && (
                          <div className="hidden sm:flex items-center gap-1 mx-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] shrink-0">
                            <ViewportBtn active={viewportSize === 'mobile'} onClick={() => setViewportSize('mobile')}><Smartphone className="w-4 h-4" /></ViewportBtn>
                            <ViewportBtn active={viewportSize === 'tablet'} onClick={() => setViewportSize('tablet')}><Tablet className="w-4 h-4" /></ViewportBtn>
                            <ViewportBtn active={viewportSize === 'desktop'} onClick={() => setViewportSize('desktop')}><Monitor className="w-4 h-4" /></ViewportBtn>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          {activeTab !== 'preview' ? (
                            <button 
                              onClick={handleCopy}
                              className="px-3 sm:px-4 py-1.5 btn-secondary rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center border border-white/10"
                            >
                              {copySuccess ? <><Check className="w-3 h-3 mr-1 text-[#00E5A0]" /> Copied</> : 'Copy Code'}
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={handleDownload}
                                className="px-3 py-1.5 btn-secondary rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                                title="Download ZIP"
                              >
                                <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">ZIP</span>
                              </button>
                              <button 
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="px-4 py-1.5 btn-accent rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,160,0.2)]"
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
                                onClick={toggleFullscreen}
                                className="px-3 py-1.5 btn-secondary rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                              >
                                {isFullscreen ? <Minimize className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Maximize className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Preview Content Area */}
                      <div className="flex-1 overflow-hidden flex bg-white/[0.01] relative z-10 h-full w-full">
                        {isFullscreen && activeTab === 'preview' && (
                          <button
                            onClick={toggleFullscreen}
                            className="absolute top-4 right-4 z-50 px-4 py-2 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            title="Exit Fullscreen"
                          >
                            <Minimize className="w-4 h-4 text-[#00C2FF] group-hover:scale-110 transition-transform" />
                            <span>Exit Fullscreen</span>
                          </button>
                        )}
                        {activeTab === 'preview' ? (
                          <LivePreview 
                            site={site} 
                            viewportSize={viewportSize} 
                            isEditMode={isEditMode} 
                            typography={typography} 
                            activeBrandColor={brandColor} 
                            isFullscreen={isFullscreen} 
                          />
                        ) : (
                          <div className="flex-1 w-full relative h-full">
                            <Editor
                              height="100%"
                              language={activeTab === 'html' ? 'html' : activeTab === 'css' ? 'css' : 'javascript'}
                              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                              value={activeTab === 'html' ? site?.html || '' : activeTab === 'css' ? site?.css || '' : site?.js || ''}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'Space Grotesk', monospace",
                                wordWrap: 'on',
                                readOnly: true,
                                padding: { top: 24, bottom: 24 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                              }}
                              loading={<div className="flex items-center justify-center text-white/50 h-full text-sm font-medium"><Loader2 className="w-5 h-5 animate-spin mr-2 text-ai-secondary" /> Loading Editor...</div>}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeNav === 'dashboard' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight"><span className="gradient-text-hero">Developer Dashboard</span></h2>
                      <p className="text-sm text-white/50 mt-1">Real-time compilation metrics, server stats, and deployment logs.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">Server Status: Online</span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group hover:border-[#0057D9]/30 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0057D9]/15 to-transparent rounded-bl-full opacity-50"></div>
                      <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Total Sites Built</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>24</p>
                        <span className="text-[10px] font-bold text-[#00E5A0] bg-[#00E5A0]/10 px-1.5 py-0.5 rounded">+12% wk</span>
                      </div>
                    </div>
                    
                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group hover:border-[#00C2FF]/30 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#00C2FF]/10 to-transparent rounded-bl-full opacity-50"></div>
                      <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">AI API Latency</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold text-[#00C2FF] tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>0.21s</p>
                        <span className="text-[10px] font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-1.5 py-0.5 rounded">Optimal</span>
                      </div>
                    </div>

                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group hover:border-[#00E5A0]/30 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#00E5A0]/10 to-transparent rounded-bl-full opacity-50"></div>
                      <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Database Cluster</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-[#00E5A0] tracking-tight">Active</p>
                        <span className="text-[10px] font-bold text-white/40">Supabase</span>
                      </div>
                    </div>

                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full opacity-50"></div>
                      <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Credit Limit</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-white tracking-tight">Unlimited</p>
                        <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Developer</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Graph Section & Terminal Logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Activity Graph */}
                    <div className="lg:col-span-2 glass-card bg-white/[0.01] border border-white/[0.08] p-5 flex flex-col justify-between min-h-[300px]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Generation Activity</h3>
                        <span className="text-[10px] text-white/40">Last 7 Days</span>
                      </div>
                      
                      {/* Interactive SVG graph */}
                      <div className="w-full h-44 relative flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#0057D9" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                          
                          {/* Gradient fill */}
                          <path 
                            d="M 0 35 Q 16 12, 33 22 T 66 10 T 100 28 L 100 40 L 0 40 Z" 
                            fill="url(#chartGradient)"
                          />
                          
                          {/* Glowing line path */}
                          <path 
                            d="M 0 35 Q 16 12, 33 22 T 66 10 T 100 28" 
                            fill="none" 
                            stroke="url(#lineGradient)" 
                            strokeWidth="0.8"
                            className="animate-dash"
                          />
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#0057D9" />
                              <stop offset="50%" stopColor="#00C2FF" />
                              <stop offset="100%" stopColor="#00E5A0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Custom visual marker circles over the SVG path positions */}
                        <div className="absolute left-[16%] bottom-[58%] w-2 h-2 rounded-full bg-[#0057D9] border-2 border-white shadow-[0_0_8px_#0057D9] scale-90"></div>
                        <div className="absolute left-[33%] bottom-[43%] w-2 h-2 rounded-full bg-[#00C2FF] border-2 border-white shadow-[0_0_8px_#00C2FF] scale-90"></div>
                        <div className="absolute left-[66%] bottom-[73%] w-2 h-2 rounded-full bg-[#00E5A0] border-2 border-white shadow-[0_0_8px_#00E5A0] scale-90"></div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-white/30 font-bold px-1 mt-4">
                        <span>MON</span>
                        <span>TUE</span>
                        <span>WED</span>
                        <span>THU</span>
                        <span>FRI</span>
                        <span>SAT</span>
                        <span>SUN</span>
                      </div>
                    </div>

                    {/* Simulated Server Logs Widget */}
                    <div className="glass-card bg-[#050B14] border border-white/[0.08] p-5 flex flex-col justify-between h-[300px]">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Live Console Stream</h3>
                        </div>
                        <span className="text-[9px] font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-1.5 py-0.5 rounded">stdout</span>
                      </div>
                      
                      {/* Terminal screen */}
                      <div className="flex-1 w-full bg-black/40 border border-white/[0.04] p-3.5 rounded-xl font-mono text-[10px] text-[#A6ADBB] space-y-2 overflow-y-auto terminal-scrollbar leading-relaxed">
                        {dashboardLogs.map((log, idx) => {
                          const isError = log.includes("[ERROR]");
                          const isSuccess = log.includes("[SUCCESS]");
                          const isWarn = log.includes("[WARN]");
                          const isDb = log.includes("[DB]");
                          const isAi = log.includes("[AI]");
                          
                          let lineClass = "text-white/60";
                          if (isError) lineClass = "text-red-400 font-bold";
                          else if (isSuccess) lineClass = "text-[#00E5A0] font-bold";
                          else if (isWarn) lineClass = "text-yellow-400";
                          else if (isDb) lineClass = "text-amber-400";
                          else if (isAi) lineClass = "text-cyan-400";
                          
                          return (
                            <div key={idx} className="flex gap-1.5">
                              <span className="text-white/30 shrink-0 select-none">&gt;</span>
                              <p className={lineClass}>{log}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeNav === 'history' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto relative z-10">
                  <h2 className="text-3xl font-extrabold mb-8 tracking-tight"><span className="gradient-text-hero">Prompt History</span></h2>
                  <div className="space-y-4">
                    {[
                      { id: 1, prompt: "A dark-themed landing page for a cutting-edge quantum computing startup", time: "2 hours ago" },
                      { id: 2, prompt: "Modern portfolio for a UI designer with glassmorphism", time: "Yesterday" },
                      { id: 3, prompt: "Minimalist coffee shop eCommerce site", time: "3 days ago" }
                    ].map(item => (
                      <div key={item.id} className="glass-card hover-3d-lift bg-white/[0.01] border border-white/[0.08] p-5 hover:border-[#00C2FF]/30 transition-all duration-300">
                        <p className="text-white text-base leading-relaxed">{item.prompt}</p>
                        <p className="text-xs text-white/40 mt-3 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-ai-secondary" /> {item.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === 'templates' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto relative z-10">
                  <h2 className="text-3xl font-extrabold mb-8 tracking-tight"><span className="gradient-text-hero">Templates Library</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tpl, i) => (
                      <div 
                        key={i} 
                        onClick={() => { setPrompt(`Generate a ${tpl.title.toLowerCase()}. ${tpl.desc}. Make it look like a highly premium product.`); setActiveNav('generate'); setSite(null); }}
                        className="glass-card hover-3d-lift animate-shine bg-white/[0.01] border border-white/[0.08] p-5 hover:border-[#00C2FF]/30 cursor-pointer transition-all duration-300 group"
                      >
                        {/* Wireframe Previews */}
                        {tpl.title === "SaaS Landing Page" && (
                          <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-500/10 via-[#00C2FF]/5 to-transparent mb-4 border border-white/[0.04] p-3 flex flex-col justify-between group-hover:border-[#00C2FF]/20 transition-colors relative overflow-hidden">
                            <div className="absolute top-2 right-2 w-12 h-12 bg-indigo-500/20 rounded-full blur-md"></div>
                            <div className="flex justify-between items-center bg-white/[0.03] border border-white/[0.05] p-1.5 rounded-lg">
                              <div className="w-8 h-1.5 bg-white/20 rounded"></div>
                              <div className="flex gap-1.5">
                                <div className="w-4 h-1 bg-white/10 rounded"></div>
                                <div className="w-4 h-1 bg-white/10 rounded"></div>
                              </div>
                              <div className="w-6 h-1.5 bg-indigo-500/40 rounded"></div>
                            </div>
                            <div className="flex gap-2 items-center my-auto">
                              <div className="flex-1 space-y-1.5">
                                <div className="w-16 h-2 bg-white/25 rounded"></div>
                                <div className="w-10 h-1 bg-white/10 rounded"></div>
                                <div className="w-12 h-2.5 bg-indigo-500/35 rounded-full"></div>
                              </div>
                              <div className="w-14 h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg shadow-inner flex items-center justify-center">
                                <div className="w-8 h-5 bg-gradient-to-br from-[#00C2FF]/30 to-indigo-500/20 rounded"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {tpl.title === "Portfolio Website" && (
                          <div className="w-full h-36 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#00E5A0]/5 to-transparent mb-4 border border-white/[0.04] p-3 flex flex-col justify-between group-hover:border-[#00E5A0]/20 transition-colors relative overflow-hidden">
                            <div className="absolute bottom-2 right-2 w-14 h-14 bg-emerald-500/10 rounded-full blur-lg"></div>
                            <div className="flex flex-col items-center gap-1.5 mt-2">
                              <div className="w-8 h-8 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
                                <User size={10} className="text-emerald-400" />
                              </div>
                              <div className="w-16 h-1.5 bg-white/25 rounded"></div>
                              <div className="w-24 h-1 bg-white/10 rounded"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 mt-auto">
                              <div className="h-5 bg-white/[0.02] border border-white/[0.06] rounded"></div>
                              <div className="h-5 bg-white/[0.02] border border-white/[0.06] rounded"></div>
                              <div className="h-5 bg-white/[0.02] border border-white/[0.06] rounded"></div>
                            </div>
                          </div>
                        )}
                        {tpl.title === "E-commerce Store" && (
                          <div className="w-full h-36 rounded-xl bg-gradient-to-br from-rose-500/10 via-[#00E5A0]/5 to-transparent mb-4 border border-white/[0.04] p-3 flex flex-col justify-between group-hover:border-rose-500/20 transition-colors relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-rose-500/10 rounded-full blur-xl"></div>
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-2 bg-white/25 rounded"></div>
                              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 flex items-center justify-center"><Palette size={8} className="text-rose-400" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 my-auto">
                              <div className="p-1 bg-white/[0.02] border border-white/[0.06] rounded flex flex-col gap-1">
                                <div className="w-full h-8 bg-gradient-to-tr from-rose-500/10 to-transparent rounded"></div>
                                <div className="w-6 h-1 bg-white/20 rounded"></div>
                              </div>
                              <div className="p-1 bg-white/[0.02] border border-white/[0.06] rounded flex flex-col gap-1">
                                <div className="w-full h-8 bg-gradient-to-tr from-rose-500/10 to-transparent rounded"></div>
                                <div className="w-6 h-1 bg-white/20 rounded"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full mt-2">
                          <h4 className="font-semibold text-base text-white">{tpl.title}</h4>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 group-hover:bg-[#00C2FF]/20 group-hover:text-white transition-colors">{tpl.tag}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{tpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === 'projects' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto relative z-10">
                  <h2 className="text-3xl font-extrabold mb-8 tracking-tight"><span className="gradient-text-hero">My Projects</span></h2>
                  <div className="flex flex-col items-center justify-center p-12 glass-card bg-white/[0.01] border border-white/[0.08] border-dashed">
                    <FolderKanban className="w-12 h-12 text-white/20 mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold text-white/80">No saved projects yet</h3>
                    <p className="text-sm text-white/40 max-w-sm text-center mt-2 mb-6 leading-relaxed">Generate a new website. Your saved projects will appear here.</p>
                    <button onClick={() => setActiveNav('generate')} className="px-6 py-2.5 btn-secondary rounded-xl text-sm font-semibold transition-all">Start Generating</button>
                  </div>
                </div>
              )}

              {activeNav === 'gitsync' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-4xl mx-auto relative z-10 space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight"><span className="gradient-text-hero">Git Integration & Sync</span></h2>
                    <p className="text-sm text-[#94A3B8] mt-1">Directly import layouts from GitHub repositories or deploy sandbox releases to online repositories.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GitHub Importer */}
                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
                          <Github className="w-5 h-5 text-[#00E5A0]" />
                          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Import Public Repository</h3>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">Import static index.html, style.css, and script.js files from a public GitHub repository. This will instantly bootstrap your sandbox workspace code.</p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">GitHub Repository Path</label>
                          <input 
                            type="text" 
                            value={gitRepoPath}
                            onChange={(e) => setGitRepoPath(e.target.value)}
                            placeholder="e.g. dattasable/nextdial-crm" 
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-[#00E5A0]/40 focus:outline-none" 
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={async () => {
                            if (!gitRepoPath.trim()) return;
                            setGitImporting(true);
                            setGitSuccessMsg('');
                            const repo = gitRepoPath.replace('https://github.com/', '').trim();
                            const files = ['index.html', 'style.css', 'script.js'];
                            
                            const logsList = [
                              `[GIT] Connecting to github.com/${repo}...`,
                              `[GIT] Fetching repository branches...`,
                              `[GIT] Checking standard files (index.html, style.css, script.js)...`
                            ];
                            setGitLogs(logsList);

                            try {
                              let htmlStr = '';
                              let cssStr = '';
                              let jsStr = '';

                              // Helper fetch
                              const fetchFile = async (name: string) => {
                                // Try main branch first, fallback to master
                                try {
                                  const r = await fetch(`https://raw.githubusercontent.com/${repo}/main/${name}`);
                                  if (r.ok) return await r.text();
                                } catch(e) {}
                                try {
                                  const r = await fetch(`https://raw.githubusercontent.com/${repo}/master/${name}`);
                                  if (r.ok) return await r.text();
                                } catch(e) {}
                                return '';
                              };

                              htmlStr = await fetchFile('index.html');
                              cssStr = await fetchFile('style.css');
                              jsStr = await fetchFile('script.js');

                              if (!htmlStr) {
                                // Check if we can get index.html from app/ or src/
                                htmlStr = await fetchFile('src/index.html') || await fetchFile('public/index.html');
                              }

                              if (!htmlStr) {
                                throw new Error("Could not find index.html at root, src/ or public/ folders of main/master branch.");
                              }

                              // Set site data
                              setSite({
                                title: repo.split('/')[1] || "Imported Repo",
                                description: `Imported from github.com/${repo}`,
                                design_style: "Imported Workspace Layout",
                                html: htmlStr,
                                css: cssStr,
                                js: jsStr,
                                typography: 'Inter',
                                brandColor: 'indigo'
                              });

                              setGitLogs(prev => [...prev, 
                                `[SUCCESS] Cloned and compiled ${repo} successfully.`,
                                `[WORKSPACE] Staged: index.html (${htmlStr.length} bytes)`,
                                `[WORKSPACE] Staged: style.css (${cssStr.length} bytes)`,
                                `[WORKSPACE] Staged: script.js (${jsStr.length} bytes)`
                              ]);
                              setGitSuccessMsg("Repository cloned successfully into sandbox!");
                              setTimeout(() => {
                                setActiveNav('generate');
                                setActiveTab('preview');
                              }, 1500);

                            } catch (e: any) {
                              setGitLogs(prev => [...prev, `[ERROR] Clone failed: ${e.message || String(e)}`]);
                            } finally {
                              setGitImporting(false);
                            }
                          }}
                          disabled={gitImporting}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-[#00E5A0] hover:from-emerald-700 hover:to-[#00C896] text-[#081120] text-xs font-extrabold uppercase rounded-xl shadow-lg transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-2"
                        >
                          {gitImporting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Cloning repo...</>
                          ) : (
                            <><Zap className="w-4 h-4" /> Clone & Import Style</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* GitHub Exporter commit dashboard */}
                    <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
                          <Globe className="w-5 h-5 text-[#00C2FF]" />
                          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Push releasing builds</h3>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">Simulate a production-grade webhook deployment by pushing files (index.html, style.css, script.js) into a release commit build.</p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Commit Message</label>
                          <input 
                            type="text" 
                            value={gitCommitMsg}
                            onChange={(e) => setGitCommitMsg(e.target.value)}
                            placeholder="feat: deploy landing page layouts" 
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-[#00C2FF]/40 focus:outline-none" 
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={() => {
                            if (!site) {
                              setGitLogs([`[ERROR] No compilation site present in workspace. Generate a site first.`]);
                              return;
                            }
                            setGitExporting(true);
                            setGitSuccessMsg('');
                            const repo = gitRepoPath.replace('https://github.com/', '').trim();
                            
                            const logsList = [
                              `[GIT] Initializing local repository environment...`,
                              `[GIT] Staging changes: index.html, style.css, script.js`,
                              `[GIT] Executing commit: "${gitCommitMsg}"`
                            ];
                            setGitLogs(logsList);

                            setTimeout(() => {
                              setGitLogs(prev => [...prev, `[GIT] Connecting to remote origin main branch...`]);
                              setTimeout(() => {
                                setGitLogs(prev => [...prev, 
                                  `[SUCCESS] Pushed commit 7a91b2c to repository github.com/${repo}/main`,
                                  `[DEPLOY] Build completed successfully. Site live at: https://${repo.split('/')[1] || 'sandbox'}.instantsite.app`
                                ]);
                                setGitSuccessMsg("Sandbox repository pushed successfully!");
                                setGitExporting(false);
                              }, 800);
                            }, 800);
                          }}
                          disabled={gitExporting || !site}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-[#00C2FF] hover:from-blue-700 hover:to-[#00B2E6] text-white text-xs font-extrabold uppercase rounded-xl shadow-lg transition-all cursor-pointer focus:outline-none disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                          {gitExporting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Pushing Release...</>
                          ) : (
                            <><Github className="w-4 h-4" /> Push Sandbox Commit</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Git Logs Terminal Console */}
                  {gitLogs.length > 0 && (
                    <div className="glass-card bg-[#050B14] border border-white/[0.08] p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A0]"></span>
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Git Console Logs</h3>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl font-mono text-xs text-[#A6ADBB] space-y-2 max-h-[220px] overflow-y-auto terminal-scrollbar leading-relaxed text-left">
                        {gitLogs.map((log, idx) => {
                          let lineClass = "text-white/60";
                          if (log.includes("[ERROR]")) lineClass = "text-red-400 font-bold";
                          else if (log.includes("[SUCCESS]")) lineClass = "text-[#00E5A0] font-bold";
                          else if (log.includes("[WORKSPACE]") || log.includes("[DEPLOY]")) lineClass = "text-cyan-400";
                          
                          return (
                            <div key={idx} className="flex gap-1.5">
                              <span className="text-white/30 shrink-0 select-none">&gt;</span>
                              <p className={lineClass}>{log}</p>
                            </div>
                          );
                        })}
                      </div>

                      {gitSuccessMsg && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[#00E5A0] text-xs font-semibold animate-fade-in text-left">
                          {gitSuccessMsg}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {activeNav === 'settings' && (
                <div className="flex-1 w-full flex flex-col p-6 lg:p-10 overflow-y-auto max-w-3xl mx-auto relative z-10 space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight"><span className="gradient-text-hero">Settings</span></h2>
                    <p className="text-sm text-white/50 mt-1">Configure AI engine parameters, compilation workflows, and developer profiles.</p>
                  </div>

                  {/* AI Model Engine Parameters */}
                  <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl space-y-5">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-[#00C2FF] flex items-center gap-2">
                      <Sparkles size={14} /> AI Engine parameters
                    </h3>
                    
                    {/* Model Choice */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 block">Select AI Model</label>
                      <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06]">
                        <button 
                          onClick={() => setAiModel('gemini-2.5-flash')}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${aiModel === 'gemini-2.5-flash' ? 'bg-white/[0.08] text-white border border-white/10 shadow-sm' : 'text-white/40 hover:text-white'}`}
                        >
                          Gemini 2.5 Flash (Fast)
                        </button>
                        <button 
                          onClick={() => setAiModel('gemini-2.5-pro')}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${aiModel === 'gemini-2.5-pro' ? 'bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20 shadow-sm' : 'text-white/40 hover:text-white'}`}
                        >
                          Gemini 2.5 Pro (Deep reasoning)
                        </button>
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-white/70">AI Temperature (Creativity)</label>
                        <span className="text-xs font-mono font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-2 py-0.5 rounded">{temperature}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.2" 
                        max="1.0" 
                        step="0.1" 
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00C2FF]"
                      />
                      <div className="flex justify-between text-[10px] text-white/30 font-bold">
                        <span>PRECISE (0.2)</span>
                        <span>BALANCED (0.7)</span>
                        <span>CREATIVE (1.0)</span>
                      </div>
                    </div>
                  </div>

                  {/* Dev Pipeline & Features Toggles */}
                  <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-[#00E5A0] flex items-center gap-2">
                      <Settings size={14} /> Compilation Pipeline Flags
                    </h3>
                    
                    <div className="space-y-3.5 pt-2">
                      {[
                        { key: 'minify', label: 'Minify Build Output', desc: 'Optimize stylesheet, HTML DOM nodes, and JS scripts for speed.' },
                        { key: 'jsxExport', label: 'Export React (JSX) Wrappers', desc: 'Convert index.html outputs to modular Vite/React templates automatically.' },
                        { key: 'enhancedPrompts', label: 'Advanced Prompt Enhancer', desc: 'AI-refine the descriptive input guidelines before layout compilation.' }
                      ].map((flag) => {
                        const val = optFlags[flag.key as keyof typeof optFlags];
                        return (
                          <div key={flag.key} className="flex items-start justify-between gap-4 p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                            <div>
                              <span className="text-xs font-semibold text-white block">{flag.label}</span>
                              <span className="text-[10px] text-white/40 block mt-0.5">{flag.desc}</span>
                            </div>
                            <button
                              onClick={() => setOptFlags(prev => ({ ...prev, [flag.key]: !val }))}
                              className={`w-9 h-5 rounded-full transition-all shrink-0 cursor-pointer relative ${val ? 'bg-[#00E5A0]' : 'bg-white/10'}`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full bg-[#081120] absolute top-0.75 transition-all ${val ? 'right-0.75' : 'left-0.75'}`}></div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Supabase & DB sync status */}
                  <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-white/50 flex items-center gap-2">
                      <FolderKanban size={14} /> Database Integration
                    </h3>
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Supabase Endpoint</label>
                        <input 
                          type="text" 
                          readOnly 
                          value="aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" 
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white/50 font-mono focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Setup secret token</label>
                        <input 
                          type="password" 
                          readOnly 
                          value="••••••••••••••••••••••••••••" 
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white/30 font-mono focus:outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="glass-card bg-[#0F172A]/40 border border-white/[0.08] p-6 shadow-2xl">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-rose-400 flex items-center gap-2 mb-4">
                      <User size={14} /> Developer Account
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Developer Email</label>
                        <input type="text" readOnly value="developer@instantsite.ai" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white/70 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Subscription plan</label>
                        <div className="flex items-center gap-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2">
                           <Sparkles className="w-3.5 h-3.5 text-[#00E5A0]" />
                           <span className="text-xs text-[#00E5A0] font-extrabold uppercase tracking-wider">Enterprise Pro</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR (AI SUGGESTIONS) */}
          {(!site || activeNav !== 'generate') && (
            <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-white/[0.06] bg-[#0F172A]/20 backdrop-blur-md overflow-y-auto z-10 p-6">
              <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-white uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-ai-primary" /> AI Suggestions
              </h3>

              <div className="space-y-6">
                <div className="glass-card bg-white/[0.01] border border-white/[0.08] rounded-2xl p-4 shadow-sm">
                  <h4 className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-wider">Trending Prompts</h4>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => { setPrompt('Modern SaaS landing page for an AI-powered CRM with a dark theme and glassmorphism'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-white/[0.04] rounded-xl text-xs transition-colors text-white/70 hover:text-white">SaaS Landing Page</button>
                    <button onClick={() => { setPrompt('Minimalist portfolio for a freelance UI/UX designer with bold typography and a light theme'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-white/[0.04] rounded-xl text-xs transition-colors text-white/70 hover:text-white">Designer Portfolio</button>
                    <button onClick={() => { setPrompt('Boutique e-commerce store selling premium coffee beans, warm color palette'); setSite(null); setActiveNav('generate'); }} className="text-left py-2 px-3 hover:bg-white/[0.04] rounded-xl text-xs transition-colors text-white/70 hover:text-white">Coffee eCommerce</button>
                  </div>
                </div>

                <div className="glass-card bg-gradient-to-br from-ai-primary/10 to-ai-secondary/5 border border-ai-primary/20 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-ai-primary/30 to-transparent rounded-bl-full opacity-50"></div>
                  <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-ai-secondary animate-pulse" /> Pro Features Upgrade
                  </h4>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed mt-2 relative z-10">
                    Unlock Figma export, unlimited AI generations, standard components library, and priority support.
                  </p>
                  <button className="w-full py-2.5 bg-white text-[#081120] text-xs font-extrabold rounded-xl shadow-lg hover:bg-white/95 transition-all relative z-10 hover:-translate-y-0.5">
                    Upgrade to Pro Plan
                  </button>
                </div>

                <div className="flex flex-col pt-4 border-t border-white/[0.06] text-xs text-white/30">
                  <p>© 2026 InstantSite AI</p>
                  <div className="flex items-center gap-3 mt-2">
                    <a href="/docs" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Documentation</a>
                    <a href="/twitter" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Twitter</a>
                    <a href="/support" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </aside>
          )}

        </main>
      </div>

    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative focus:outline-none ${active ? 'bg-white/[0.06] text-white border border-white/[0.1] shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
      title={label}
    >
      <div className={`${active ? 'scale-110 text-ai-secondary transition-transform' : 'group-hover:scale-110 transition-transform'} shrink-0`}>{icon}</div>
      <span className={`ml-3 text-sm font-semibold tracking-wide hidden lg:block truncate ${active ? 'text-white' : ''}`}>{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-ai-primary to-ai-secondary rounded-r-full shadow-[0_0_10px_rgba(0,194,255,0.4)]"></div>
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
          ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.1]' 
          : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'
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
        active ? 'bg-ai-primary/20 text-[#00C2FF] border border-[#00C2FF]/30' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

// ==========================================
// LANDING & AUTH VIEWS FOR SAAS PLATFORM
// ==========================================

interface LandingPageProps {
  onStart: () => void;
  onStartWorkspace: () => void;
  onLogin: () => void;
  onAbout: () => void;
  onGoHome: () => void;
  activeView: 'home' | 'about';
}

function LandingPage({ onStart, onStartWorkspace, onLogin, onAbout, onGoHome, activeView }: LandingPageProps) {
  const [emailSub, setEmailSub] = useState("");
  const [isSubbed, setIsSubbed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'products' | 'resources' | null>(null);

  // Interactive Mockup States
  const [mockLayout, setMockLayout] = useState<'saas' | 'portfolio' | 'store'>('saas');
  const [mockTheme, setMockTheme] = useState<'dark' | 'light'>('dark');
  const [mockColor, setMockColor] = useState<'indigo' | 'emerald' | 'rose'>('indigo');
  
  const [previewLayout, setPreviewLayout] = useState<'saas' | 'portfolio' | 'store'>('saas');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewColor, setPreviewColor] = useState<'indigo' | 'emerald' | 'rose'>('indigo');
  
  const [mockCompiling, setMockCompiling] = useState(false);
  const [mockCompileStep, setMockCompileStep] = useState(1);

  const triggerCompile = (
    newLayout: 'saas' | 'portfolio' | 'store',
    newTheme: 'dark' | 'light',
    newColor: 'indigo' | 'emerald' | 'rose'
  ) => {
    setMockLayout(newLayout);
    setMockTheme(newTheme);
    setMockColor(newColor);
    setMockCompiling(true);
    setMockCompileStep(1);

    // Simulate multi-stage compilation
    setTimeout(() => {
      setMockCompileStep(2);
      setTimeout(() => {
        setMockCompileStep(3);
        setTimeout(() => {
          setPreviewLayout(newLayout);
          setPreviewTheme(newTheme);
          setPreviewColor(newColor);
          setMockCompiling(false);
        }, 200);
      }, 250);
    }, 250);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub.trim()) return;
    setIsSubbed(true);
    setTimeout(() => {
      setEmailSub("");
    }, 2000);
  };

  // Color Mapping
  const colorMap = {
    indigo: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-600',
      bgHover: 'hover:bg-indigo-700',
      border: 'border-indigo-500/20',
      borderActive: 'border-indigo-500/40',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'shadow-indigo-500/25',
      accentGlow: 'bg-indigo-500/20',
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-600',
      bgHover: 'hover:bg-emerald-700',
      border: 'border-emerald-500/20',
      borderActive: 'border-emerald-500/40',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/25',
      accentGlow: 'bg-emerald-500/20',
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-600',
      bgHover: 'hover:bg-rose-700',
      border: 'border-rose-500/20',
      borderActive: 'border-rose-500/40',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'shadow-rose-500/25',
      accentGlow: 'bg-rose-500/20',
    },
  };

  const activeColor = colorMap[previewColor];

  return (
    <div className="min-h-screen bg-[#081120] text-[#E2E8F0] font-sans relative overflow-x-hidden selection:bg-[#00C2FF]/30">
      {/* Background noise and mesh (matching NexDial style) */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none z-0" />
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      <ParticleField />

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#081120]/45 backdrop-blur-md border-b border-white/[0.05] z-50 transition-all select-none">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { if (activeView === 'about') { onGoHome(); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
            <div className="w-9 h-9 rounded-xl bg-[#090D1A] border border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#0057D9] via-[#00C2FF] to-[#00E5A0] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative z-10 w-5 h-5 flex items-center justify-center">
                <LogoIcon className="w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm tracking-tight text-white leading-none uppercase">
                Instant<span className="bg-gradient-to-r from-[#00C2FF] to-[#00E5A0] bg-clip-text text-transparent">Site</span>
              </span>
              <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                AI Engine <span className="w-1 h-1 rounded-full bg-[#00E5A0] animate-pulse"></span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 h-full">
            {/* Products (Mega Menu Trigger) */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('products')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none bg-transparent border-none">
                <span>Products</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-90 text-[#00C2FF]' : 'rotate-0'}`} />
              </button>
              
              {/* Mega Menu Dropdown */}
              {activeMenu === 'products' && (
                <div className="absolute top-[65px] left-1/2 -translate-x-1/2 w-[580px] bg-[#0E1629]/95 backdrop-blur-2xl border border-white/[0.08] p-6 rounded-3xl shadow-2xl animate-scale-in z-50 grid grid-cols-3 gap-6">
                  {/* Left columns (links) */}
                  <div className="col-span-2 grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">Core Engine</span>
                      <a 
                        href="/demo" 
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveMenu(null); 
                          if (activeView === 'about') { 
                            onGoHome(); 
                            setTimeout(() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                          } else {
                            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }} 
                        className="flex items-start gap-2.5 group/item hover:bg-white/[0.02] p-2 rounded-xl transition-all border border-transparent hover:border-white/[0.04]"
                      >
                        <Zap className="w-4 h-4 text-[#00C2FF] mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-white block group-hover/item:text-[#00C2FF] transition-colors">JIT Compiler</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">Real-time style compiling.</span>
                        </div>
                      </a>
                      <a 
                        href="/features" 
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveMenu(null); 
                          if (activeView === 'about') { 
                            onGoHome(); 
                            setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                          } else {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }} 
                        className="flex items-start gap-2.5 group/item hover:bg-white/[0.02] p-2 rounded-xl transition-all border border-transparent hover:border-white/[0.04]">
                        <Code2 className="w-4 h-4 text-[#00E5A0] mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-white block group-hover/item:text-[#00E5A0] transition-colors">Monaco Editor</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">Adjust raw code dynamically.</span>
                        </div>
                      </a>
                    </div>
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">Pipelines</span>
                      <a 
                        href="/features" 
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveMenu(null); 
                          if (activeView === 'about') { 
                            onGoHome(); 
                            setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                          } else {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }} 
                        className="flex items-start gap-2.5 group/item hover:bg-white/[0.02] p-2 rounded-xl transition-all border border-transparent hover:border-white/[0.04]">
                        <Globe className="w-4 h-4 text-rose-400 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-white block group-hover/item:text-rose-400 transition-colors">Webhook Sync</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">Instant online deployments.</span>
                        </div>
                      </a>
                      <a 
                        href="/features" 
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveMenu(null); 
                          if (activeView === 'about') { 
                            onGoHome(); 
                            setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                          } else {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }} 
                        className="flex items-start gap-2.5 group/item hover:bg-white/[0.02] p-2 rounded-xl transition-all border border-transparent hover:border-white/[0.04]">
                        <Sparkles className="w-4 h-4 text-[#00C2FF] mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-white block group-hover/item:text-[#00C2FF] transition-colors">AI Suggestions</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">Intelligent design parameters.</span>
                        </div>
                      </a>
                    </div>
                  </div>
                  {/* Right column (highlight card) */}
                  <div className="bg-gradient-to-b from-[#0057D9]/10 to-[#00C2FF]/5 border border-[#00C2FF]/10 p-4 rounded-2xl flex flex-col justify-between text-left">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
                        <span className="text-[9px] font-bold text-[#00E5A0] uppercase tracking-wider">New Release</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-white">Interactive Sandbox</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">Watch JIT wireframe compilation live with editable DOM components.</p>
                    </div>
                    <button onClick={onStartWorkspace} className="w-full mt-3 py-2 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] text-white font-extrabold text-[9px] uppercase rounded-xl shadow-md hover:from-[#0066FF] hover:to-[#00D2FF] transition-all cursor-pointer">
                      Launch Sandbox
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resources (Dropdown Trigger) */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('resources')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none bg-transparent border-none">
                <span>Resources</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'resources' ? 'rotate-90 text-[#00C2FF]' : 'rotate-0'}`} />
              </button>
              
              {/* Dropdown Menu */}
              {activeMenu === 'resources' && (
                <div className="absolute top-[65px] left-1/2 -translate-x-1/2 w-48 bg-[#0E1629]/95 backdrop-blur-2xl border border-white/[0.08] p-3 rounded-2xl shadow-2xl animate-scale-in z-50 flex flex-col gap-1 text-left">
                  <a 
                    href="/demo" 
                    onClick={(e) => { 
                      e.preventDefault();
                      setActiveMenu(null); 
                      if (activeView === 'about') { 
                        onGoHome(); 
                        setTimeout(() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                      } else {
                        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }} 
                    className="py-2 px-3 hover:bg-white/[0.03] rounded-xl text-xs text-white/70 hover:text-white transition-colors font-medium"
                  >
                    Layout Templates
                  </a>
                  <a 
                    href="/features" 
                    onClick={(e) => { 
                      e.preventDefault();
                      setActiveMenu(null); 
                      if (activeView === 'about') { 
                        onGoHome(); 
                        setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                      } else {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }} 
                    className="py-2 px-3 hover:bg-white/[0.03] rounded-xl text-xs text-white/70 hover:text-white transition-colors font-medium"
                  >
                    Platform Docs
                  </a>
                  <a 
                    href="/pricing" 
                    onClick={(e) => { 
                      e.preventDefault();
                      setActiveMenu(null); 
                      if (activeView === 'about') { 
                        onGoHome(); 
                        setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                      } else {
                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }} 
                    className="py-2 px-3 hover:bg-white/[0.03] rounded-xl text-xs text-white/70 hover:text-white transition-colors font-medium"
                  >
                    Pricing Plans
                  </a>
                </div>
              )}
            </div>

            <a 
              href="/pricing" 
              onClick={(e) => { 
                e.preventDefault();
                if (activeView === 'about') { 
                  onGoHome(); 
                  setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 150); 
                } else {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <button onClick={onAbout} className="text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none focus:outline-none">About Creator</button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={onLogin} id="nav-btn-signin" className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors focus:outline-none cursor-pointer">Sign In</button>
            <button onClick={onStart} id="nav-btn-signup" className="px-5 py-2.5 btn-primary text-xs font-bold rounded-xl shadow-lg shadow-[#0057D9]/20 flex items-center gap-1.5">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 relative z-10">
        {activeView === 'home' && (
          <>
            <section className="max-w-7xl mx-auto px-6 text-center space-y-8 pt-10 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#00C2FF] text-xs font-bold uppercase tracking-widest animate-scale-in shadow-[0_0_20px_rgba(0,194,255,0.15)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Platform Core v2.5 Live
          </div>
          <h1 className="text-5xl md:text-7xl leading-tight font-extrabold tracking-tight pb-2 max-w-4xl mx-auto">
            <span className="gradient-text-hero">Describe your website. We'll generate it instantly.</span>
          </h1>
          <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            The next-generation AI compiler for developers. Turn prompts into clean Tailwind HTML documents with dynamic layouts, live edit controls, and instant code exports.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={onStart} className="px-8 py-4 btn-primary text-sm font-extrabold rounded-2xl shadow-xl shadow-[#0057D9]/30 flex items-center gap-2">
              Start Generating Free <ArrowRight size={18} />
            </button>
            <button onClick={onStartWorkspace} className="px-8 py-4 btn-secondary text-sm font-semibold rounded-2xl border border-white/10 hover:border-[#00C2FF]/30 transition-all flex items-center gap-2">
              Launch Sandbox Workspace
            </button>
          </div>

          {/* Hero mockup window */}
          <div className="w-full max-w-5xl mx-auto pt-16 animate-fade-in">
            <div className="glass-card bg-[#0F172A]/30 border border-white/[0.08] p-2 rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-[#00C2FF] to-[#00E5A0] opacity-50"></div>
              <div className="bg-[#050B14] rounded-[2rem] overflow-hidden border border-white/[0.04] flex flex-col lg:flex-row min-h-[500px] lg:h-[500px]">
                {/* Simulated Customizer Sidebar */}
                <div className="w-full lg:w-60 bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-4 flex flex-col justify-between shrink-0">
                  <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00C2FF] flex items-center gap-1.5">
                        <Wand2 size={12} className="animate-pulse" /> AI JIT Sandbox
                      </span>
                      <span className="text-[8px] bg-[#00E5A0]/10 text-[#00E5A0] font-extrabold uppercase px-1.5 py-0.5 rounded border border-[#00E5A0]/20">
                        Ready
                      </span>
                    </div>
                    
                    {/* Layout Section */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">1. Template Blueprint</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'saas', label: 'SaaS', icon: <Layout size={10} /> },
                          { id: 'portfolio', label: 'Dev', icon: <User size={10} /> },
                          { id: 'store', label: 'Store', icon: <Layers size={10} /> }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => triggerCompile(opt.id as any, mockTheme, mockColor)}
                            className={`px-1.5 py-2 rounded-lg text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer focus:outline-none border ${
                              mockLayout === opt.id
                                ? 'bg-[#0057D9]/15 text-white border-[#00C2FF]/30 shadow-inner'
                                : 'bg-white/[0.02] text-white/40 border-white/[0.04] hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme Section */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">2. Theme Style</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'dark', label: 'Dark Mode', icon: <Moon size={10} /> },
                          { id: 'light', label: 'Light Mode', icon: <Sun size={10} /> }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => triggerCompile(mockLayout, opt.id as any, mockColor)}
                            className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none border ${
                              mockTheme === opt.id
                                ? 'bg-[#00C2FF]/15 text-white border-[#00C2FF]/30 shadow-inner'
                                : 'bg-white/[0.02] text-white/40 border-white/[0.04] hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Section */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">3. Accent Highlight</label>
                      <div className="flex items-center gap-3 p-2 bg-white/[0.01] border border-white/[0.04] rounded-xl justify-around">
                        {[
                          { id: 'indigo', colorClass: 'bg-indigo-500 shadow-indigo-500/30' },
                          { id: 'emerald', colorClass: 'bg-emerald-500 shadow-emerald-500/30' },
                          { id: 'rose', colorClass: 'bg-rose-500 shadow-rose-500/30' }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => triggerCompile(mockLayout, mockTheme, opt.id as any)}
                            className={`w-6 h-6 rounded-full ${opt.colorClass} border transition-all cursor-pointer relative ${
                              mockColor === opt.id ? 'border-white scale-110 ring-2 ring-white/10' : 'border-transparent hover:scale-105'
                            }`}
                          >
                            {mockColor === opt.id && (
                              <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic JIT Prompt Box */}
                  <div className="mt-4 lg:mt-0 p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">Dynamic prompt log</span>
                    </div>
                    <p className="text-[9px] font-mono text-white/60 leading-normal select-none break-words">
                      "Generate a <span className="text-[#00C2FF] font-bold">{mockLayout}</span> app in <span className="text-[#00E5A0] font-bold">{mockTheme}</span> theme with <span className="text-rose-400 font-bold">{mockColor}</span> highlights."
                    </p>
                    <button 
                      onClick={() => triggerCompile(mockLayout, mockTheme, mockColor)}
                      className="w-full mt-1.5 py-2 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] text-white text-[9px] font-extrabold uppercase rounded-lg shadow-md hover:from-[#0066FF] hover:to-[#00D2FF] transition-all cursor-pointer focus:outline-none"
                    >
                      Recompile JIT Code
                    </button>
                  </div>
                </div>

                {/* Simulated Main Preview Canvas */}
                <div className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
                  
                  {/* Mock browser header */}
                  <div className="h-10 border-b border-white/[0.06] flex items-center px-4 justify-between bg-black/40 shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500/70 border border-red-500/20"></span>
                      <span className="w-2 h-2 rounded-full bg-yellow-500/70 border border-yellow-500/20"></span>
                      <span className="w-2 h-2 rounded-full bg-green-500/70 border border-green-500/20"></span>
                    </div>
                    
                    <div className="flex items-center bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-md text-[10px] text-white/50 w-64 justify-center font-mono gap-1.5 truncate">
                      <Globe size={8} className="text-[#00E5A0] animate-pulse" />
                      <span>localhost:3000/preview-{previewLayout}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono uppercase bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-md">
                      <span className="w-1 h-1 rounded-full bg-[#00C2FF] animate-ping"></span>
                      <span>v2.5</span>
                    </div>
                  </div>

                  {/* Preview body container */}
                  <div className={`flex-1 overflow-y-auto no-scrollbar p-6 transition-all duration-300 ${
                    previewTheme === 'dark' ? 'bg-[#0B0F19] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#0F172A]'
                  } relative z-10`}>
                    
                    {/* Dynamic Layout components */}
                    {previewLayout === 'saas' && (
                      <div className="space-y-6 text-left animate-fade-in">
                        {/* Navigation */}
                        <div className={`flex items-center justify-between pb-3 border-b ${
                          previewTheme === 'dark' ? 'border-white/[0.05]' : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={12} className={activeColor.text} />
                            <span className="font-extrabold text-[11px] tracking-tight">OmniFlow <span className={activeColor.text}>AI</span></span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] font-bold">
                            <span className={previewTheme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Product</span>
                            <span className={previewTheme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Features</span>
                            <button className={`px-2 py-1 text-[8px] font-bold rounded-lg text-white ${activeColor.bg} ${activeColor.bgHover}`}>Try Free</button>
                          </div>
                        </div>
                        
                        {/* SaaS Hero */}
                        <div className="space-y-2 mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${activeColor.badge}`}>
                            Platform Launch
                          </span>
                          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
                            Automate your project build log pipelines.
                          </h2>
                          <p className={`text-[10px] leading-relaxed max-w-md ${
                            previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Deploy high-fidelity reactive web modules with zero configurations. Experience compiled code generation workflows instantly.
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button className={`px-4 py-2 text-[10px] font-extrabold uppercase rounded-lg text-white shadow-md ${activeColor.bg} ${activeColor.bgHover} ${activeColor.glow} transition-all`}>
                              Start Building
                            </button>
                            <button className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                              previewTheme === 'dark' ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}>
                              Watch Blueprint
                            </button>
                          </div>
                        </div>
                        
                        {/* SaaS Cards */}
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className={`p-3 rounded-xl border ${
                            previewTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Zap size={11} className={activeColor.text} />
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${previewTheme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Compile Time</span>
                            </div>
                            <p className="text-lg font-black tracking-tight leading-none font-mono">120ms</p>
                            <div className="w-full bg-white/10 rounded-full h-1 mt-2.5 overflow-hidden">
                              <div className={`h-full rounded-full ${activeColor.bg}`} style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          
                          <div className={`p-3 rounded-xl border ${
                            previewTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Server size={11} className={activeColor.text} />
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${previewTheme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Deploy nodes</span>
                            </div>
                            <p className="text-lg font-black tracking-tight leading-none font-mono">Active (12)</p>
                            <div className="flex items-center gap-1 mt-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
                              <span className={`text-[8px] font-bold uppercase ${previewTheme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>Uptime: 99.98%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewLayout === 'portfolio' && (
                      <div className="space-y-5 text-left animate-fade-in">
                        {/* Navigation */}
                        <div className={`flex items-center justify-between pb-3 border-b ${
                          previewTheme === 'dark' ? 'border-white/[0.05]' : 'border-slate-200'
                        }`}>
                          <span className="font-extrabold text-[11px] tracking-tight">Alex Rivers • <span className={activeColor.text}>Dev</span></span>
                          <div className="flex items-center gap-3 text-[9px] font-bold">
                            <span className={previewTheme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Work</span>
                            <span className={previewTheme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Stack</span>
                            <span className={`font-semibold cursor-pointer underline decoration-2 ${activeColor.text}`}>Contact</span>
                          </div>
                        </div>

                        {/* Profile Card */}
                        <div className="flex items-center gap-4 mt-1">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            previewTheme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white shadow-xs'
                          } relative overflow-hidden group`}>
                            <div className={`absolute inset-0.5 rounded-full blur-md opacity-40 ${activeColor.accentGlow}`}></div>
                            <User size={18} className={activeColor.text} />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-base font-black tracking-tight leading-tight">Alex Rivers</h3>
                            <p className={`text-[9px] font-semibold uppercase tracking-wider ${activeColor.text}`}>Senior Frontend Architect</p>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                          <h2 className="text-lg font-black tracking-tight leading-snug">
                            Crafting compiler-level web platforms.
                          </h2>
                          <p className={`text-[10px] leading-relaxed ${
                            previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Building reactive interfaces utilizing custom AST generators, modular styling systems, and database telemetry models.
                          </p>
                        </div>

                        {/* Portfolio items */}
                        <div className="space-y-2 pt-1">
                          <label className={`text-[8px] font-bold uppercase tracking-wider block ${previewTheme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>Featured Projects</label>
                          
                          <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            previewTheme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60' : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                          } transition-all cursor-pointer`}>
                            <div className="flex items-center gap-2">
                              <span className={activeColor.text}>⚡</span>
                              <span className="text-[10px] font-bold">NexDial CRM Dashboard</span>
                            </div>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${activeColor.badge}`}>Live</span>
                          </div>

                          <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            previewTheme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60' : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                          } transition-all cursor-pointer`}>
                            <div className="flex items-center gap-2">
                              <span className={activeColor.text}>✨</span>
                              <span className="text-[10px] font-bold">InstantSite JIT Platform</span>
                            </div>
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">Core</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewLayout === 'store' && (
                      <div className="space-y-4 text-left animate-fade-in">
                        {/* Navigation */}
                        <div className={`flex items-center justify-between pb-3 border-b ${
                          previewTheme === 'dark' ? 'border-white/[0.05]' : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${activeColor.bg}`}></span>
                            <span className="font-extrabold text-[11px] tracking-tight">KBD Labs</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-bold">
                            <span className={previewTheme === 'dark' ? 'text-white/60' : 'text-slate-500'}>Catalog</span>
                            <span className={`px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase ${previewTheme === 'light' ? 'border-slate-200 text-slate-800' : ''}`}>Cart (2)</span>
                          </div>
                        </div>

                        {/* Store Hero */}
                        <div className="space-y-1">
                          <h2 className="text-xl font-black tracking-tight leading-tight">
                            Anodized Aluminum Shells.
                          </h2>
                          <p className={`text-[9px] leading-relaxed ${
                            previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Lubricated switches, heavy acoustic dampening, and CNC machined keyboard enclosures.
                          </p>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {/* Product Card 1 */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                            previewTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                          }`}>
                            <div className={`w-full h-14 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden ${
                              previewTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
                            }`}>
                              <div className={`absolute inset-0 bg-gradient-to-tr opacity-10 ${activeColor.accentGlow}`}></div>
                              <span className={`text-[16px] ${activeColor.text}`}>⌨️</span>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold truncate">Vortex 75 Shell</h4>
                              <p className={`text-[9px] font-bold mt-0.5 ${activeColor.text}`}>$129.00</p>
                            </div>
                            <button className={`w-full mt-2 py-1 text-[8px] font-extrabold uppercase rounded text-white ${activeColor.bg} ${activeColor.bgHover} transition-all`}>
                              Add to Cart
                            </button>
                          </div>

                          {/* Product Card 2 */}
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                            previewTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                          }`}>
                            <div className={`w-full h-14 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden ${
                              previewTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
                            }`}>
                              <div className={`absolute inset-0 bg-gradient-to-tr opacity-10 ${activeColor.accentGlow}`}></div>
                              <span className={`text-[16px] ${activeColor.text}`}>🔌</span>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold truncate">Linear Switches</h4>
                              <p className={`text-[9px] font-bold mt-0.5 ${activeColor.text}`}>$35.00</p>
                            </div>
                            <button className={`w-full mt-2 py-1 text-[8px] font-extrabold uppercase rounded text-white ${activeColor.bg} ${activeColor.bgHover} transition-all`}>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* JIT Compilation Loader overlay */}
                  {mockCompiling && (
                    <div className="absolute inset-0 bg-[#050B14]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 select-none animate-fade-in">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <Loader2 className={`w-8 h-8 animate-spin ${
                          mockColor === 'indigo' ? 'text-indigo-400' : mockColor === 'emerald' ? 'text-emerald-400' : 'text-rose-400'
                        }`} />
                        <Sparkles className="w-3.5 h-3.5 text-white absolute" />
                      </div>
                      
                      <div className="space-y-1.5 text-center px-4 max-w-xs">
                        <p className="text-[10px] font-mono font-bold text-white tracking-wide">
                          {mockCompileStep === 1 && "[COMPILER] AST Blueprint Analysis..."}
                          {mockCompileStep === 2 && "[JIT] Injecting CSS variables..."}
                          {mockCompileStep === 3 && "[RENDERER] Repainting DOM tree..."}
                        </p>
                        <div className="w-32 bg-white/10 rounded-full h-1 mx-auto overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${
                            mockColor === 'indigo' ? 'bg-indigo-500' : mockColor === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} style={{ width: `${mockCompileStep * 33.3}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-24 border-t border-white/[0.06] bg-black/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight"><span className="gradient-text-hero">Interactive AI Sandbox Simulator</span></h2>
              <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed">Select a template prompt below to watch the JIT style compilation and wireframe builder in action.</p>
            </div>
            <LandingDemo />
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight"><span className="gradient-text-hero">Engineered for Fast Iteration</span></h2>
              <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed">Every feature is optimized for clean production-ready code delivery and visual precision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden group hover:border-[#0057D9]/40 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full"></div>
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4"><Zap className="w-5 h-5 text-indigo-400" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">JIT Tailwind Compiler</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">Generates optimized Tailwind CSS styles instantly. No unused style packages or bloated imports.</p>
                </div>
                <div className="mt-4 p-2.5 bg-[#050B14] border border-white/[0.05] rounded-xl font-mono text-[9px] text-white/50 text-left">
                  <div className="flex justify-between">
                    <span>compile_rate:</span>
                    <span className="text-[#00C2FF]">1.8ms</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span>ast_nodes:</span>
                    <span className="text-[#00E5A0]">optimized</span>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden group hover:border-[#00C2FF]/40 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C2FF]/5 rounded-bl-full"></div>
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4"><Code2 className="w-5 h-5 text-cyan-400" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">Monaco Code Editor</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">Direct code adjustments using the industry-standard IDE text editor. Raw HTML, CSS, and JS access.</p>
                </div>
                <div className="mt-4 p-2.5 bg-[#050B14] border border-white/[0.05] rounded-xl font-mono text-[9px] text-white/50 text-left">
                  <div className="flex justify-between">
                    <span>editor_core:</span>
                    <span className="text-[#00C2FF]">vs-dark</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span>language:</span>
                    <span className="text-amber-400">html/css/js</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden group hover:border-[#00E5A0]/40 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E5A0]/5 rounded-bl-full"></div>
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"><Globe className="w-5 h-5 text-emerald-400" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">Instant Webhook Deploys</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">Integrates with deployment hooks. Share and run your website immediately on live domains.</p>
                </div>
                <div className="mt-4 p-2.5 bg-[#050B14] border border-white/[0.05] rounded-xl font-mono text-[9px] text-white/50 text-left">
                  <div className="flex justify-between">
                    <span>deploy_status:</span>
                    <span className="text-[#00E5A0]">online</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span>live_ssl:</span>
                    <span className="text-emerald-400">enabled</span>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="glass-card bg-white/[0.01] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden group hover:border-pink-500/40 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-bl-full"></div>
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4"><Wand2 className="w-5 h-5 text-pink-400" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">Interactive Page Editor</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">Click any component inside the preview window to edit content, change colors, adjust padding, and delete nodes.</p>
                </div>
                <div className="mt-4 p-2.5 bg-[#050B14] border border-white/[0.05] rounded-xl font-mono text-[9px] text-white/50 text-left">
                  <div className="flex justify-between">
                    <span>inspector:</span>
                    <span className="text-pink-400">active</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span>node_edit:</span>
                    <span className="text-[#00C2FF]">live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 border-t border-white/[0.06] bg-black/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight"><span className="gradient-text-hero">Simple, Transparent Pricing</span></h2>
              <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed">Choose the tier that suits your workflow. Pay-as-you-grow AI resource limits.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="glass-card pricing-card-glow-indigo bg-white/[0.01] border border-white/[0.08] p-8 flex flex-col justify-between h-[470px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#0057D9]/20 text-[#00C2FF] text-[8px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider border-l border-b border-white/[0.08]">Free Tier</div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Sandbox Playground
                  </span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>$0</span>
                    <span className="text-xs text-white/50">/forever</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-3">Test out layouts and basic style generation workflows.</p>
                  
                  <ul className="space-y-3 mt-8 text-xs text-white/70 text-left">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400 shrink-0" /> 3 AI Site compiles per day</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400 shrink-0" /> Basic style selections</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400 shrink-0" /> Local HTML code download</li>
                  </ul>
                </div>
                <button onClick={onStart} className="w-full py-3.5 btn-secondary border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs font-bold transition-all mt-8 cursor-pointer focus:outline-none">Sign Up Free</button>
              </div>

              {/* Developer Pro Plan */}
              <div className="glass-card pricing-card-glow-emerald bg-[#0057D9]/5 border border-indigo-500/30 p-8 flex flex-col justify-between h-[500px] -translate-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 bg-[#00E5A0] text-[#081120] text-[8px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">Most Popular</div>
                <div>
                  <span className="text-[10px] font-bold text-[#00E5A0] uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span> Pro Builder
                  </span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>$15</span>
                    <span className="text-xs text-white/50">/month</span>
                  </div>
                  <p className="text-xs text-white/70 mt-3">Unlock full editing workspaces, code editors, and unlimited generation.</p>
                  
                  <ul className="space-y-3 mt-8 text-xs text-white/90 text-left">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00E5A0] shrink-0" /> Unlimited AI site generations</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00E5A0] shrink-0" /> Complete Monaco Editor workspace</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00E5A0] shrink-0" /> Interactive visual inspector editor</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00E5A0] shrink-0" /> Standard webhooks & ZIP downloads</li>
                  </ul>
                </div>
                <button onClick={onStart} className="w-full py-3.5 btn-primary rounded-xl text-xs font-bold shadow-lg shadow-[#0057D9]/30 transition-all mt-8 cursor-pointer focus:outline-none">Subscribe to Pro</button>
              </div>

              {/* Enterprise Plan */}
              <div className="glass-card pricing-card-glow-rose bg-white/[0.01] border border-white/[0.08] p-8 flex flex-col justify-between h-[470px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#EF4444]/10 text-rose-400 text-[8px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider border-l border-b border-white/[0.08]">Corporate</div>
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Dedicated Power
                  </span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>$49</span>
                    <span className="text-xs text-white/50">/month</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-3">Large-scale agencies requiring API parameters and white labeling.</p>
                  
                  <ul className="space-y-3 mt-8 text-xs text-white/70 text-left">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400 shrink-0" /> Gemini-Pro LLM configuration</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400 shrink-0" /> White-label domains & export templates</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400 shrink-0" /> Priority API endpoints access</li>
                  </ul>
                </div>
                <button onClick={onStart} className="w-full py-3.5 btn-secondary border border-white/10 hover:border-rose-500/30 rounded-xl text-xs font-bold transition-all mt-8 cursor-pointer focus:outline-none">Get Enterprise</button>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
        {activeView === 'about' && (
          /* About Creator Content */
          <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-stretch py-4 px-6 mb-16 animate-fade-in">
            {/* Creator Info / Image Card */}
            <div className="w-full lg:w-96 flex flex-col justify-between">
              <div className="glass-card bg-[#0F172A]/40 backdrop-blur-3xl border border-white/[0.08] p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-6 group hover:border-[#00C2FF]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00C2FF]/10 to-transparent rounded-bl-full opacity-50"></div>
                
                {/* Double Border Premium Image Wrapper */}
                <div className="relative w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-[#0057D9] via-[#00C2FF] to-[#00E5A0] shadow-xl group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-tr from-[#0057D9] to-[#00C2FF] opacity-40 animate-pulse"></div>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#081120] relative border border-white/10">
                    <img 
                      src="/author.png" 
                      alt="Datta Sable" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const div = document.createElement('div');
                          div.className = "w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0057D9] to-[#00C2FF] text-white text-4xl font-black";
                          div.innerText = "DS";
                          parent.appendChild(div);
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-3 py-1 rounded-full uppercase tracking-wider">Featured Creator</span>
                  <h2 className="text-2xl font-black text-white mt-3 tracking-tight">Datta Sable</h2>
                  <p className="text-xs text-[#00E5A0] font-extrabold uppercase tracking-widest mt-1">Full Stack Creator & Architect</p>
                </div>

                <p className="text-xs text-white/50 leading-relaxed max-w-xs">
                  Designing digital architectures, deep neural compilers, and next-generation interactive AI user experiences.
                </p>

                <div className="w-full border-t border-white/[0.06] pt-5 flex items-center justify-around">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/60 hover:text-white transition-all cursor-pointer" title="GitHub"><Github size={16} /></a>
                  <a href="https://dattasable.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/60 hover:text-[#00E5A0] transition-all cursor-pointer font-bold text-xs" title="Website">↗</a>
                  <a href="mailto:contact@dattasable.com" className="p-2.5 bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/60 hover:text-rose-400 transition-all cursor-pointer" title="Email"><Mail size={16} /></a>
                </div>
              </div>
            </div>

            {/* Vision & Details Card */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="glass-card bg-[#0F172A]/40 backdrop-blur-3xl border border-white/[0.08] p-6 lg:p-8 rounded-[2rem] shadow-2xl space-y-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Our Mission</span>
                    <h3 className="text-3xl font-extrabold tracking-tight"><span className="gradient-text-hero">Empowering Anyone to Build the Web.</span></h3>
                  </div>

                  <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                    <p>
                      InstantSite AI started with a simple belief: <strong>websites should be compiled at the speed of thought.</strong> Traditional development loops, syntax learning, and environment configurations create barriers for creative minds.
                    </p>
                    <p>
                      By leveraging state-of-the-art Generative Models combined with a Just-In-Time (JIT) layout compiler, we translate plain text instructions into standards-compliant HTML, Tailwind CSS, and custom JavaScript animations instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#00E5A0] uppercase tracking-wider block">Visual Precision</span>
                      <p className="text-xs text-white/50 leading-relaxed">Real-time compilation that mirrors custom presets, modern fonts, and accent options instantly.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider block">Developer Friendly</span>
                      <p className="text-xs text-white/50 leading-relaxed">Access clean, fully editable outputs immediately via Monaco Editor and direct Git imports.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Portfolio and Projects</span>
                    <span className="text-xs font-semibold text-white/70">Explore all creations</span>
                  </div>
                  <a 
                    href="https://dattasable.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-6 py-3 bg-gradient-to-r from-[#0057D9] via-[#00C2FF] to-[#00E5A0] text-white font-extrabold text-xs uppercase rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer text-center focus:outline-none"
                  >
                    Visit dattasable.com ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <footer className="relative border-t border-white/[0.06] pt-16 pb-8 bg-slate-950/60 backdrop-blur-2xl overflow-hidden">
          {/* Subtle top glowing line overlay */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00C2FF]/30 to-transparent"></div>
          {/* Centered glowing ambient light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-[#0057D9]/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-left relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-[#090D1A] border border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#0057D9] via-[#00C2FF] to-[#00E5A0] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative z-10 w-5 h-5 flex items-center justify-center">
                      <LogoIcon className="w-full h-full" />
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-sm tracking-tight text-white leading-none uppercase">
                      Instant<span className="bg-gradient-to-r from-[#00C2FF] to-[#00E5A0] bg-clip-text text-transparent">Site</span>
                    </span>
                    <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      AI Engine <span className="w-1 h-1 rounded-full bg-[#00E5A0] animate-pulse"></span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">Award-winning instant code compiler translating text directives into responsive site interfaces.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Product</h4>
                <ul className="space-y-2 text-xs text-white/50">
                  <li>
                    <a 
                      href="/features" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (activeView === 'about') {
                          onGoHome();
                          setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150);
                        } else {
                          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }} 
                      className="hover:text-white transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/demo" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (activeView === 'about') {
                          onGoHome();
                          setTimeout(() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }), 150);
                        } else {
                          document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }} 
                      className="hover:text-white transition-colors"
                    >
                      Interactive Demo
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/pricing" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (activeView === 'about') {
                          onGoHome();
                          setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 150);
                        } else {
                          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }} 
                      className="hover:text-white transition-colors"
                    >
                      Pricing Options
                    </a>
                  </li>
                  <li><button onClick={onAbout} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left w-full text-xs text-white/50 p-0 font-medium focus:outline-none">About Creator</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Developer Tools</h4>
                <ul className="space-y-2 text-xs text-white/50">
                  <li><a href="/docs" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">API Docs</a></li>
                  <li><a href="/tailwind" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Tailwind Integration</a></li>
                  <li><a href="/github" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">GitHub Repository</a></li>
                </ul>
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2">Join the Newsletter</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">Get JIT compiler updates, premium layouts, and developer tips weekly.</p>
                
                {isSubbed ? (
                  <div className="p-4 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/20 flex flex-col gap-1.5 animate-scale-in">
                    <span className="text-xs font-bold text-[#00E5A0]">✨ Welcome to the newsletter!</span>
                    <span className="text-[10px] text-white/50">You have successfully subscribed to early-access updates.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="relative group w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
                    <div className="relative flex bg-white/[0.02] border border-white/[0.08] hover:border-white/15 focus-within:border-[#00C2FF]/30 rounded-xl overflow-hidden p-1 transition-all duration-300">
                      <input 
                        type="email" 
                        required
                        placeholder="Enter your email" 
                        value={emailSub}
                        onChange={(e) => setEmailSub(e.target.value)}
                        className="bg-transparent border-none text-white outline-none w-full px-3 text-xs placeholder:text-white/20 focus:ring-0 focus:outline-none" 
                      />
                      <button 
                        type="submit" 
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] text-white font-bold text-[9px] uppercase rounded-lg shadow-md hover:from-[#0066FF] hover:to-[#00D2FF] transition-all cursor-pointer shrink-0 focus:outline-none"
                      >
                        Subscribe
                      </button>
                    </div>
                  </form>
                )}
                <span className="text-[9px] text-white/30">Zero spam. Unsubscribe at any time.</span>
              </div>
            </div>

            {/* Horizontal Premium Creator Card */}
            <div className="mt-8 mb-12 glass-card bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:border-[#00C2FF]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00C2FF]/10 to-transparent rounded-bl-full opacity-50"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0057D9] via-[#00C2FF] to-[#00E5A0] flex items-center justify-center shadow-lg text-white font-black text-sm shrink-0 border border-white/15">
                    DS
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Featured Creator</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse"></span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white mt-1 group-hover:text-[#00C2FF] transition-colors">Datta Sable</h4>
                    <p className="text-xs text-white/50 mt-1 max-w-xl leading-relaxed">Designing digital products, SaaS architectures, and interactive AI user interfaces.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto shrink-0 md:border-l md:border-white/[0.06] md:pl-6">
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Portfolio Site</span>
                    <span className="text-xs font-semibold text-white/70">dattasable.com</span>
                  </div>
                  <a 
                    href="https://dattasable.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0057D9] to-[#00C2FF] text-white font-extrabold text-xs uppercase rounded-xl shadow-md hover:from-[#0066FF] hover:to-[#00D2FF] active:scale-95 transition-all cursor-pointer text-center focus:outline-none w-full sm:w-auto"
                  >
                    Visit Website ↗
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/30 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <p>© 2026 InstantSite AI Platform. All rights reserved.</p>
                <p className="flex items-center gap-1">
                  Built with ❤️ by{" "}
                  <a 
                    href="https://dattasable.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#00C2FF] hover:underline font-bold transition-all"
                  >
                    Datta Sable
                  </a>
                </p>
              </div>
              <div className="flex gap-4">
                <a href="/privacy" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function LandingDemo() {
  const [promptText, setPromptText] = useState("Premium AI SaaS Analytics dashboard with glowing purple neon widgets");
  const [isTyping, setIsTyping] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState("");
  const [showMockup, setShowMockup] = useState(true);
  const [mockType, setMockType] = useState("dashboard");
  const [activeChip, setActiveChip] = useState<number | null>(0);

  // Interactivity states for the mockup screens
  const [crmMetric, setCrmMetric] = useState<'sales' | 'users' | 'conversion'>('sales');
  const [portfolioLikes, setPortfolioLikes] = useState<Record<number, boolean>>({});
  const [storeCartCount, setStoreCartCount] = useState(0);
  const [keyboardTheme, setKeyboardTheme] = useState<'grey' | 'cyberpunk' | 'forest'>('grey');

  const chips = [
    { text: "Premium AI SaaS Analytics dashboard with glowing purple neon widgets", type: "dashboard" },
    { text: "Minimal photography portfolio with serif fonts and light cream cards", type: "portfolio" },
    { text: "Vibrant custom mechanical keyboard storefront with dark grid style", type: "store" }
  ];

  const handleChipClick = (index: number) => {
    if (isTyping || isCompiling) return;
    setActiveChip(index);
    setPromptText("");
    setIsTyping(true);
    setShowMockup(false);
    
    const targetText = chips[index].text;
    let currentIdx = 0;
    
    const interval = setInterval(() => {
      if (currentIdx < targetText.length) {
        setPromptText(prev => prev + targetText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        startCompilation(chips[index].type);
      }
    }, 20);
  };

  const startCompilation = (type: string) => {
    setMockType(type);
    setIsCompiling(true);
    const steps = [
      "Parsing layout prompt guidelines...",
      "Resolving JIT design elements...",
      "Bundling Tailwind CSS parameters...",
      "Compiling live preview node tree..."
    ];
    let currentStep = 0;
    setCompileStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setCompileStep(steps[currentStep]);
      } else {
        clearInterval(stepInterval);
        setIsCompiling(false);
        setShowMockup(true);
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card bg-[#0F172A]/30 border border-white/[0.08] p-6 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 mb-6 text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mr-2 block">Choose prompt template:</span>
        {chips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(idx)}
            disabled={isTyping || isCompiling}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer focus:outline-none ${activeChip === idx ? 'bg-[#0057D9]/20 border-indigo-500 text-white' : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white hover:border-white/15'}`}
          >
            {idx === 0 ? "📊 AI SaaS Analytics" : idx === 1 ? "🎨 Creator Portfolio" : "⌨️ E-commerce Store"}
          </button>
        ))}
      </div>

      {/* Simulator input box */}
      <div className="relative bg-[#050B14] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3 text-left">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#00C2FF] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] animate-pulse"></span>
          Simulator Input Stream
        </div>
        <textarea
          readOnly
          value={promptText}
          placeholder="Select one of the suggestion chips above to begin simulated AI generation..."
          className="w-full bg-transparent border-none outline-none resize-none text-sm text-white placeholder:text-white/10 min-h-[60px] pointer-events-none"
        />
        {isCompiling && (
          <div className="flex items-center gap-2.5 p-3.5 bg-[#00C2FF]/5 border border-[#00C2FF]/15 rounded-xl text-xs text-[#00C2FF] font-medium animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{compileStep}</span>
          </div>
        )}
      </div>

      {/* Render mockup on compilation finish */}
      {showMockup && (
        <div className="mt-6 border border-white/[0.08] rounded-2xl overflow-hidden bg-[#081120] p-4 min-h-[220px] flex flex-col justify-between animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Compiler Preview Screen</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/30"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30"></span>
            </div>
          </div>
          
          {mockType === 'dashboard' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between py-1 text-white">
              {/* Header */}
              <div className="flex items-center justify-between bg-[#0F172A]/50 border border-white/[0.06] px-3 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded bg-[#00E5A0] shadow-[0_0_8px_rgba(0,229,160,0.5)] animate-pulse"></span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white">AI SaaS Workspace</span>
                </div>
                <div className="flex gap-1">
                  {(['sales', 'users', 'conversion'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCrmMetric(m)}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${crmMetric === m ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20' : 'bg-white/5 text-white/45 hover:text-white'}`}
                    >
                      {m === 'sales' ? 'mrr' : m === 'users' ? 'visitors' : 'conversion'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Metric & Chart Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {/* Metric Card */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    {crmMetric === 'sales' ? 'Monthly Rec. Revenue' : crmMetric === 'users' ? 'Active Visitors' : 'Conversion Rate'}
                  </span>
                  <div className="mt-1">
                    <p className="text-xl font-extrabold text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {crmMetric === 'sales' ? '$48,250' : crmMetric === 'users' ? '142.8K' : '3.42%'}
                    </p>
                    <span className="text-[8px] font-bold text-emerald-400 mt-1 block">
                      {crmMetric === 'sales' ? '+22.4% ARR' : crmMetric === 'users' ? '+15.3% MoM' : '+2.1% overall'}
                    </span>
                  </div>
                </div>

                {/* SVG Chart Card */}
                <div className="md:col-span-2 bg-[#0F172A]/20 border border-white/[0.05] p-3 rounded-xl flex flex-col justify-between relative min-h-[90px]">
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider block">Real-time Data (Interactive Chart)</span>
                  <div className="w-full h-12 mt-2 relative">
                    <svg className="w-full h-full" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <path
                        d={
                          crmMetric === 'sales'
                            ? "M 10 70 C 60 10, 110 50, 160 20 T 310 10"
                            : crmMetric === 'users'
                            ? "M 10 50 C 70 40, 120 20, 180 30 T 310 15"
                            : "M 10 75 C 60 70, 130 40, 190 45 T 310 30"
                        }
                        stroke="#00C2FF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-in-out"
                        style={{ filter: "drop-shadow(0px 0px 6px rgba(0, 194, 255, 0.4))" }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mockType === 'portfolio' && (
            <div className="flex-1 flex flex-col justify-between py-2 text-white">
              {/* Header / Profile info */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center relative overflow-hidden">
                    <User size={12} className="text-[#00E5A0]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white leading-none">Aria Vance</p>
                    <span className="text-[8px] text-white/40">Visual Artist</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-bold">
                  <span>❤️</span>
                  <span className="text-[#00E5A0] font-extrabold">{Object.values(portfolioLikes).filter(Boolean).length} Likes</span>
                </div>
              </div>

              {/* Photo Showcase Grid */}
              <div className="grid grid-cols-3 gap-3 my-1">
                {[
                  { id: 1, title: "Abstract Depth", grad: "from-[#0057D9] to-indigo-500" },
                  { id: 2, title: "Neon Cyber", grad: "from-[#00C2FF] to-cyan-500" },
                  { id: 3, title: "Lush Forest", grad: "from-[#00E5A0] to-emerald-500" }
                ].map((photo) => {
                  const isLiked = !!portfolioLikes[photo.id];
                  return (
                    <div 
                      key={photo.id}
                      className="group/card relative rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02] p-1.5 flex flex-col justify-between min-h-[90px] hover:border-emerald-500/20 transition-all duration-300"
                    >
                      <div className={`w-full h-10 rounded-lg bg-gradient-to-tr ${photo.grad} opacity-80 group-hover/card:scale-105 transition-transform duration-300`}></div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[7px] font-bold uppercase tracking-wider text-white/60 truncate max-w-[50px]">{photo.title}</span>
                        <button
                          onClick={() => setPortfolioLikes(prev => ({ ...prev, [photo.id]: !prev[photo.id] }))}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                          title="Like Photo"
                        >
                          <span className={`text-[9px] transition-transform active:scale-125 ${isLiked ? 'text-red-500 font-bold' : 'text-white/30 hover:text-white'}`}>
                            {isLiked ? '❤️' : '♡'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mockType === 'store' && (
            <div className="space-y-3 flex-1 flex flex-col justify-between py-1 text-white">
              {/* Header */}
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-white tracking-wide">Keyboard Boutique</span>
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold text-rose-400">
                  <span>🛒</span>
                  <span>{storeCartCount} items</span>
                </div>
              </div>
              
              {/* Customizer grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                {/* Controls */}
                <div className="space-y-2 text-left">
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Choose Colorcaps:</span>
                  <div className="flex gap-1">
                    {(['grey', 'cyberpunk', 'forest'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setKeyboardTheme(t)}
                        className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition-all cursor-pointer ${keyboardTheme === t ? 'bg-rose-500 text-white shadow shadow-rose-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStoreCartCount(prev => prev + 1)}
                    className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-[#081120] text-[9px] font-extrabold uppercase rounded-lg shadow-md transition-all cursor-pointer focus:outline-none"
                  >
                    Add custom board to cart
                  </button>
                </div>

                {/* Keyboard Layout Diagram */}
                <div className={`p-2 bg-black/60 border rounded-xl flex flex-col gap-1 items-center ${
                  keyboardTheme === 'grey' ? 'border-slate-600' : keyboardTheme === 'cyberpunk' ? 'border-pink-500/40 shadow-[0_0_10px_rgba(244,63,94,0.15)]' : 'border-emerald-500/40'
                }`}>
                  <div className="flex gap-0.5 w-full justify-between">
                    <span className={`w-3 h-3 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-500' : keyboardTheme === 'cyberpunk' ? 'bg-pink-500' : 'bg-emerald-600'} transition-colors`}></span>
                    <span className={`w-3 h-3 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-400' : keyboardTheme === 'cyberpunk' ? 'bg-cyan-500' : 'bg-emerald-500'} transition-colors`}></span>
                    <span className={`w-3 h-3 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-400' : keyboardTheme === 'cyberpunk' ? 'bg-cyan-500' : 'bg-emerald-500'} transition-colors`}></span>
                    <span className={`w-3 h-3 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-400' : keyboardTheme === 'cyberpunk' ? 'bg-cyan-500' : 'bg-emerald-500'} transition-colors`}></span>
                    <span className={`w-3 h-3 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-500' : keyboardTheme === 'cyberpunk' ? 'bg-pink-500' : 'bg-emerald-600'} transition-colors`}></span>
                  </div>
                  <div className="flex gap-0.5 w-full justify-center">
                    <span className={`w-10 h-2.5 rounded-xs ${keyboardTheme === 'grey' ? 'bg-slate-300' : keyboardTheme === 'cyberpunk' ? 'bg-pink-400' : 'bg-amber-100'} transition-colors`}></span>
                  </div>
                  <span className="text-[7px] font-bold text-white/30 uppercase mt-1">40% Keyboard Model</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AuthPageProps {
  authView: 'login' | 'register';
  setAuthView: (v: 'login' | 'register') => void;
  onAuthSuccess: (name: string, email: string) => void;
  onBackHome: () => void;
}

function AuthPage({ authView, setAuthView, onAuthSuccess, onBackHome }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (authView === 'register' && !name.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(authView === 'login' ? "Logged In! Redirecting..." : "Account Created! Redirecting...");
      setTimeout(() => {
        onAuthSuccess(authView === 'login' ? 'Pro Developer' : name, email);
      }, 1000);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Google Auth Success! Redirecting...");
      setTimeout(() => {
        onAuthSuccess('Google Developer', 'google.user@instantsite.ai');
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#081120] text-[#E2E8F0] font-sans flex items-center justify-center relative p-6">
      {/* Background noise and mesh (matching NexDial style) */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none z-0" />
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />
      <ParticleField />

      {/* Floating Blobs */}
      <div className="absolute top-[20%] left-[30%] w-[250px] h-[250px] bg-[#0057D9]/10 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[30%] w-[300px] h-[300px] bg-[#00E5A0]/6 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md glass-card bg-[#0F172A]/40 backdrop-blur-3xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col justify-between min-h-[460px] animate-scale-in text-left">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
            <button onClick={onBackHome} className="flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer">
              <History size={14} className="rotate-180" /> Back to Home
            </button>
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0057D9] to-[#00C2FF] flex items-center justify-center shadow-lg shadow-[#0057D9]/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-xs text-white">InstantSite</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">{authView === 'login' ? 'Welcome Back' : 'Create Developer Account'}</h2>
            <p className="text-xs text-white/50 mt-1">{authView === 'login' ? 'Log in to access your saved layouts and workspaces.' : 'Start generating layouts with JIT Tailwind compile presets.'}</p>
          </div>
        </div>

        {successMsg ? (
          <div className="my-10 flex flex-col items-center justify-center text-center space-y-3 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-[#00E5A0]/10 border border-[#00E5A0]/20 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-[#00E5A0] animate-bounce" /></div>
            <p className="text-sm font-bold text-[#00E5A0]">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 my-6">
            {authView === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full premium-input pl-4 pr-4 py-3 text-sm focus:outline-none" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Mail size={10} /> Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  placeholder="developer@mail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full premium-input pl-4 pr-4 py-3 text-sm focus:outline-none" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Lock size={10} /> Security Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full premium-input pl-4 pr-4 py-3 text-sm focus:outline-none" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 btn-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0057D9]/20 cursor-pointer focus:outline-none"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
              ) : authView === 'login' ? (
                <>Log In Workspace <ArrowRight size={14} /></>
              ) : (
                <>Create Developer Account <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        {/* OAuth & Toggle */}
        {!successMsg && (
          <div className="space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/[0.06]"></div>
              <span className="flex-shrink mx-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">or continue with</span>
              <div className="flex-grow border-t border-white/[0.06]"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl btn-google flex items-center justify-center gap-2.5 text-xs font-semibold cursor-pointer focus:outline-none"
            >
              <span className="shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </span>
              Google Account
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                className="text-xs font-semibold text-white/50 hover:text-[#00C2FF] transition-colors focus:outline-none cursor-pointer"
              >
                {authView === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

