import { NextRequest } from "next/server";
import { callGemini, loadPrompt, extractVerdict } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const { idea } = await req.json();

    if (!idea) {
        return new Response(JSON.stringify({ error: "Idea is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                let currentInput = idea;
                let results: Record<string, any> = {};

                // Gate 1: Validator
                sendUpdate({ status: "Running Gate 1: Problem Validator...", gate: "validator" });
                const validatorOutput = await callGemini(await loadPrompt("validator"), currentInput);
                const validatorVerdict = extractVerdict(validatorOutput, "validator");
                results.validator = { output: validatorOutput, verdict: validatorVerdict };
                sendUpdate({ gate: "validator", result: results.validator });

                if (validatorVerdict === "FAIL") {
                    sendUpdate({ status: "Gate 1 Failed. Stopping.", finalVerdict: "KILL", results });
                    controller.close();
                    return;
                }

                // Gate 2: Architect
                sendUpdate({ status: "Running Gate 2: Solution Architect...", gate: "architect" });
                const architectOutput = await callGemini(await loadPrompt("architect"), validatorOutput);
                const architectVerdict = extractVerdict(architectOutput, "architect");
                results.architect = { output: architectOutput, verdict: architectVerdict };
                sendUpdate({ gate: "architect", result: results.architect });

                if (architectVerdict === "FAIL") {
                    sendUpdate({ status: "Gate 2 Failed. Stopping.", finalVerdict: "REFINE", results });
                    controller.close();
                    return;
                }

                // Gate 3: Simplifier
                sendUpdate({ status: "Running Gate 3: Simplicity Enforcer...", gate: "simplifier" });
                const simplifierOutput = await callGemini(await loadPrompt("simplifier"), architectOutput);
                results.simplifier = { output: simplifierOutput, verdict: "PASS" };
                sendUpdate({ gate: "simplifier", result: results.simplifier });

                // Gate 4: Timing
                sendUpdate({ status: "Running Gate 4: Timing Analyst...", gate: "timing" });
                const timingOutput = await callGemini(await loadPrompt("timing"), simplifierOutput);
                const timingVerdict = extractVerdict(timingOutput, "timing");
                results.timing = { output: timingOutput, verdict: timingVerdict };
                sendUpdate({ gate: "timing", result: results.timing });

                if (timingVerdict === "WAIT" || timingVerdict === "TOO LATE") {
                    sendUpdate({
                        status: timingVerdict === "WAIT" ? "Market/Tech not ready. Waiting." : "Market saturated.",
                        finalVerdict: timingVerdict === "WAIT" ? "WAIT" : "KILL",
                        results
                    });
                    controller.close();
                    return;
                }

                // Gate 5: Economics
                sendUpdate({ status: "Running Gate 5: Economics Modeler...", gate: "economics" });
                const economicsOutput = await callGemini(await loadPrompt("economics"), timingOutput);
                const economicsVerdict = extractVerdict(economicsOutput, "economics");
                results.economics = { output: economicsOutput, verdict: economicsVerdict };
                sendUpdate({ gate: "economics", result: results.economics });

                let finalVerdict = "BUILD";
                if (economicsVerdict === "NOT VIABLE") finalVerdict = "KILL";
                if (economicsVerdict === "NEEDS REFINEMENT") finalVerdict = "REFINE";

                sendUpdate({ status: "Evaluation Complete!", finalVerdict, results });
                controller.close();
            } catch (error: any) {
                console.error("Evaluation Error:", error);
                sendUpdate({ error: error.message || "An unexpected error occurred" });
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
