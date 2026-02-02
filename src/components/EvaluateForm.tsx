import React, { useState, useEffect } from 'react';
import { Send, Zap, MessageSquare, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EvaluateFormProps {
    onEvaluate: (idea: string) => void;
    isLoading: boolean;
}

const EXAMPLE_IDEAS = [
    "AI expense tracker via WhatsApp",
    "Automated SEO tool for Next.js apps",
    "Platform for non-custodial tipping",
];

export function EvaluateForm({ onEvaluate, isLoading }: EvaluateFormProps) {
    const [idea, setIdea] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (idea.trim() && !isLoading) {
            onEvaluate(idea);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest ring-1 ring-indigo-100 shadow-sm mb-4"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    The Brutal Filter
                </motion.div>
                <h2 className="text-6xl font-black tracking-tight text-gray-900 lg:text-7xl">
                    Put your idea <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">to the test</span>
                </h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                    Our agent system sequentially evaluates your concept against the Taste Codex. Get BUILD, KILL, or WAIT in minutes.
                </p>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "relative glass p-2 rounded-[2.5rem] transition-all duration-500",
                    isFocused ? "shadow-2xl shadow-indigo-200/40 ring-2 ring-indigo-500/20" : "shadow-xl"
                )}
            >
                <div className="relative group overflow-hidden rounded-[calc(2.5rem-0.5rem)]">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Describe your idea... What problem does it solve? Who desperately needs this?"
                        className={cn(
                            "w-full min-h-[220px] p-10 bg-white text-xl font-medium leading-relaxed outline-none border-none",
                            "placeholder:text-gray-300 resize-none transition-all",
                            isLoading && "opacity-50 pointer-events-none"
                        )}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleSubmit();
                            }
                        }}
                    />

                    <div className="absolute bottom-8 right-10 flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                idea.length > 500 ? "text-red-500" : "text-gray-400"
                            )}>
                                {idea.length} / 1000 characters
                            </span>
                            <span className="text-[10px] text-gray-300 font-bold hidden sm:block">
                                Ctrl + Enter to evaluate
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={!idea.trim() || isLoading}
                            className={cn(
                                "h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-3",
                                "hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-200/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none",
                                isLoading && "animate-pulse"
                            )}
                        >
                            <Zap className={cn("w-5 h-5", !isLoading && "fill-current")} />
                            {isLoading ? "EVALUATING..." : "EVALUATE IDEA"}
                        </button>
                    </div>
                </div>
            </motion.form>

            <div className="flex flex-wrap justify-center gap-4 py-4">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Try an example:
                </span>
                {EXAMPLE_IDEAS.map((example) => (
                    <button
                        key={example}
                        onClick={() => setIdea(example)}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                    >
                        {example}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                <TasteFeature
                    icon={<MessageSquare className="w-5 h-5" />}
                    title="5-Minute Rule"
                    desc="Value must be delivered in under 5 minutes or it's too complex."
                />
                <TasteFeature
                    icon={<Target className="w-5 h-5" />}
                    title="Zero Learning Curve"
                    desc="If a five year old can't use it, we don't build it."
                />
                <TasteFeature
                    icon={<Zap className="w-5 h-5" />}
                    title="AI Execution"
                    desc="AI does the heavy lifting. The user just directs the outcome."
                />
            </div>
        </div>
    );
}

function TasteFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass p-8 rounded-3xl space-y-4 group hover:shadow-2xl transition-all duration-300">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-black text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
