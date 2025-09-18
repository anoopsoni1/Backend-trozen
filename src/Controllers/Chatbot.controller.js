import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Asynchandler } from "../Utils/Asynchandler.js";
import { ApiResponse } from "../Utils/Apiresponse.js";
import { ApiError } from "../Utils/Apierror.js";

dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const Chatbot = Asynchandler(async (req, res) => {
  const { Biology, Mathematics, Commerce, Arts } = req.body;

  try {
    const prompt = `
You are a career counselor.
Analyze the student’s subject-wise scores and recommend the most suitable career stream.

Scores: Biology=${Biology}, Mathematics=${Mathematics}, Commerce=${Commerce}, Arts=${Arts}

Available streams:
- Science (PCB): if Biology score is highest and > 0
- Science (PCM): if Mathematics score is highest and > 0
- Commerce: if Commerce score is highest
- Arts/Humanities: if Arts score is highest

Instructions:
1. Identify the highest score(s)
2. Select the corresponding stream(s)
3. If tie between top scores, reflect both in the output
4. If all scores are 0, default to Arts/Humanities
5. Output must strictly follow this JSON format:

{
  "highest_stream": "<Science (PCM) | Science (PCB) | Commerce | Arts/Humanities | Combination (if tie)>",
  "strengths": "<1 short descriptive line highlighting the student's strongest subjects and why they stand out>",
  "recommendation": "<2-3 motivational sentences explaining why this stream is best, referencing their strengths and suggesting possible career paths>"
}
`;

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // Extract AI response
    let aiText = result.candidates[0].content.parts[0].text;

    // Remove markdown if present
    aiText = aiText.replace(/```json|```/g, "").trim();

    // Parse AI response to JSON
    const aiData = JSON.parse(aiText);

    // Send clean structured response
    res.json({
      statusCode: 200,
      success: true,
      message: "Gemini called successfully",
      data: aiData,
    });

  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error fetching data from AI",
      error: err.message,
    });
  }
});

export { Chatbot };
