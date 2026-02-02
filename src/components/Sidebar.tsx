import React from 'react';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Plus,
    Brain,
    Settings,
    Download,
    ChevronRight,
    Filter,
    ShieldCheck,
    Zap,
    Radio
} from 'lucide-react';
import { Evaluation } from '@/types';

interface SidebarProps {
    history: Evaluation[];
    onSelect: (evaluation: Evaluation) => void;
    onNew: () => void;
    currentId?: string;
}

export function Sidebar({ history, onSelect, onNew, currentId }: SidebarProps) {
    const stats = {
        successRate: history.length > 0 ? Math.round((history.filter(h => h.verdict === 'BUILD').length / history.length) * 100) : 0,
        avgTime: "2m 34s",
    };

    return (
        <div className="w-[300px] bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-40">
            {/* Brand/Top Action */}
            <div className="p-6">
                <button
                    onClick={onNew}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>New Evaluation</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {/* Quick Stats */}
                <div className="mb-8 px-2">
                    <SectionHeader icon={<BarChart3 className="w-3.5 h-3.5" />} title="Quick Stats" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <StatsMiniCard label="Success Rate" value={`${stats.successRate}%`} />
                        <StatsMiniCard label="Avg Time" value={stats.avgTime} />
                    </div>
                </div>

                {/* Filters Active */}
                <div className="mb-8 px-2">
                    <SectionHeader icon={<Filter className="w-3.5 h-3.5" />} title="Filters Active" />
                    <div className="space-y-2 mt-4">
                        <FilterItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="5-Minute Rule" />
                        <FilterItem icon={<Zap className="w-3.5 h-3.5" />} label="AI Execution" />
                        <FilterItem icon={<Radio className="w-3.5 h-3.5" />} label="Bleeding Edge" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8 px-2">
                    <SectionHeader icon={<Zap className="w-3.5 h-3.5" />} title="Quick Actions" />
                    <div className="space-y-1 mt-4">
                        <ActionButton icon={<Download className="w-4 h-4" />} label="Export All" />
                        <ActionButton icon={<Settings className="w-4 h-4" />} label="Settings" />
                    </div>
                </div>

                {/* History Section */}
                <div className="mb-8">
                    <div className="px-2 flex items-center justify-between mb-4">
                        <SectionHeader icon={<Brain className="w-3.5 h-3.5" />} title="History" />
                        <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {history.length}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {history.length === 0 ? (
                            <div className="text-[11px] text-gray-400 italic px-4 py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                Fresh palette. Start your first evaluation.
                            </div>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-2xl transition-all border group relative",
                                        currentId === item.id
                                            ? "bg-indigo-50 border-indigo-100 shadow-[0_4px_12px_rgba(99,102,241,0.08)]"
                                             : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                            item.verdict === 'BUILD' ? "bg-green-100 text-green-700" :
                                                item.verdict === 'KILL' ? "bg-red-100 text-red-600" :
                                                    item.verdict === 'WAIT' ? "bg-amber-100 text-amber-700" :
                                                        "bg-blue-100 text-blue-700"
                                        )}>
                                            {item.verdict}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "text-xs font-bold truncate pr-6",
                                        currentId === item.id ? "text-indigo-900" : "text-gray-700"
                                    )}>
                                        {item.idea}
                                    </div>
                                    <ChevronRight className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all opacity-0 group-hover:opacity-100",
                                        currentId === item.id ? "text-indigo-400 opacity-100" : "text-gray-300"
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-50 italic text-[10px] text-gray-400 text-center font-medium">
                Brutal AI. Better Decisions.
            </div>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
        </div>
    );
}

function StatsMiniCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
            <div className="text-sm font-black text-gray-900 leading-none">{value}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-none">{label}</div>
        </div>
    );
}

function FilterItem({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 bg-indigo-50/20 rounded-xl border border-indigo-100/30">
            <div className="text-indigo-400">{icon}</div>
            <span className="text-[11px] font-bold text-indigo-900/70">{label}</span>
        </div>
    );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all text-[11px] font-bold active:scale-[0.98]">
            {icon}
            <span>{label}</span>
        </button>
    );
}
