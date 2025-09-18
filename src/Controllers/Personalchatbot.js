import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Asynchandler } from "../Utils/Asynchandler.js";
import {ApiResponse} from "../Utils/Apiresponse.js"
import {ApiError} from "../Utils/Apierror.js"

dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const Chat = Asynchandler(async (req, res) => {
  const {question} = req.body;

  try {
    const prompt =  `
  You are a helpful AI for a carreer guidance website. 
Rules
- If the question is about carreer → answer only question.
if the question is about subject or stream selection -> give him proper answer 
- If the question is about academics → answer the question with explanation in 2 or 3 line
- If the question is outside this scope → politely decline.
Keep your answers clear, short (2–4 sentences) and encouraging.
- Explain why a stream or career might suit them.
- Suggest 2–3 options if possible, so they feel they have choices.
- Avoid jargon — use simple school-level language.
- Be motivating, supportive, and never discourage them.

You are a helpful AI for a carrer  website. 
User asked: "${question}"

Rules:
- If the question is about carrer → answer it 
- If the question is outside this scope → politely decline.


and politely and give small response 
    `
    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

const text = result.candidates[0].content.parts[0].text;
res.json( new ApiResponse(200 , {
  text
}, 
 "Gemini called succesfully "
)
)

  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ answer: "Error fetching from AI" });
  }
});
export { Chat };
