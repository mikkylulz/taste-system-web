"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { EvaluateForm } from '@/components/EvaluateForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Evaluation, GateResult, Verdict } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEval, setCurrentEval] = useState<Partial<Evaluation> | null>(null);
  const [status, setStatus] = useState('');
  const [viewHistoryItem, setViewHistoryItem] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('taste_evaluations');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to LocalStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('taste_evaluations', JSON.stringify(history));
    }
  }, [history]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNew();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stats = useMemo(() => {
    return {
      total: history.length,
      build: history.filter(h => h.verdict === 'BUILD').length,
      kill: history.filter(h => h.verdict === 'KILL').length,
      wait: history.filter(h => h.verdict === 'WAIT').length,
    };
  }, [history]);

  const handleEvaluate = async (idea: string) => {
    setIsEvaluating(true);
    setViewHistoryItem(null);
    setError(null);
    setStatus("Thinking...");
    setCurrentEval({ idea, results: {}, timestamp: new Date().toISOString() });

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) throw new Error("Failed to start evaluation");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let results: Record<string, GateResult> = {};
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n\n');

        while (boundary !== -1) {
          const chunk = buffer.substring(0, boundary).trim();
          buffer = buffer.substring(boundary + 2);

          if (chunk.startsWith('data: ')) {
            try {
              const data = JSON.parse(chunk.substring(6));

              if (data.status) setStatus(data.status);

              if (data.gate && data.result) {
                results[data.gate] = data.result;
                setCurrentEval(prev => ({
                  ...prev,
                  results: { ...results }
                }));
              }

              if (data.finalVerdict) {
                const finalEvaluation: Evaluation = {
                  id: Math.random().toString(36).substring(7),
                  idea,
                  timestamp: new Date().toISOString(),
                  verdict: data.finalVerdict as 'BUILD' | 'KILL' | 'WAIT' | 'REFINE',
                  results: { ...data.results }
                };

                setHistory(prev => [finalEvaluation, ...prev]);
                setCurrentEval(finalEvaluation);
                setIsEvaluating(false);
              }

              if (data.error) {
                setError(data.error);
                setIsEvaluating(false);
                return; // Stop processing
              }
            } catch (e: any) {
              // Only log if it's an actual JSON parse error, not a valid data.error
              if (!chunk.includes('"error"')) {
                console.error("Failed to parse JSON chunk:", chunk, e);
              }
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (error: any) {
      console.error("Evaluation error:", error);
      setStatus(`Error: ${error.message}`);
      setError(error.message);
      setIsEvaluating(false);
    }
  };

  const handleSelectHistory = (evaluation: Evaluation) => {
    setViewHistoryItem(evaluation);
    setCurrentEval(null);
    setIsEvaluating(false);
    setError(null);
  };

  const handleNew = () => {
    setCurrentEval(null);
    setViewHistoryItem(null);
    setIsEvaluating(false);
    setStatus('');
    setError(null);
  };

  const displayedEval = viewHistoryItem || currentEval;

  return (
    <div className="flex h-screen bg-transparent font-sans text-gray-900 overflow-hidden">
      {/* Sidebar - Desktop Only for now */}
      <div className="hidden lg:block">
        <Sidebar
          history={history}
          onSelect={handleSelectHistory}
          onNew={handleNew}
          currentId={displayedEval?.id}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header stats={stats} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            <AnimatePresence mode="wait">
              {!displayedEval && !isEvaluating ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <EvaluateForm onEvaluate={handleEvaluate} isLoading={isEvaluating} />
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <ResultsDisplay
                    results={displayedEval?.results || {}}
                    finalVerdict={displayedEval?.verdict}
                    isEvaluating={isEvaluating}
                    status={status}
                    idea={displayedEval?.idea || ""}
                    onBack={() => {
                      setCurrentEval(null);
                      setError(null);
                    }}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
