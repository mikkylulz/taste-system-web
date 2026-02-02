export type Verdict = 'PASS' | 'FAIL' | 'NOW' | 'WAIT' | 'TOO LATE' | 'VIABLE' | 'NOT VIABLE' | 'NEEDS REFINEMENT' | 'UNKNOWN';

export interface GateResult {
    gate: string;
    verdict: Verdict;
    output: string;
}

export interface Evaluation {
    id: string;
    timestamp: string;
    idea: string;
    verdict: 'BUILD' | 'KILL' | 'WAIT' | 'REFINE';
    results: Record<string, GateResult>;
}

export interface Signal {
    id: string;
    timestamp: string;
    content: string;
    output: string;
}
