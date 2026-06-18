import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/bg-ai-bg text-white/g, 'bg-ai-bg text-ai-text');
content = content.replace(/border-white\/5/g, 'border-ai-text/5');
content = content.replace(/border-white\/10/g, 'border-ai-text/10');
content = content.replace(/border-white\/20/g, 'border-ai-text/20');
content = content.replace(/text-white\/40/g, 'text-ai-text/50');
content = content.replace(/text-white\/50/g, 'text-ai-text/60');
content = content.replace(/text-white\/60/g, 'text-ai-text/70');
content = content.replace(/text-white\/80/g, 'text-ai-text/80');
content = content.replace(/text-white\/20/g, 'text-ai-text/30');
content = content.replace(/bg-white\/5/g, 'bg-ai-text/5');
content = content.replace(/bg-white\/10/g, 'bg-ai-text/10');
content = content.replace(/bg-white\/20/g, 'bg-ai-text/20');
content = content.replace(/bg-black\/20/g, 'bg-ai-text/5');
content = content.replace(/bg-black\/40/g, 'bg-ai-text/5');
content = content.replace(/bg-\[#1F2937\]/g, 'bg-ai-surface/80');
content = content.replace(/text-white">InstantSite/g, 'text-ai-text">InstantSite');
content = content.replace(/text-white">/g, 'text-ai-text">');
content = content.replace(/text-white"/g, 'text-ai-text"');
content = content.replace(/text-white /g, 'text-ai-text ');
content = content.replace(/text-white</g, 'text-ai-text<');
content = content.replace(/hover:text-white/g, 'hover:text-ai-text');

// Revert button text on gradient to white
content = content.replace(/text-ai-text font-bold rounded-xl shadow-lg/g, 'text-white font-bold rounded-xl shadow-lg');
content = content.replace(/bg-ai-text hover:bg-ai-text\/90 text-ai-bg/g, 'bg-ai-text hover:bg-ai-text/90 text-ai-bg');

// Fix preview container background
content = content.replace(/bg-\[#0B0F1A\]/g, 'bg-ai-bg');

fs.writeFileSync('src/App.tsx', content);

// Also fix LivePreview
let lpContent = fs.readFileSync('src/components/LivePreview.tsx', 'utf-8');
lpContent = lpContent.replace(/bg-\[#0B0F1A\]/g, 'bg-ai-bg/50');
lpContent = lpContent.replace(/bg-\[#111827\]/g, 'bg-ai-surface');
lpContent = lpContent.replace(/ring-\[#111827\]/g, 'ring-ai-surface');
lpContent = lpContent.replace(/border-white\/5/g, 'border-ai-text/5');
lpContent = lpContent.replace(/text-white\/40/g, 'text-ai-text/50');
lpContent = lpContent.replace(/text-white\/60/g, 'text-ai-text/70');
lpContent = lpContent.replace(/text-white\/80/g, 'text-ai-text/80');
lpContent = lpContent.replace(/bg-\[#1F2937\]/g, 'bg-ai-text/5');
lpContent = lpContent.replace(/bg-white\/5/g, 'bg-ai-text/5');
lpContent = lpContent.replace(/border-white\/10/g, 'border-ai-text/10');
lpContent = lpContent.replace(/text-white/g, 'text-ai-text');
lpContent = lpContent.replace(/bg-white/g, 'bg-ai-surface');
lpContent = lpContent.replace(/bg-ai-surface transition-all/g, 'bg-white transition-all'); // revert for the inner preview container
fs.writeFileSync('src/components/LivePreview.tsx', lpContent);

console.log("Colors fixed");
