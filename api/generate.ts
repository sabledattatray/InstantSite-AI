import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  if (!ai) {
    return res.status(500).json({ error: "Configuration Error: GEMINI_API_KEY is not set in Vercel Environment Variables. Please add it in project settings and redeploy." });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body provided." });
    }
  }

  try {
    const { prompt, stylePreset, typography, brandColor, attachments, referenceUrl } = body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

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

    const systemPrompt = `You are an elite senior full-stack web architect, UI/UX expert, and Tailwind CSS master.
You generate production-ready, ultra-premium, award-winning responsive websites.

TARGET OUTPUT:
You must return only valid JSON with the following structure:
{
  "title": "String - Website Title",
  "description": "String - Short description",
  "design_style": "String - The stylistic approach you took",
  "html": "String - Full HTML document body content, omitting html/head/body tags. MUST use Tailwind CSS classes extensively.",
  "css": "String - Custom CSS for keyframes, animations, or overrides.",
  "js": "String - Relevant JavaScript logic."
}

USER PREFERENCES TO ENFORCE:
- Style Preset: ${stylePreset || "Modern SaaS"}
- Typography: ${typography || "Inter (Sans-serif)"}
- Brand Primary Color (Tailwind class prefix): ${brandColor || "indigo"} (e.g., bg-indigo-600, text-indigo-500)

CRITICAL DESIGN RULES (STRICTLY ENFORCED):
1. SPACING & LAYOUT (THE MOST IMPORTANT RULE): 
   - Every section MUST have generous vertical padding: use \`py-20\`, \`py-24\` or \`py-32\` for sections. DO NOT USE SMALL PADDING LIKE \`p-4\` or \`p-8\` for main sections.
   - Content MUST be constrained using wrappers: \`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\`. Do NOT let elements stretch full width unless intended.
   - Use CSS Grid for structured content: \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12\`.
2. TYPOGRAPHY & CONTRAST:
   - Use ultra-clean typography.
   - Hero headlines must be massive and tight: \`text-5xl md:text-7xl font-extrabold tracking-tight leading-tight\`.
   - Add contrast to subheadings using \`text-lg md:text-xl text-gray-500 font-medium\`.
3. PREMIUM COMPONENTS:
   - STICKY NAVBAR: \`fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100\`. Add proper inner wrappers.
   - HERO SECTION: \`min-h-[80vh] flex items-center justify-center pt-24\`.
   - CARDS: Must look premium. \`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1\`.
   - BUTTONS: \`inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 bg-${brandColor}-600 text-white hover:bg-${brandColor}-700 shadow-lg shadow-${brandColor}-500/30\`.
4. ALL-SECTIONS COMPLETENESS:
   - Ensure the generated HTML includes all standard sections of a premium, fully-realized website:
     * Header & Navigation
     * Hero section (with value proposition and CTAs)
     * Features grid (bento layout)
     * Real-time metrics or stats block
     * Interactive testimonial slider or tabs
     * Accordion-style FAQ section (fully interactive via JS)
     * Form-based Contact section (fully styled, with submitting alert simulation in JS)
     * Detailed footer with columns of links and social icons
5. IMAGES/VISUALS:
   - Use high-resolution, topic-relevant Unsplash images instead of generic placeholders. Select the best matching photo ID from the curated list below, or choose another high-quality Unsplash image ID:
     * Technology/SaaS: photo-1518770660439-4636190af475, photo-1460925895917-afdab827c52f
     * Portfolio/Agency: photo-1507238691740-187a5b1d37b8, photo-1498050108023-c5249f4df085
     * Medical/Dentist/Clinic: photo-1505751172876-fa1923c5c528, photo-1629909613654-28e377c37b09
     * Fitness/Gym/Sport: photo-1517838277536-f5f99be501cd
     * Food/Restaurant/Bakery: photo-1517248135467-4c7edcad34c4, photo-1509440159596-0249088772ff, photo-1495474472287-4d71bcdd2085
     * Education/School/Academy: photo-1523050854058-8df90110c9f1, photo-1524995997946-a1c2e315a42f
     * Real Estate/Home/Interior: photo-1564013799919-ab600027ffc6, photo-1566073771259-6a8506099945
     * Lifestyle/Art/Creative: photo-1513542789411-b6a5d4f31634, photo-1511671782779-c97d3d27a1d4
     * Product/Store: photo-1468436139062-f60a71c5c892, photo-1523275335684-37898b6baf30
   - Format: \`https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80\`
6. PREMIUM VECTOR ICONS:
   - Never use simple text or unicode emojis for icons. Always use beautifully styled inline SVGs with standard Tailwind sizes (e.g. \`w-6 h-6\`).
7. SCROLL REVEAL & ANIMATIONS:
   - Provide custom keyframe animations in the "css" block (e.g. fade-in, float, slide-up, scale-up). Apply these animation classes to elements.
8. RESPONSIVENESS:
   - MUST look perfect on mobile. Always use \`flex-col md:flex-row\` and scale typography correctly.
9. INTERACTIVITY & EVENTS:
   - Include JS for mobile hamburgers, FAQ accordion item triggers, and menu toggling.
   - For links with \`href="#"\`, you MUST include \`e.preventDefault();\` in your JS click handlers to prevent the iframe from navigating and breaking the preview.
   - Escape all double quotes (\`"\` -> \`\\"\`) inside the JavaScript string representation in JSON.

FAILURE TO FOLLOW THESE RULES RESULTS IN TERMINATION. Your output must instantly look like a $10k/month agency produced it. Refine margins, use huge white space, and elegant styling. DO NOT output overly verbose HTML; keep code concise to avoid timeouts. Do not apologize. Return ONLY valid JSON.`;

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
        text = response.text || "";
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
}
