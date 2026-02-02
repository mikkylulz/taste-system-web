import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Download,
    ArrowLeft,
    Rocket,
    Flame,
    Hourglass,
    History,
    FileDown
} from 'lucide-react';
import { GateResult, Verdict } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ResultsDisplayProps {
    results: Record<string, GateResult>;
    finalVerdict?: string;
    isEvaluating: boolean;
    status: string;
    idea?: string;
    onBack?: () => void;
    error?: string | null;
}

const GATES = [
    { id: 'validator', name: 'Gate 1: Problem Validator', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'architect', name: 'Gate 2: Solution Architect', icon: <Rocket className="w-4 h-4" /> },
    { id: 'simplifier', name: 'Gate 3: Simplicity Enforcer', icon: <Flame className="w-4 h-4" /> },
    { id: 'timing', name: 'Gate 4: Timing Analyst', icon: <Hourglass className="w-4 h-4" /> },
    { id: 'economics', name: 'Gate 5: Economics Modeler', icon: <History className="w-4 h-4" /> },
];

export function ResultsDisplay({ results, finalVerdict, isEvaluating, status, idea, onBack, error }: ResultsDisplayProps) {
    const [expandedGate, setExpandedGate] = React.useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (finalVerdict === 'BUILD') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366F1', '#10B981', '#3B82F6']
            });
        }
    }, [finalVerdict]);

    const exportToMarkdown = () => {
        let md = `# Evaluation for Idea: ${idea || 'Untitled'}\n\n`;
        md += `**Date**: ${new Date().toLocaleString()}\n`;
        md += `**Final Verdict**: ${finalVerdict}\n\n`;
        md += `---\n\n`;

        GATES.forEach(gate => {
            const result = results[gate.id];
            if (result) {
                md += `## ${gate.name}\n`;
                md += `**Verdict**: ${result.verdict}\n\n`;
                md += `${result.output}\n\n`;
                md += `---\n\n`;
            }
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evaluation-${new Date().getTime()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getVerdictStyles = (verdict: string) => {
        switch (verdict) {
            case 'BUILD': return "bg-green-500 text-white shadow-green-200 border-green-600";
            case 'KILL': return "bg-red-500 text-white shadow-red-200 border-red-600 animate-shake";
            case 'WAIT': return "bg-amber-500 text-white shadow-amber-200 border-amber-600";
            default: return "bg-blue-500 text-white shadow-blue-200 border-blue-600";
        }
    };

    return (
        <div ref={containerRef} className="space-y-10 max-w-4xl mx-auto pb-32">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-rose-50 border border-rose-200 rounded-[2rem] flex items-start gap-4 shadow-sm"
                >
                    <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-rose-900 font-black uppercase tracking-widest text-xs mb-1">Error Occurred</h3>
                        <p className="text-rose-700 font-medium">
                            {error.includes("429") || error.includes("quota")
                                ? "You've hit the Gemini free tier limit. Please wait about 60 seconds before trying your next evaluation."
                                : error}
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-black transition-colors"
                    >
                        RETRY LATER
                    </button>
                </motion.div>
            )}

            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-sm font-black text-gray-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BACK TO LAB
                </button>

                {finalVerdict && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToMarkdown}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-xs font-black border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-700"
                        >
                            <FileDown className="w-4 h-4" /> EXPORT REPORT
                        </button>
                    </div>
                )}
            </div>

            {/* Idea Summary */}
            <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">
                    {idea}
                </h2>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Evaluated {new Date().toLocaleDateString()}</span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>Sensei Model v4.0</span>
                </div>
            </div>

            {/* Final Verdict Banner */}
            <AnimatePresence>
                {finalVerdict && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "relative p-12 rounded-[3rem] text-center space-y-4 shadow-2xl border-b-8 overflow-hidden",
                            finalVerdict === 'BUILD' ? "bg-green-50 border-green-500/20" :
                                finalVerdict === 'KILL' ? "bg-red-50 border-red-500/20" :
                                    finalVerdict === 'WAIT' ? "bg-amber-50 border-amber-500/20" :
                                        "bg-blue-50 border-blue-500/20"
                        )}
                    >
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            {finalVerdict === 'BUILD' ? <Rocket className="w-64 h-64 rotate-12" /> :
                                finalVerdict === 'KILL' ? <Flame className="w-64 h-64" /> : <Hourglass className="w-64 h-64" />}
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The Verdict</div>
                            <div className={cn(
                                "inline-flex items-center gap-3 px-12 py-6 rounded-3xl text-7xl font-black italic tracking-tighter shadow-2xl mb-4 border-b-4 transform -rotate-2",
                                getVerdictStyles(finalVerdict)
                            )}>
                                {finalVerdict}!
                            </div>

                            <p className="text-gray-500 font-bold text-lg max-w-md mx-auto">
                                {finalVerdict === 'BUILD' ? "This idea passed all 5 gates. Ready to build." :
                                    finalVerdict === 'KILL' ? "This idea failed to meet the Taste Codex standards." :
                                        finalVerdict === 'WAIT' ? "Technical or market conditions aren't right yet." :
                                            "This idea shows potential but needs more refinement."}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Status */}
            {isEvaluating && (
                <div className="glass p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                            {status}
                        </span>
                        <span className="text-xs font-bold text-gray-400">Est. 1m 15s total</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-200/50">
                        <motion.div
                            className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"
                            initial={{ width: "5%" }}
                            animate={{ width: `${Object.keys(results).length * 20 + 5}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>
            )}

            {/* Gate Results */}
            <div className="space-y-4">
                {GATES.map((gate, index) => {
                    const result = results[gate.id];
                    const isLocked = !result && !isEvaluating;
                    const isCurrent = isEvaluating && !result && (index === 0 || results[GATES[index - 1].id]);

                    return (
                        <div
                            key={gate.id}
                            className={cn(
                                "group border rounded-[2rem] overflow-hidden transition-all duration-300",
                                result ? "glass hover:shadow-2xl" :
                                    isCurrent ? "bg-white border-indigo-200 ring-4 ring-indigo-50 animate-pulse" :
                                        "bg-gray-50/50 border-gray-100 opacity-40 grayscale"
                            )}
                        >
                            <button
                                onClick={() => result && setExpandedGate(expandedGate === gate.id ? null : gate.id)}
                                className="w-full flex items-center justify-between p-7 px-8 text-left"
                                disabled={!result}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                        result?.verdict === 'PASS' || result?.verdict === 'NOW' || result?.verdict === 'VIABLE' ? "bg-green-500 text-white shadow-green-200" :
                                            result?.verdict === 'FAIL' || result?.verdict === 'TOO LATE' || result?.verdict === 'NOT VIABLE' ? "bg-red-500 text-white shadow-red-200" :
                                                result?.verdict === 'WAIT' || result?.verdict === 'NEEDS REFINEMENT' ? "bg-amber-500 text-white shadow-amber-200" :
                                                    isCurrent ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-white border border-gray-200 text-gray-300"
                                    )}>
                                        {gate.icon}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                            {gate.name.split(':')[0]}
                                        </span>
                                        <span className="text-lg font-black text-gray-900">{gate.name.split(':')[1]}</span>
                                    </div>
                                </div>

                                {result ? (
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                                            (result.verdict === 'PASS' || result.verdict === 'NOW' || result.verdict === 'VIABLE') ? "bg-green-100 text-green-700" :
                                                (result.verdict === 'WAIT' || result.verdict === 'NEEDS REFINEMENT') ? "bg-amber-100 text-amber-700" :
                                                    result.verdict === 'UNKNOWN' ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600"
                                        )}>
                                            {result.verdict}
                                        </div>
                                        {expandedGate === gate.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                ) : isCurrent ? (
                                    <div className="flex items-center gap-3 pr-4">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </div>
                                ) : null}
                            </button>

                            <AnimatePresence>
                                {expandedGate === gate.id && result && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-white/50 border-t border-gray-100"
                                    >
                                        <div className="p-10 prose prose-sm max-w-none text-gray-600">
                                            <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap bg-gray-900 text-gray-100 p-8 rounded-3xl shadow-inner border border-gray-800">
                                                {result.output}
                                            </div>

                                            {/* Summary Points for Quick Scanning */}
                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <ResultHighlight title="Key Advantage" highlight="10X Better" />
                                                <ResultHighlight title="Risk Level" highlight="Low-Moderate" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ResultHighlight({ title, highlight }: { title: string, highlight: string }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</div>
            <div className="text-sm font-black text-indigo-600">{highlight}</div>
        </div>
    );
}
