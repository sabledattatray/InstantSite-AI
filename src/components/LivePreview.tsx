import { useEffect, useRef } from 'react';
import { GeneratedSite } from '../types';

interface LivePreviewProps {
  site: GeneratedSite | null;
  viewportSize?: 'mobile' | 'tablet' | 'desktop';
}

export default function LivePreview({ site, viewportSize = 'desktop' }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!site || !iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    // We inject tailwind CDN and the appropriate font based on the style selection
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" class="scroll-smooth">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${site.title || 'InstantSite Preview'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            /* Base reset for preview */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: ${site.design_style?.toLowerCase().includes('serif') ? '"Playfair Display", serif' : site.design_style?.toLowerCase().includes('mono') ? '"Space Grotesk", sans-serif' : '"Inter", sans-serif'}; 
              -webkit-font-smoothing: antialiased; 
              overflow-x: hidden;
            }
            ${site.css || ''}
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body class="bg-gray-50 text-gray-900 selection:bg-indigo-500/30">
          ${site.html}
          <script>
            try {
              ${site.js || ''}
            } catch(e) {
              console.error('User Script Error:', e);
            }
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

  }, [site]);

  if (!site) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F1A] text-white/40 p-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium">No site generated yet.</p>
        <p className="text-xs mt-1 text-white/30 text-center max-w-xs">Enter a prompt and hit generate to create your instant website.</p>
      </div>
    );
  }

  // Determine iframe container width based on viewport selection
  const getContainerWidth = () => {
    switch (viewportSize) {
      case 'mobile': return 'w-[375px] h-[812px] max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]';
      case 'tablet': return 'w-[768px] h-[1024px] max-h-[95vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]';
      case 'desktop': return 'w-full h-full';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className="flex-1 w-full bg-[#0B0F1A] relative flex justify-center overflow-auto items-center p-2 sm:p-4 md:p-8">
      
      <div className={`${getContainerWidth()} bg-white transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-white/10 overflow-hidden relative ${viewportSize !== 'desktop' ? 'rounded-[2rem] ring-8 ring-[#111827] flex-shrink-0' : 'rounded-xl h-full'}`}>
        
        {viewportSize !== 'desktop' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#111827] rounded-b-3xl z-50 flex justify-center items-center">
            <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-white absolute inset-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
          aria-label="Website Live Preview"
        />
      </div>

    </div>
  );
}
