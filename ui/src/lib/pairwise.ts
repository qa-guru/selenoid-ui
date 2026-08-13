/** Greedy 2-way covering array over a factor map (pairwise / all-pairs). */

export type FactorMap = Record<string, readonly string[]>;
export type Row<F extends FactorMap> = { [K in keyof F]: F[K][number] };

function factorKeys<F extends FactorMap>(factors: F): (keyof F & string)[] {
    return Object.keys(factors) as (keyof F & string)[];
}

function pairKey(a: string, va: string, b: string, vb: string): string {
    return a < b ? `${a}=${va}|${b}=${vb}` : `${b}=${vb}|${a}=${va}`;
}

export function cartesian<F extends FactorMap>(factors: F): Row<F>[] {
    const keys = factorKeys(factors);
    let rows: Record<string, string>[] = [{}];
    for (const key of keys) {
        const next: Record<string, string>[] = [];
        for (const row of rows) {
            for (const value of factors[key]) {
                next.push({ ...row, [key]: value });
            }
        }
        rows = next;
    }
    return rows as Row<F>[];
}

function rowPairs<F extends FactorMap>(factors: F, row: Row<F>): string[] {
    const keys = factorKeys(factors);
    const out: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            const a = keys[i];
            const b = keys[j];
            out.push(pairKey(a, String(row[a]), b, String(row[b])));
        }
    }
    return out;
}

function rowSignature<F extends FactorMap>(factors: F, row: Row<F>): string {
    return factorKeys(factors)
        .map((key) => `${key}=${row[key]}`)
        .join(";");
}

function matchesPartial<F extends FactorMap>(row: Row<F>, partial: Partial<Row<F>>): boolean {
    return Object.entries(partial).every(([key, value]) => value == null || row[key as keyof F] === value);
}

export type PairwiseOptions<F extends FactorMap> = {
    /** Rows that must appear (partials are completed by the covering greedy). */
    seeds?: Array<Partial<Row<F>>>;
    allowed?: (row: Row<F>) => boolean;
};

/**
 * Smallest-ish set of rows such that every allowed pair of factor values appears.
 * Deterministic: cartesian order follows factor insertion; ties → lexicographic signature.
 */
export function pairwise<F extends FactorMap>(factors: F, options: PairwiseOptions<F> = {}): Row<F>[] {
    const { seeds = [], allowed = () => true } = options;
    const universe = cartesian(factors)
        .filter(allowed)
        .sort((a, b) => rowSignature(factors, a).localeCompare(rowSignature(factors, b)));

    const uncovered = new Set<string>();
    for (const row of universe) {
        for (const key of rowPairs(factors, row)) {
            uncovered.add(key);
        }
    }

    const selected: Row<F>[] = [];
    const selectedSig = new Set<string>();

    const pick = (row: Row<F>) => {
        const sig = rowSignature(factors, row);
        if (selectedSig.has(sig)) {
            return;
        }
        selected.push(row);
        selectedSig.add(sig);
        for (const key of rowPairs(factors, row)) {
            uncovered.delete(key);
        }
    };

    for (const seed of seeds) {
        const matches = universe.filter((row) => matchesPartial(row, seed));
        if (!matches.length) {
            throw new Error(`pairwise seed matches no allowed row: ${JSON.stringify(seed)}`);
        }
        let best = matches[0];
        let bestCover = -1;
        for (const row of matches) {
            const cover = rowPairs(factors, row).filter((key) => uncovered.has(key)).length;
            const sig = rowSignature(factors, row);
            const bestSig = rowSignature(factors, best);
            if (cover > bestCover || (cover === bestCover && sig.localeCompare(bestSig) < 0)) {
                best = row;
                bestCover = cover;
            }
        }
        pick(best);
    }

    while (uncovered.size) {
        let best: Row<F> | null = null;
        let bestCover = 0;
        for (const row of universe) {
            const sig = rowSignature(factors, row);
            if (selectedSig.has(sig)) {
                continue;
            }
            const cover = rowPairs(factors, row).filter((key) => uncovered.has(key)).length;
            if (!best) {
                if (cover > 0) {
                    best = row;
                    bestCover = cover;
                }
                continue;
            }
            const bestSig = rowSignature(factors, best);
            if (cover > bestCover || (cover === bestCover && sig.localeCompare(bestSig) < 0)) {
                best = row;
                bestCover = cover;
            }
        }
        if (!best || bestCover === 0) {
            break;
        }
        pick(best);
    }

    return selected;
}

/** Every 2-way combination of factor values that exists in `rows`. */
export function coveredPairs<F extends FactorMap>(factors: F, rows: Row<F>[]): Set<string> {
    const out = new Set<string>();
    for (const row of rows) {
        for (const key of rowPairs(factors, row)) {
            out.add(key);
        }
    }
    return out;
}

export function uncoveredPairs<F extends FactorMap>(
    factors: F,
    rows: Row<F>[],
    allowed: (row: Row<F>) => boolean = () => true
): string[] {
    const covered = coveredPairs(factors, rows);
    const missing: string[] = [];
    const seen = new Set<string>();
    for (const row of cartesian(factors).filter(allowed)) {
        for (const key of rowPairs(factors, row)) {
            if (!covered.has(key) && !seen.has(key)) {
                seen.add(key);
                missing.push(key);
            }
        }
    }
    return missing.sort();
}
