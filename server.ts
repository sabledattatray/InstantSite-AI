import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3005;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "Server Configuration Error: Missing GEMINI_API_KEY environment variable. Please check your .env configuration." });
    }

    try {
      const { prompt, stylePreset, typography, brandColor, attachments, referenceUrl } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      let referenceContent = "";
      if (referenceUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          
          const fetchResp = await fetch(referenceUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          });
          clearTimeout(timeoutId);
          
          if (fetchResp.ok) {
            const htmlText = await fetchResp.text();
            const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i);
            const descMatch = htmlText.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
            const title = titleMatch ? titleMatch[1] : "";
            const desc = descMatch ? descMatch[1] : "";
            let bodyText = htmlText.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
                                   .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
                                   .replace(/<[^>]+>/g, ' ')
                                   .replace(/\s+/g, ' ')
                                   .trim();
            bodyText = bodyText.substring(0, 1500);
            
            referenceContent = `\n\n[Reference Website metadata for Design/Aesthetic Matching]:\nURL: ${referenceUrl}\nTitle: ${title}\nDescription: ${desc}\nText Snippet: ${bodyText}\n`;
          }
        } catch (e) {
          console.warn("Could not fetch reference URL directly:", e);
          referenceContent = `\n\n[Reference Website brand name to Match Design]:\nURL: ${referenceUrl} (Mimic the color palettes, structural styles, header typography, card styling, and overall visual design language typically used by this brand).\n`;
        }
      }

      // Assemble content parts for multimodal input
      const contentParts: any[] = [];
      let textPrompt = prompt;
      if (referenceContent) {
        textPrompt += referenceContent;
      }
      contentParts.push({ text: textPrompt });

      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          if (file.type && file.type.startsWith("image/") && file.base64) {
            contentParts.push({
              inlineData: {
                mimeType: file.type,
                data: file.base64
              }
            });
          } else if (file.textContent) {
            contentParts.push({
              text: `\n\n[Attached Reference File: ${file.name}]\nContent:\n${file.textContent}`
            });
          }
        }
      }

      const systemPrompt = `You are an elite senior full-stack web developer, UI/UX designer, and master of Tailwind CSS.
You write production-ready, ultra-premium, modern, and fully responsive web pages.

TARGET FORMAT:
You MUST return ONLY a valid JSON object matching this TypeScript type:
{
  "title": "String - The site title",
  "description": "String - Short SEO description",
  "design_style": "String - Explanation of the design decisions",
  "html": "String - Entire HTML page contents, excluding html, head, and body tags. Use semantic HTML (header, main, section, footer) and Tailwind CSS classes extensively.",
  "css": "String - Custom CSS animations, scroll effects, glowing states, or resets.",
  "js": "String - Interactive script logic for layout features (mobile menu toggles, FAQ accordions, testimonial tabs, contact form alerts, etc.)."
}

DESIGN GUIDELINES BASED ON CHOSEN SETTINGS:
- Preset Style: "${stylePreset || "Modern SaaS"}"
  * Modern SaaS: Sleek dark/light cards, glowing gradients, tech icons, bento grids, and high-performance metrics.
  * Minimalist Portfolio: Massive white space, thin borders, elegant typography, pastel colors, and elegant profile images.
  * Premium Brutalist: Heavy outlines (border-4 border-black), thick flat solid shadows (shadow-[6px_6px_0px_0px_#000]), high contrast neon colors (bright yellow, orange, cyan), bold headlines, and solid blocks.
  * Glassmorphism: Translucent frosted overlays (bg-white/10 backdrop-blur-lg border border-white/20), circular blurred glowing backgrounds, and glowing neon gradients.
- Typography: "${typography || "Inter (Sans-serif)"}"
- Brand Primary Accent: "${brandColor || "indigo"}" (Use this Tailwind color, e.g. text-${brandColor}-500, bg-${brandColor}-600, hover:bg-${brandColor}-700, shadow-${brandColor}-500/20)

STRICT COMPONENT RULES:
1. SPACING & STRUCTURE:
   - Sections must have massive breathing space: use \`py-20\`, \`py-24\`, or \`py-32\`. Never squeeze content.
   - Constrain width with standard layout wrappers: \`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\`.
   - Grid spacing: always use responsive grid columns (\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12\`).
2. INTERACTIVE HEADER & NAVBAR:
   - Sticky header with glass background: \`fixed w-full top-0 z-50 bg-opacity-80 backdrop-blur-md border-b border-opacity-10\`.
   - Include a fully functional mobile hamburger button. Give the button a unique id (e.g. "mobile-menu-btn") and the menu container a unique id (e.g. "mobile-menu"). Write the toggle script in the "js" field.
3. PREMIUM HERO SECTION:
   - Large attention-grabbing text: \`text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none\`.
   - High-contrast gradients or colored text pings: \`<span class="text-transparent bg-clip-text bg-gradient-to-r from-${brandColor}-500 to-${brandColor}-400">...</span>\`.
   - Include a primary button with a hover hover:scale-105 transition and shadow glow, plus a secondary outline button.
4. HIGH-FIDELITY BENTO CARDS & DETAILS:
   - Features should look like cards: rounded-3xl with subtle border outlines and soft shadows. Add micro-interactions: \`hover:-translate-y-1 hover:shadow-2xl transition-all duration-300\`.
5. ALL-SECTIONS COMPLETENESS:
   - Ensure the generated HTML includes all standard sections of a premium, fully-realized website:
     * Header & Navigation
     * Hero section (with value proposition and CTAs)
     * Features grid (bento layout)
     * Real-time metrics or stats block
     * Interactive testimonial slider or tabs
     * Accordion-style FAQ section (fully interactive via JS)
     * Form-based Contact section (fully styled, with submitting alert simulation in JS)
     * Detailed footer with columns of links and social icons
6. REALISTIC VISUAL MEDIA:
   - Use high-resolution, topic-relevant Unsplash images instead of generic placeholders. Select the best matching photo ID from the curated list below, or choose another high-quality Unsplash image ID:
     * Technology/SaaS: photo-1518770660439-4636190af475, photo-1460925895917-afdab827c52f
     * Portfolio/Agency: photo-1507238691740-187a5b1d37b8, photo-1498050108023-c5249f4df085
     * Medical/Dentist/Clinic: photo-1505751172876-fa1923c5c528, photo-1629909613654-28e377c37b09
     * Fitness/Gym/Sport: photo-1517838277536-f5f99be501cd, photo-1517838277536-f5f99be501cd
     * Food/Restaurant/Bakery: photo-1517248135467-4c7edcad34c4, photo-1509440159596-0249088772ff, photo-1495474472287-4d71bcdd2085
     * Education/School/Academy: photo-1523050854058-8df90110c9f1, photo-1524995997946-a1c2e315a42f
     * Real Estate/Home/Interior: photo-1564013799919-ab600027ffc6, photo-1566073771259-6a8506099945
     * Lifestyle/Art/Creative: photo-1513542789411-b6a5d4f31634, photo-1511671782779-c97d3d27a1d4
     * Product/Store: photo-1468436139062-f60a71c5c892, photo-1523275335684-37898b6baf30
   - Format: \`https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80\`
7. PREMIUM VECTOR ICONS:
   - Never use simple text or unicode emojis for icons. Always use beautifully styled inline SVGs with standard Tailwind sizes (e.g. \`w-6 h-6\`).
8. SCROLL REVEAL & ANIMATIONS:
   - Provide custom keyframe animations in the "css" block (e.g. fade-in, float, slide-up, scale-up). Apply these animation classes to elements to make the website feel interactive and premium.
9. ROBUST JAVASCRIPT:
   - Write clean, error-free JavaScript. Handle toggles (faq, menu), form submissions (simulation displaying a styled alert), and slider switchers correctly.
   - CRITICAL: For all anchor tags with \`href="#"\`, include \`e.preventDefault()\` in your event listeners to prevent reload loops.
   - Escape all double quotes (\`"\` -> \`\\"\`) inside the JavaScript string representation in JSON.

Deliver a visually stunning website that looks like it cost $15,000 to design. Make margins big, colors curated, and text perfectly readable. Return ONLY valid JSON.`;

      let text = "";
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contentParts,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          });
          text = response.text;
          break;
        } catch (error: any) {
          if ((error.message?.includes("503") || error.message?.includes("429")) && retries > 1) {
            console.log(`API busy, retrying... (${retries - 1} attempts left)`);
            await new Promise(res => setTimeout(res, 2000));
            retries--;
          } else {
            throw error;
          }
        }
      }

      let result;
      try {
         // Sanitize response text in case it's wrapped in markdown code blocks
         let sanitizedText = text.trim();
         if (sanitizedText.startsWith("```json")) {
           sanitizedText = sanitizedText.slice(7);
         } else if (sanitizedText.startsWith("```")) {
           sanitizedText = sanitizedText.slice(3);
         }
         if (sanitizedText.endsWith("```")) {
           sanitizedText = sanitizedText.slice(0, -3);
         }
         sanitizedText = sanitizedText.trim();
         
         result = JSON.parse(sanitizedText);
         result.typography = typography;
         result.brandColor = brandColor;
         result.stylePreset = stylePreset;
      } catch (e) {
         console.error("JSON parsing error:", e);
         console.error("Raw text was:", text);
         return res.status(500).json({ error: "Failed to parse JSON response from AI." });
      }

      res.json(result);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error.message || String(error) || "Failed to generate website" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
