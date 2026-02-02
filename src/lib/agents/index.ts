import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";
import { Verdict } from "@/types";


export async function loadPrompt(agentName: string): Promise<string> {
    const promptPath = path.join(process.cwd(), "src/prompts", `${agentName}.txt`);
    try {
        const content = await fs.readFile(promptPath, "utf-8");
        return content;
    } catch (error) {
        console.error(`Error loading prompt for ${agentName}:`, error);
        throw new Error(`Prompt for ${agentName} not found.`);
    }
}

export async function callGemini(systemPrompt: string, userInput: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please ensure it is set in .env.local and that you have restarted the dev server.");
    }

    const VERSION = "v1.5-DEBUG";
    const modelName = "gemini-2.0-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    try {
        const result = await model.generateContent(userInput);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        const maskedKey = apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : "MISSING";
        console.error(`[${VERSION}] Gemini API Error:`, {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        throw new Error(`[CODE-${VERSION}] [Model: ${modelName}] [Key: ${maskedKey}] ${error.message || "Failed to call Gemini API"}`);
    }
}

export function extractVerdict(responseText: string, agentName: string): Verdict {
    // Strip markdown markers and normalize case for parsing
    const normalizedText = responseText.replace(/\*/g, "").toUpperCase();

    // Look for patterns like "VERDICT: PASS" or "GATE 2 VERDICT: FAIL"
    // The regex is now run on the normalized (no-markdown) text
    const verdictRegex = /(?:VERDICT|VALIDATION VERDICT|GATE \d VERDICT|ECONOMICS VERDICT|TIMING VERDICT|ARCHITECT VERDICT)\s*[:]*\s*([A-Z ]+)/i;
    const match = normalizedText.match(verdictRegex);

    if (match) {
        const value = match[1].trim();
        if (value.includes("PASS")) return "PASS";
        if (value.includes("FAIL")) return "FAIL";
        if (value.includes("NOW")) return "NOW";
        if (value.includes("WAIT")) return "WAIT";
        if (value.includes("TOO LATE")) return "TOO LATE";
        if (value.includes("VIABLE") && !value.includes("NOT")) return "VIABLE";
        if (value.includes("NOT VIABLE")) return "NOT VIABLE";
        if (value.includes("NEEDS REFINEMENT")) return "NEEDS REFINEMENT";
    }

    // Comprehensive Fallback search
    if (normalizedText.includes("VERDICT: PASS") || normalizedText.includes("PASS")) {
        // Only return if it's a stand-alone word or in a common verdict line
        if (/\bPASS\b/.test(normalizedText)) return "PASS";
    }

    if (normalizedText.includes("FAIL") && /\bFAIL\b/.test(normalizedText)) return "FAIL";

    if (agentName === "timing") {
        if (normalizedText.includes("NOW")) return "NOW";
        if (normalizedText.includes("WAIT")) return "WAIT";
    }

    if (agentName === "economics") {
        if (normalizedText.includes("VIABLE") && !normalizedText.includes("NOT VIABLE")) return "VIABLE";
        if (normalizedText.includes("NOT VIABLE")) return "NOT VIABLE";
        if (normalizedText.includes("NEEDS REFINEMENT")) return "NEEDS REFINEMENT";
    }

    return "UNKNOWN";
}
