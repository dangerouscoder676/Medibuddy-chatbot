import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const SYSTEM_INSTRUCTION = `
You are "MediBuddy", a friendly, supportive, and professional AI medical assistant.
Your goal is to provide clear, helpful, and empathetic health and wellness information.

CRITICAL GUIDELINES & LIMITATIONS:
1. DISCLAIMER REQUIRED: Keep the user informed that you are an AI assistant, not a licensed medical professional, and your suggestions are for informational and educational purposes only. Do not diagnose conditions or prescribe medications.
2. DETECT EMERGENCIES: If the user describes life-threatening or severe symptoms (e.g., severe chest pain, sudden numbness/weakness on one side of the body, difficulty breathing, severe bleeding, poisoning, suicidal thoughts), you must immediately output a prominent, styled emergency warning:
   "🚨 **EMERGENCY WARNING: PLEASE SEEK IMMEDIATE MEDICAL ATTENTION. CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY, OR GO TO THE NEAREST EMERGENCY ROOM.** 🚨"
   Keep any subsequent advice brief, urging them to get professional help.
3. SUGGEST AND EXPLAIN: Explain medical concepts in plain, patient-friendly terms. Suggest potential causes or categories of issues but phrase them as possibilities to discuss with a physician (e.g., "This might be related to...", "Some possibilities include...").
4. ACTIONS & NEXT STEPS: Suggest lifestyle tips, wellness recommendations, and questions to ask their doctor.
5. FORMATTING: Use structured Markdown. Use bullet points for symptoms/causes, bold text for key terms, and lists for recommendations. Avoid dense paragraphs.
`;

app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_KEY_HERE';
  res.json({
    status: 'ok',
    apiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const genAI = getGeminiClient();
  if (!genAI) {
    return res.json({
      text: `⚠️ **Gemini API Key Missing**\n\nThe Gemini API key has not been configured in the backend server yet.\n\nTo start chatting:\n1. Open the backend's \`.env\` file.\n2. Replace \`YOUR_KEY_HERE\` with your Gemini API key from Google AI Studio.\n3. Restart the backend server.`,
      isConfigError: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ text: responseText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({
      error: 'Failed to process request with Gemini API',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MediBuddy Server running on http://localhost:${PORT}`);
});
