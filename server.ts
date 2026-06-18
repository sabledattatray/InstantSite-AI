import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Server Configuration Error: Missing GEMINI_API_KEY environment variable." });
    }

    try {
      const { prompt, stylePreset, typography, brandColor } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const systemPrompt = `You are an elite senior full-stack web architect, UI/UX expert, and Tailwind CSS master.
You generate production-ready, ultra-premium, award-winning responsive websites.

TARGET OUTPUT:
You must return only valid JSON with the following structure:
{
  "title": "String - Website Title",
  "description": "String - Short description",
  "design_style": "String - The stylistic approach you took",
  "html": "String - Full HTML document body content, omitting html/head/body tags. MUST use Tailwind CSS classes extensively.",
  "css": "String - (Optional) Custom CSS for keyframes or specific overrides if Tailwind cannot achieve it. Leave empty if possible.",
  "js": "String - Relevant JavaScript logic."
}

USER PREFERENCES TO ENFORCE:
- Style Preset: ${stylePreset || "Modern SaaS"}
- Typography: ${typography || "Inter (Sans-serif)"}
- Brand Primary Color (Tailwind class prefix): ${brandColor || "indigo"} (e.g., bg-indigo-600, text-indigo-500)

CRITICAL DESIGN RULES (STRICTLY ENFORCED):
1. SPACING & LAYOUT (THE MOST IMPORTANT RULE): 
   - Every section MUST have generous vertical padding: use \`py-20\`, \`py-24\` or \`py-32\` for sections. DO NOT USE SMALL PADDING LIKE \`p-4\` or \`p-8\` for main sections.
   - Content MUST be constrained using wrappers: \`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\`. Do NOT let elements stretch full width unless intended (like a background).
   - Use CSS Grid for structured content: \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12\`.
2. TYPOGRAPHY & CONTRAST:
   - Use ultra-clean typography.
   - Hero headlines must be massive and tight: \`text-5xl md:text-7xl font-extrabold tracking-tight leading-tight\`.
   - Add contrast to subheadings using \`text-lg md:text-xl text-gray-500 font-medium\`.
3. PREMIUM COMPONENTS:
   - STICKY NAVBAR: \`fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100\`. Add proper inner max-w wrappers!
   - HERO SECTION: \`min-h-[80vh] flex items-center justify-center pt-24\`.
   - CARDS: Must look premium. \`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1\`.
   - BUTTONS: \`inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 bg-${brandColor}-600 text-white hover:bg-${brandColor}-700 shadow-lg shadow-${brandColor}-500/30\`.
4. IMAGES/VISUALS:
   - You MUST use beautiful, valid images that load successfully.
   - Use stable image services: \`https://picsum.photos/seed/\${Math.random()}/1200/800\` or hardcoded Unsplash verified URLs like \`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80\`.
   - Alternatively, use beautiful CSS gradient blocks for hero areas: \`bg-gradient-to-br from-${brandColor}-500 to-${brandColor}-700 rounded-3xl aspect-video shadow-2xl\`.
5. RESPONSIVENESS:
   - MUST look perfect on mobile. Always use \`flex-col md:flex-row\` and scale typography correctly.
6. INTERACTIVITY & EVENTS:
   - Include JS for mobile hamburgers and menu toggling.
   - For links with \`href="#"\`, you MUST include \`e.preventDefault();\` in your JS click handlers to prevent the iframe from navigating and breaking the preview.

FAILURE TO FOLLOW THESE RULES RESULTS IN TERMINATION. Your output must instantly look like a $10k/month agency produced it. Refine margins, use huge white space, and elegant styling. Do not apologize, do not explain. Return ONLY valid JSON.`;

      let text = "";
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-8b",
            contents: prompt,
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
