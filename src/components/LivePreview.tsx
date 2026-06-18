import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GeneratedSite } from '../types';

interface LivePreviewProps {
  site: GeneratedSite | null;
  viewportSize?: 'mobile' | 'tablet' | 'desktop';
  isEditMode?: boolean;
}

const EDITOR_SCRIPT = `
  <script>
    (function() {
      let selectedEl = null;
      let isEditMode = false;

      window.addEventListener('message', (e) => {
        if (!e.data || typeof e.data !== 'object') return;
        if (e.data.type === 'TOGGLE_EDIT_MODE') {
           isEditMode = e.data.payload;
           if (!isEditMode && selectedEl) {
             selectedEl.style.outline = selectedEl._prevOutline || '';
             selectedEl = null;
             window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
           }
        }
      });

      document.addEventListener('mouseover', (e) => {
        if (!isEditMode || selectedEl === e.target || e.target.tagName === 'HTML' || e.target.tagName === 'BODY') return;
        e.target.style.outline = '2px dashed #00D2FF';
        e.target.style.outlineOffset = '-2px';
      });

      document.addEventListener('mouseout', (e) => {
        if (!isEditMode || selectedEl === e.target || e.target.tagName === 'HTML' || e.target.tagName === 'BODY') return;
        e.target.style.outline = '';
        e.target.style.outlineOffset = '';
      });

      document.addEventListener('click', (e) => {
        if (!isEditMode) return;
        if (e.target.tagName === 'HTML' || e.target.tagName === 'BODY') {
           // Clicked background, deselect
           if (selectedEl) {
             selectedEl.style.outline = selectedEl._prevOutline || '';
             selectedEl = null;
             window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
           }
           return;
        }
        e.preventDefault();
        e.stopPropagation();
        
        if (selectedEl) {
          selectedEl.style.outline = selectedEl._prevOutline || '';
        }
        
        selectedEl = e.target;
        selectedEl._prevOutline = selectedEl.style.outline;
        selectedEl.style.outline = '2px solid #FF4D8D';
        selectedEl.style.outlineOffset = '-2px';
        
        if (!selectedEl.id) {
          selectedEl.id = 'el-' + Math.random().toString(36).substr(2, 9);
        }

        const styles = window.getComputedStyle(selectedEl);
        
        // Simple text node check (no complex HTML inside)
        const isSimpleText = selectedEl.childNodes.length === 1 && selectedEl.firstChild.nodeType === 3;
        // Or if it has text content and no element children
        const hasTextChild = isSimpleText || (selectedEl.innerText && selectedEl.children.length === 0);
        
        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          payload: {
            id: selectedEl.id,
            tagName: selectedEl.tagName,
            textContent: hasTextChild ? selectedEl.innerText : '',
            hasTextChild: hasTextChild,
            styles: {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              paddingTop: styles.paddingTop,
              paddingRight: styles.paddingRight,
              paddingBottom: styles.paddingBottom,
              paddingLeft: styles.paddingLeft,
              marginTop: styles.marginTop,
              marginRight: styles.marginRight,
              marginBottom: styles.marginBottom,
              marginLeft: styles.marginLeft,
              fontSize: styles.fontSize,
              borderRadius: styles.borderRadius
            }
          }
        }, '*');
      }, true);

      window.addEventListener('message', (e) => {
        if (!e.data || typeof e.data !== 'object') return;
        
        if (e.data.type === 'UPDATE_ELEMENT' && selectedEl) {
           const { prop, value } = e.data.payload;
           if (prop === 'deselect') {
             selectedEl.style.outline = selectedEl._prevOutline || '';
             selectedEl = null;
             window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
           } else if (prop === 'delete') {
             selectedEl.remove();
             selectedEl = null;
             window.parent.postMessage({ type: 'ELEMENT_DESELECTED' }, '*');
           } else if (prop === 'src') {
             if (selectedEl.tagName === 'IMG') {
               selectedEl.src = value;
             } else {
               // Update background image instead if it's not an img tag
               selectedEl.style.backgroundImage = "url('" + value + "')";
               selectedEl.style.backgroundSize = 'cover';
               selectedEl.style.backgroundPosition = 'center';
             }
           } else if (prop === 'textContent') {
             selectedEl.innerText = value;
           } else {
             selectedEl.style[prop] = value;
           }
        }
      });
    })();
  </script>
`;

