import React, { useState } from "react";

import {
    GLOSSARY_LINE,
    ONE_RUN_ROWS,
    SEQUENCE_STEPS,
    TOPOLOGY_EDGES,
    TOPOLOGY_NODES,
    TOPOLOGY_PATH,
    WALL_BY_POOL,
    WALL_LAYER_LABELS,
    comparisonDual,
    topologyIsLive,
    wallLayerFlex,
} from "./pools";
import type { PoolId, TopologyNodeId } from "./pools";

const POOL_SWITCH: { id: PoolId; label: string }[] = [
    { id: "cold", label: "Cold" },
    { id: "warm", label: "Warm" },
    { id: "hot", label: "Hot" },
];

const EDGE_PATH: Record<string, string> = {
    "jenkins-hub": "M 18 28 C 18 8, 62 8, 62 18",
    "jenkins-pool": "M 22 40 L 32 22",
    "pool-hub": "M 45 22 L 55 22",
    "pool-hot": "M 37.5 32 L 37.5 62",
    "hub-warm": "M 62.5 32 L 62.5 62",
    "hub-docker": "M 72 28 L 87.5 62",
    "hub-ui": "M 70 22 L 80 22",
};

type Props = {
    pool: PoolId;
    onPoolChange: (pool: PoolId) => void;
};

function nodeById(id: TopologyNodeId) {
    return TOPOLOGY_NODES.find((node) => node.id === id);
}

const PoolDiagrams = ({ pool, onPoolChange }: Props) => {
    const [focus, setFocus] = useState<TopologyNodeId | null>(null);
    const caption = focus ? nodeById(focus)?.caption(pool) : undefined;
    const oneRun = ONE_RUN_ROWS.find((row) => row.pool.toLowerCase() === pool);
    const wall = WALL_BY_POOL[pool];
    const gitNote = pool === "hot" ? comparisonDual("Where the test code comes from", "hot") : undefined;

    return (
        <section className="docs__diagrams" data-testid="docs-diagrams">
            <div
                className="docs-pool-switch"
                data-testid="docs-pool-select"
                role="radiogroup"
                aria-label="Selected pool"
            >
                {POOL_SWITCH.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={pool === item.id}
                        className={pool === item.id ? "docs-pool-switch__btn is-selected" : "docs-pool-switch__btn"}
                        data-pool={item.id}
                        data-testid={`docs-pool-select-${item.id}`}
                        onClick={() => onPoolChange(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <p className="docs__hint">{GLOSSARY_LINE}</p>

            <div className="docs-diagram" data-testid="docs-diagram-topology" data-pool={pool}>
                <h2>Topology</h2>
                <p className="docs-diagram__path">{TOPOLOGY_PATH[pool]}</p>
                <div className="docs-topo-wrap">
                    <div className="docs-topo">
                        <svg
                            className="docs-topo__edges"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {TOPOLOGY_EDGES.map((edge) => {
                                const live = edge.live.includes(pool);
                                const key = `${edge.from}-${edge.to}`;
                                return (
                                    <path
                                        key={key}
                                        d={EDGE_PATH[key]}
                                        className={
                                            live
                                                ? "docs-topo__edge is-live"
                                                : edge.dashed
                                                ? "docs-topo__edge is-watch"
                                                : "docs-topo__edge is-dim"
                                        }
                                        data-testid={`docs-topo-edge-${key}`}
                                        data-live={live ? "true" : "false"}
                                        fill="none"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                        </svg>
                        <div className="docs-topo__grid">
                            {TOPOLOGY_NODES.map((node) => {
                                const live = topologyIsLive(pool, node.id);
                                const selected = focus === node.id;
                                const watch = node.id === "ui";
                                return (
                                    <button
                                        key={node.id}
                                        type="button"
                                        className={
                                            "docs-topo__node" +
                                            (watch ? " is-watch" : live ? " is-live" : " is-dim") +
                                            (selected ? " is-focus" : "") +
                                            ` docs-topo__node--${node.id}`
                                        }
                                        data-testid={`docs-topo-node-${node.id}`}
                                        data-live={live ? "true" : "false"}
                                        aria-pressed={selected}
                                        onClick={() => setFocus(node.id)}
                                    >
                                        <span className="docs-topo__title">{node.title}</span>
                                        {node.lines.map((line) => (
                                            <span key={line} className="docs-topo__line">
                                                {line}
                                            </span>
                                        ))}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <p className="docs-diagram__caption" data-testid="docs-diagram-caption">
                    {caption ? caption.human : ""}
                </p>
            </div>

            <div className="docs-diagram" data-testid="docs-diagram-sequence" data-pool={pool}>
                <h2>One run</h2>
                <ol className="docs-seq">
                    {SEQUENCE_STEPS[pool].map((step, index) => (
                        <li key={step} className="docs-seq__step" data-testid={`docs-seq-step-${index + 1}`}>
                            <span className="docs-seq__n">{index + 1}</span>
                            <span className="docs-seq__text">{step}</span>
                        </li>
                    ))}
                </ol>
                {oneRun ? <p className="docs-diagram__caption">{oneRun.cell.human}</p> : null}
                {gitNote ? (
                    <p className="docs-diagram__note" data-testid="docs-seq-git-note">
                        {gitNote.human}
                    </p>
                ) : null}
            </div>

            <div className="docs-diagram" data-testid="docs-diagram-wall" data-pool={pool}>
                <h2>Where the wall goes</h2>
                <p className="docs-wall__total">
                    {wall.totalLabel}
                    {wall.pin ? ` · ${wall.pin}` : ""}
                </p>
                <div className="docs-wall" role="img" aria-label={`Wall time ${wall.totalLabel}`}>
                    {wall.layers.map((layer) => (
                        <div
                            key={layer.id}
                            className="docs-wall__layer"
                            data-layer={layer.id}
                            data-testid={`docs-wall-layer-${layer.id}`}
                            style={{ flexGrow: wallLayerFlex(pool, layer), flexBasis: 0 }}
                        >
                            <span className="docs-wall__name">{WALL_LAYER_LABELS[layer.id]}</span>
                            {layer.pin ? <span className="docs-wall__pin">{layer.pin}</span> : null}
                        </div>
                    ))}
                </div>
                <p className="docs-diagram__caption">{comparisonDual("Where the time goes", pool).human}</p>
            </div>
        </section>
    );
};

export default PoolDiagrams;
