import React from 'react';
import { Brain, Layout, BarChart3, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    stats?: {
        total: number;
        build: number;
        kill: number;
        wait: number;
    };
}

export function Header({ stats = { total: 0, build: 0, kill: 0, wait: 0 } }: HeaderProps) {
    return (
        <header className="h-20 border-b border-gray-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-2 ring-indigo-50">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Taste System
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">AI Decision Matrix</p>
                </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-8 bg-gray-50/50 px-6 py-2.5 rounded-2xl border border-gray-100">
                    <StatItem label="evaluated" value={stats.total} icon={<Layout className="w-3.5 h-3.5" />} />
                    <div className="w-[1px] h-4 bg-gray-200" />
                    <StatItem label="BUILD" value={stats.build} color="text-green-600" icon={<Rocket className="w-3.5 h-3.5" />} />
                    <div className="w-[1px] h-4 bg-gray-200" />
                    <StatItem label="KILL" value={stats.kill} color="text-red-500" icon={<BarChart3 className="w-3.5 h-3.5" />} />
                </div>

                <div className="h-8 w-[1px] bg-gray-200" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold ring-1 ring-indigo-100 shadow-sm uppercase tracking-wide">
                    v2.0 Premium
                </div>
            </div>
        </header>
    );
}

function StatItem({ label, value, color = "text-gray-900", icon }: { label: string, value: number, color?: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={cn("p-1 rounded-md bg-white border border-gray-100 shadow-sm", color)}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className={cn("text-sm font-black leading-none", color)}>{value}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
            </div>
        </div>
    );
}
