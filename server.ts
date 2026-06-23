import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper to avoid crashing on launch if key is absent
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required for Gemini features.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST endpoints for the study assistant
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { task, sectionText, customPrompt, payload } = req.body;
    
    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        error: "No Gemini API key found. Please configure it in Settings > Secrets." 
      });
    }

    const client = getAiClient();
    let prompt = "";

    switch(task) {
      case "explain":
        prompt = `You are a world-class UPSC CSE teacher (Civil Services Examination in India). Explain this section of study material simply to a candidate, keeping the tone scholarly but very clear. Do not summarize or remove key terms, but clear up any dense jargon:\n\n"${sectionText}"`;
        break;
      case "upsc_lens":
        prompt = `As an expert UPSC mentor, analyze the following text from both Prelims and Mains perspective. Detail the probable "Prelims Lens" (focus areas, facts, trick areas) and "Mains Lens" (analytical dimensions, core issues, critical arguments, and sub-components like which paper GS I/II/III it belongs to):\n\n"${sectionText}"`;
        break;
      case "socratic":
        prompt = `Generate 3 socratic questions that force an active retrieval/critical thinking for a UPSC candidate based on this textbook passage:\n\n"${sectionText}"`;
        break;
      case "mcq":
        prompt = `Generate a highly rigorous, UPSC-standard Multiple Choice Question (MCQ) complete with 4 options (A, B, C, D), correct key, and an in-depth explanation based on this text:\n\n"${sectionText}"`;
        break;
      case "flashcard":
        prompt = `Create 2 short revision flashcards (front/back) for memorizing key details from this UPSC study material. Frame it as "Front: [Question/Concept]" and "Back: [Key Facts/Articles/Details]":\n\n"${sectionText}"`;
        break;
      case "mains_prompt":
        prompt = `Generate a UPSC CSE Mains high-yield question (10-15 marks) along with an answer skeleton (Introduction guidance, Body layout with subheadings, Articles/cases/committees to cite, and Conclusion suggestion) based on this content:\n\n"${sectionText}"`;
        break;
      case "current_affairs":
        prompt = `You are a UPSC Current Affairs editor. Classify the following news snippet/article:
1. Assign it a UPSC Subject/Syllabus Area (e.g. Polity, Economy, S&T).
2. Write a 20-word revision note summarizing its high-yield impact.
3. Suggest a 1-sentence UPSC candidate take-away (prelims/mains perspective).
Content: "${sectionText}"`;
        break;
      case "custom":
        prompt = `${customPrompt}\n\nContext text:\n"${sectionText}"`;
        break;
      default:
        prompt = `Provide a premium, UPSC-focused study brief for the following material:\n\n"${sectionText}"`;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ output: response.text });
  } catch (error: any) {
    console.error("Gemini route error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content from Gemini." });
  }
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`CSEGuide Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