export default function LivePreview({ site, viewportSize = 'desktop', isEditMode = false }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'TOGGLE_EDIT_MODE', payload: isEditMode }, '*');
    }
  }, [isEditMode]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data.payload);
      } else if (e.data.type === 'ELEMENT_DESELECTED') {
        setSelectedElement(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updateElement = (prop: string, value: string) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({
      type: 'UPDATE_ELEMENT',
      payload: { prop, value }
    }, '*');
    
    setSelectedElement((prev: any) => {
       if (!prev) return prev;
       if (prop === 'textContent') {
         return { ...prev, textContent: value };
       }
       return { ...prev, styles: { ...prev.styles, [prop]: value } };
    });
  };

  useEffect(() => {
    if (!site || !iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    // Reset selected element on new site
    setSelectedElement(null);

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
          ${EDITOR_SCRIPT}
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Re-sync edit mode
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'TOGGLE_EDIT_MODE', payload: isEditMode }, '*');
    }, 100);

  }, [site]);

  if (!site) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-ai-bg/50 text-ai-text/50 p-4">
        <div className="w-16 h-16 rounded-full bg-ai-text/5 flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-8 h-8 text-ai-text/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium">No site generated yet.</p>
        <p className="text-xs mt-1 text-ai-text/30 text-center max-w-xs">Enter a prompt and hit generate to create your instant website.</p>
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
    <div className="flex-1 w-full bg-ai-bg/50 relative flex justify-center overflow-auto items-start p-2 sm:p-4 md:p-8">
      
      <div className={`${getContainerWidth()} my-auto bg-white transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-ai-text/10 overflow-hidden relative ${viewportSize !== 'desktop' ? 'rounded-[2rem] ring-8 ring-ai-surface flex-shrink-0' : 'rounded-xl h-full'}`}>
        
        {viewportSize !== 'desktop' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-ai-surface rounded-b-3xl z-50 flex justify-center items-center">
            <div className="w-16 h-1.5 bg-ai-surface/10 rounded-full"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-ai-surface absolute inset-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
          aria-label="Website Live Preview"
        />
      </div>

      {/* ELEMENTOR-STYLE FLOATING PROPERTIES PANEL */}
      {selectedElement && (
        <div className="absolute right-4 top-4 bottom-4 w-72 bg-ai-surface/90 backdrop-blur-xl border border-ai-text/10 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in overflow-hidden">
          <div className="p-4 border-b border-ai-text/5 flex items-center justify-between bg-ai-text/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ai-primary" />
              <h3 className="font-semibold text-sm text-ai-text">Edit {selectedElement.tagName.toLowerCase()}</h3>
            </div>
            <button onClick={() => updateElement('deselect', '')} className="text-ai-text/50 hover:text-ai-text p-1 rounded-md hover:bg-ai-surface/10 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Text Content Editor */}
            {selectedElement.hasTextChild && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest">Text Content</label>
                <textarea 
                  value={selectedElement.textContent || ''} 
                  onChange={(e) => updateElement('textContent', e.target.value)}
                  className="w-full bg-ai-text/5 border border-ai-text/5 rounded-xl p-3 text-sm focus:border-ai-primary/50 outline-none text-ai-text transition-colors"
                  rows={3}
                />
              </div>
            )}

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest">Colors</label>
              
              <div className="flex items-center justify-between bg-ai-text/5 p-2 rounded-xl border border-ai-text/5">
                <span className="text-xs text-ai-text/80 pl-2">Text Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ai-text/50">{selectedElement.styles.color}</span>
                  <input 
                    type="color" 
                    value={rgbToHex(selectedElement.styles.color) || '#000000'}
                    onChange={(e) => updateElement('color', e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-ai-text/5 p-2 rounded-xl border border-ai-text/5">
                <span className="text-xs text-ai-text/80 pl-2">Background</span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-ai-text/50">{selectedElement.styles.backgroundColor}</span>
                  <input 
                    type="color" 
                    value={rgbToHex(selectedElement.styles.backgroundColor) || '#ffffff'}
                    onChange={(e) => updateElement('backgroundColor', e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  />
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest">Spacing</label>
              
              <div className="space-y-2">
                <span className="text-[10px] text-ai-text/70">Padding</span>
                <div className="grid grid-cols-2 gap-2">
                   <input type="text" placeholder="Top" value={selectedElement.styles.paddingTop} onChange={(e) => updateElement('paddingTop', e.target.value)} className="bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                   <input type="text" placeholder="Right" value={selectedElement.styles.paddingRight} onChange={(e) => updateElement('paddingRight', e.target.value)} className="bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                   <input type="text" placeholder="Bottom" value={selectedElement.styles.paddingBottom} onChange={(e) => updateElement('paddingBottom', e.target.value)} className="bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                   <input type="text" placeholder="Left" value={selectedElement.styles.paddingLeft} onChange={(e) => updateElement('paddingLeft', e.target.value)} className="bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest">Typography & Radius</label>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <span className="text-[10px] text-ai-text/70 block mb-1">Font Size</span>
                    <input type="text" value={selectedElement.styles.fontSize} onChange={(e) => updateElement('fontSize', e.target.value)} className="w-full bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                 </div>
                 <div>
                    <span className="text-[10px] text-ai-text/70 block mb-1">Border Radius</span>
                    <input type="text" value={selectedElement.styles.borderRadius} onChange={(e) => updateElement('borderRadius', e.target.value)} className="w-full bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text" />
                 </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-ai-text/5">
              <label className="text-[10px] font-bold text-ai-text/50 uppercase tracking-widest">Media</label>
              <div>
                <span className="text-[10px] text-ai-text/70 block mb-1">{selectedElement.tagName === 'IMG' ? 'Image URL' : 'Background / Image URL'}</span>
                <input type="text" placeholder="https://..." onChange={(e) => updateElement('src', e.target.value)} className="w-full bg-ai-text/5 border border-ai-text/5 rounded-lg p-2 text-xs text-ai-text mb-2" />
                <span className="text-[10px] text-ai-text/70 block mb-1">Or upload local file</span>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result && typeof ev.target.result === 'string') {
                        updateElement('src', ev.target.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} className="w-full text-xs text-ai-text/80 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-ai-primary/20 file:text-ai-primary hover:file:bg-ai-primary/30" />
              </div>
            </div>

            <div className="pt-2 border-t border-ai-text/5">
              <button onClick={() => updateElement('delete', '')} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors">
                Delete Element
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Utility to convert rgb() to hex for the color picker
function rgbToHex(rgb: string) {
  if (!rgb || !rgb.startsWith('rgb')) return '#ffffff';
  
  // Handle rgba correctly, optionally drop alpha for native color input
  const match = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*(\\d*\\.?\\d+))?\\)/);
  if (!match) return '#ffffff';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
