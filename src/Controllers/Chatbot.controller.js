import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Asynchandler } from "../Utils/Asynchandler.js";
import {ApiResponse} from "../Utils/Apiresponse.js"
import {ApiError} from "../Utils/Apierror.js"

dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const Chatbot = Asynchandler(async (req, res) => {
  const { Biology ,Mathematics , Commerce , Arts } = req.body;

  try {
    const prompt =  `
You are a career counselor.
the ${Biology} , ${Mathematics} , ${Commerce} ,${Arts} ,
Analyze the student’s subject-wise scores and recommend the most suitable career stream.

*Available streams:*

* *Science (PCB):* if Biology score is the highest and greater than 0
* *Science (PCM):* if Mathematics score is the highest and greater than 0
* *Commerce:* if Commerce score is the highest
* *Arts/Humanities:* if Arts score is the highest

*Instructions:*

1. Identify the highest subject score(s)
2. Select the corresponding stream(s)
3. If there is a tie between top scores, reflect both strengths in the output.
4. If all scores are 0, default to *Arts/Humanities*.
5. Output must strictly follow this JSON format:

json
{
  "highest_stream": "<Science (PCB) | Science (PCM) | Commerce | Arts/Humanities | Combination in case of tie>",
  "strengths": "<1 short line summarizing the strongest subject(s) and why>",
  "recommendation": "<2-3 motivational lines explaining why this stream is best, highlighting key strengths and possible career paths>"
}
    `

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
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
export { Chatbot };
