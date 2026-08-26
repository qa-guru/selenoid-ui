import styled from "styled-components";

export const StyledDocs = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 20px var(--page-padding-x, 16px) 40px;
    color: var(--color-text, #fff);
    display: grid;
    grid-template-columns: 12.5em minmax(0, 1fr);
    gap: 28px;
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .docs__toc {
        position: sticky;
        top: 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 0;
    }

    @media (max-width: 768px) {
        .docs__toc {
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
        }
    }

    .docs__toc-link {
        color: var(--color-text-muted, #aaa);
        text-decoration: none;
        font-size: 0.9em;
        font-weight: 300;
        padding: 6px 10px;
        border-left: 3px solid transparent;
        border-radius: 0 4px 4px 0;
    }

    .docs__toc-link:hover,
    .docs__toc-link.is-active {
        color: var(--color-text, #fff);
    }

    .docs__toc-link.is-active {
        border-left-color: var(--color-info, #5b9fd6);
        background: var(--color-surface, #2a3038);
    }

    @media (max-width: 768px) {
        .docs__toc-link {
            border-left: none;
            border-bottom: 3px solid transparent;
            border-radius: 4px;
        }

        .docs__toc-link.is-active {
            border-bottom-color: var(--color-info, #5b9fd6);
        }
    }

    .docs__article {
        min-width: 0;
    }

    h1 {
        margin: 0 0 8px;
        font-size: 1.35em;
        font-weight: 400;
    }

    .docs__lead,
    .docs__meta,
    .docs__hint,
    .docs__footnote {
        margin: 0 0 12px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.9em;
        font-weight: 300;
        max-width: 72ch;
    }

    .docs__meta,
    .docs__hint,
    .docs__footnote {
        font-size: 0.8em;
    }

    .docs__hint {
        margin: 0 0 10px;
        max-width: 72ch;
    }

    .docs__stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin: 16px 0 20px;
    }

    @media (max-width: 768px) {
        .docs__stats {
            grid-template-columns: 1fr;
        }
    }

    .docs__stat {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        padding: 12px 14px;
        background: var(--color-surface, #2a3038);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        width: 100%;
    }

    .docs__stat--static {
        cursor: default;
    }

    .docs-seq__body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .docs__stat.is-selected {
        border-color: var(--color-info, #5b9fd6);
        box-shadow: inset 0 0 0 1px var(--color-info, #5b9fd6);
    }

    .docs__stat-value {
        display: block;
        font-size: 1.35em;
        font-variant-numeric: tabular-nums;
        font-weight: 400;
        margin-bottom: 4px;
    }

    .docs__stat[data-tone="success"] .docs__stat-value {
        color: var(--color-success, #59a781);
    }

    .docs__stat-label {
        display: block;
        color: var(--color-text-muted, #aaa);
        font-size: 0.8em;
        font-weight: 300;
    }

    .docs__callout {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-left: 3px solid var(--color-info, #5b9fd6);
        border-radius: 4px;
        padding: 12px 14px;
        margin: 0 0 24px;
        background: var(--color-surface, #2a3038);
        max-width: 88ch;
    }

    .docs__callout h2 {
        margin: 0 0 6px;
        font-size: 0.95em;
        font-weight: 400;
    }

    .docs__callout p {
        margin: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.85em;
        font-weight: 300;
    }

    .docs__section {
        margin-bottom: 28px;
    }

    .docs__section h2 {
        margin: 0 0 10px;
        font-size: 1.05em;
        font-weight: 400;
    }

    .docs__scroll {
        width: 100%;
        overflow-x: auto;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
    }

    table.docs__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82em;
        min-width: 720px;
    }

    table.docs__table--run {
        min-width: 480px;
    }

    table.docs__table th,
    table.docs__table td {
        padding: 10px 12px;
        border-bottom: 1px dashed var(--color-border-strong, #555f6a);
        text-align: left;
        vertical-align: top;
    }

    table.docs__table th {
        background: var(--color-surface, #1e242c);
        color: var(--color-text-muted, #aaa);
        font-weight: 400;
    }

    table.docs__table thead th {
        position: sticky;
        top: 0;
        z-index: 2;
    }

    table.docs__table tbody th,
    table.docs__table tbody td:first-child {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--color-surface, #1e242c);
        font-weight: 400;
        white-space: nowrap;
        min-width: 11em;
    }

    table.docs__table thead th:first-child {
        z-index: 3;
        left: 0;
    }

    table.docs__table td {
        font-weight: 300;
        min-width: 16em;
    }

    table.docs__table--links {
        width: 100%;
        min-width: 0;
    }

    table.docs__table--links tbody th,
    table.docs__table--links tbody td,
    table.docs__table--links thead th {
        position: static;
        left: auto;
        min-width: 0;
        white-space: nowrap;
    }

    table.docs__table--links tbody td:last-child {
        white-space: normal;
        width: 100%;
    }

    table.docs__table--links tbody td:first-child {
        background: transparent;
        font-weight: 300;
    }

    table.docs__table--links tbody th {
        color: var(--color-text, #fff);
        background: transparent;
        font-weight: 400;
    }

    table.docs__table--images tbody td,
    table.docs__table--images thead th {
        min-width: 0;
    }

    table.docs__table--images tbody td:nth-child(3) {
        white-space: normal;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.92em;
    }

    table.docs__table--images a code {
        color: inherit;
    }

    table.docs__table--sources tbody th,
    table.docs__table--sources tbody td,
    table.docs__table--sources thead th {
        white-space: normal;
    }

    table.docs__table--sources tbody td:nth-child(2) {
        text-align: center;
        vertical-align: middle;
        white-space: nowrap;
        width: 4.5em;
    }

    .docs-catalog__links {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .docs-catalog__links a {
        word-break: break-all;
    }

    table.docs__table--links .docs-resource__empty {
        color: var(--color-text-muted, #aaa);
    }

    table.docs__table--links thead th {
        position: sticky;
        top: 0;
        z-index: 2;
    }

    table.docs__table--links .docs-resource__kind {
        color: var(--color-text-muted, #aaa);
        font-weight: 300;
        background: transparent;
    }

    table.docs__table--links a {
        color: var(--color-success, #59a781);
        text-decoration: none;
        font-weight: 400;
    }

    table.docs__table--links a:hover {
        text-decoration: underline;
    }

    .docs__lead a,
    .docs__meta a,
    .docs__hint a {
        color: var(--color-success, #59a781);
        text-decoration: none;
    }

    .docs__lead a:hover,
    .docs__meta a:hover,
    .docs__hint a:hover {
        text-decoration: underline;
    }

    .docs__lead code,
    .docs__meta code,
    .docs__hint code,
    .docs__callout code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.92em;
    }

    table.docs__table--marks {
        min-width: 560px;
    }

    table.docs__table--marks thead th:not(:first-child),
    table.docs__table--marks tbody td {
        text-align: center;
        vertical-align: middle;
        min-width: 5.5em;
        width: 6.5em;
    }

    table.docs__table--marks tbody th {
        white-space: normal;
        min-width: 22em;
    }

    .docs-feature__label {
        display: block;
        font-weight: 400;
        color: var(--color-text, #fff);
    }

    .docs-feature__detail {
        display: block;
        margin-top: 4px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.92em;
        font-weight: 300;
    }

    .docs-mark {
        font-size: 1.15em;
        line-height: 1;
    }

    .docs-mark--yes {
        color: var(--color-success, #59a781);
        font-weight: 500;
    }

    .docs-mark--no {
        color: var(--color-text-muted, #888);
    }

    .docs-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .docs-cell__human {
        margin: 0;
        font-weight: 400;
        color: var(--color-text, #fff);
    }

    .docs-cell__tech {
        margin: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.92em;
        font-weight: 300;
    }

    .docs-pipeline {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 88ch;
    }

    .docs-pipeline__item {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        padding: 12px 14px;
        background: var(--color-surface, #2a3038);
    }

    .docs-pipeline__item h3 {
        margin: 0 0 6px;
        font-size: 0.92em;
        font-weight: 400;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    .docs-pipeline__item h3 a {
        color: var(--color-success, #59a781);
        text-decoration: none;
    }

    .docs-pipeline__item h3 a:hover {
        text-decoration: underline;
    }

    .docs-pipeline__item .docs-cell__human {
        margin-bottom: 4px;
    }

    .docs-excerpt {
        margin: 10px 0 0;
        padding: 10px 12px;
        overflow-x: auto;
        border-radius: 4px;
        background: var(--color-surface, #1e242c);
        color: var(--color-text, #d7dde5);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.75em;
        font-weight: 400;
        line-height: 1.45;
        white-space: pre;
    }

    .docs-excerpt code {
        font: inherit;
    }

    .docs__diagrams {
        margin: 0 0 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .docs-pool-switch {
        display: inline-flex;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        overflow: hidden;
        align-self: start;
    }

    .docs-pool-switch__btn {
        background: var(--color-surface, #2a3038);
        color: var(--color-text-muted, #aaa);
        border: none;
        border-right: 1px solid var(--color-border-strong, #555f6a);
        padding: 8px 16px;
        font: inherit;
        font-size: 0.9em;
        cursor: pointer;
    }

    .docs-pool-switch__btn:last-child {
        border-right: none;
    }

    .docs-pool-switch__btn.is-selected {
        color: var(--color-text, #fff);
        background: var(--color-surface, #1e242c);
        box-shadow: inset 0 -2px 0 var(--color-info, #5b9fd6);
    }

    .docs-pool-switch__btn[data-pool="hot"].is-selected {
        box-shadow: inset 0 -2px 0 var(--color-success, #59a781);
        color: var(--color-success, #59a781);
    }

    .docs-diagram {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        padding: 12px 14px 14px;
        background: var(--color-surface, #2a3038);
        overflow-x: auto;
    }

    .docs-diagram h2 {
        margin: 0 0 8px;
        font-size: 1.05em;
        font-weight: 400;
    }

    .docs-diagram__path,
    .docs-diagram__caption,
    .docs-diagram__note {
        margin: 8px 0 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.8em;
        font-weight: 300;
        max-width: 72ch;
    }

    .docs-diagram__path {
        margin: 0 0 10px;
        color: var(--color-text, #fff);
        font-weight: 400;
    }

    .docs-diagram__caption:empty {
        display: none;
    }

    .docs-topo-wrap {
        overflow-x: auto;
    }

    .docs-topo {
        position: relative;
        min-width: 720px;
    }

    .docs-topo__edges {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
    }

    .docs-topo__edge {
        stroke: var(--color-text-muted, #555);
        stroke-width: 1.5;
        opacity: 0.35;
    }

    .docs-topo__edge.is-live {
        stroke: var(--color-info, #5b9fd6);
        stroke-width: 2.5;
        opacity: 1;
    }

    .docs-topo__edge.is-watch {
        stroke: var(--color-text-muted, #888);
        stroke-dasharray: 4 3;
        opacity: 0.55;
    }

    .docs-topo__grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(10em, 1fr) minmax(11em, 1.1fr) minmax(12em, 1.3fr) minmax(10em, 1fr);
        grid-template-rows: auto auto;
        gap: 28px 14px;
    }

    .docs-topo__node {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        margin: 0;
        padding: 10px 12px;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        background: var(--color-surface, #1e242c);
        color: var(--color-text, #fff);
        font: inherit;
        text-align: left;
        cursor: pointer;
        min-height: 4.5em;
    }

    .docs-topo__node.is-live {
        border-color: var(--color-info, #5b9fd6);
        box-shadow: inset 0 0 0 1px var(--color-info, #5b9fd6);
        opacity: 1;
    }

    .docs-topo__node.is-dim {
        opacity: 0.38;
    }

    .docs-topo__node.is-watch {
        opacity: 0.72;
        border-style: dashed;
    }

    .docs-topo__node.is-focus {
        outline: 1px solid var(--color-text, #fff);
        outline-offset: 1px;
    }

    .docs-topo__node--jenkins {
        grid-column: 1;
        grid-row: 1 / span 2;
    }

    .docs-topo__node--pool {
        grid-column: 2;
        grid-row: 1;
    }

    .docs-topo__node--hub {
        grid-column: 3;
        grid-row: 1;
    }

    .docs-topo__node--ui {
        grid-column: 4;
        grid-row: 1;
    }

    .docs-topo__node--hot {
        grid-column: 2;
        grid-row: 2;
    }

    .docs-topo__node--warm {
        grid-column: 3;
        grid-row: 2;
    }

    .docs-topo__node--docker {
        grid-column: 4;
        grid-row: 2;
    }

    .docs-topo__title {
        font-weight: 400;
        font-size: 0.88em;
    }

    .docs-topo__line {
        color: var(--color-text-muted, #aaa);
        font-size: 0.75em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
    }

    .docs-seq {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .docs-seq__step {
        display: flex;
        align-items: baseline;
        gap: 10px;
        color: var(--color-text, #fff);
        font-size: 0.9em;
        font-weight: 400;
    }

    .docs-seq__n {
        flex: 0 0 1.6em;
        height: 1.6em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--color-info, #5b9fd6);
        color: var(--color-info, #5b9fd6);
        font-size: 0.75em;
        font-variant-numeric: tabular-nums;
    }

    .docs-seq__text {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.85em;
        font-weight: 400;
    }

    .docs-wall__total {
        margin: 0 0 10px;
        font-size: 1.15em;
        font-variant-numeric: tabular-nums;
        font-weight: 400;
    }

    .docs-wall {
        display: flex;
        flex-direction: column;
        min-height: 160px;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        overflow: hidden;
    }

    .docs-wall__layer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        min-height: 2.2em;
        border-bottom: 1px solid var(--color-border-strong, #555f6a);
        background: var(--color-surface, #1e242c);
        color: var(--color-text, #fff);
        font-size: 0.85em;
    }

    .docs-wall__layer:last-child {
        border-bottom: none;
    }

    .docs-wall__layer[data-layer="docker-run"] {
        background: color-mix(in srgb, var(--color-info, #5b9fd6) 18%, var(--color-surface, #1e242c));
    }

    .docs-wall__layer[data-layer="new-session"] {
        background: color-mix(in srgb, var(--color-info, #5b9fd6) 12%, var(--color-surface, #1e242c));
    }

    .docs-wall__layer[data-layer="gradle"] {
        background: color-mix(in srgb, var(--color-text-muted, #aaa) 16%, var(--color-surface, #1e242c));
    }

    .docs-wall__layer[data-layer="login"] {
        background: color-mix(in srgb, var(--color-success, #59a781) 16%, var(--color-surface, #1e242c));
    }

    .docs-wall__layer[data-layer="jenkins-shell"] {
        background: color-mix(in srgb, var(--color-text-muted, #aaa) 22%, var(--color-surface, #1e242c));
    }

    .docs-wall__name {
        font-weight: 400;
    }

    .docs-wall__pin {
        color: var(--color-text-muted, #aaa);
        font-variant-numeric: tabular-nums;
        font-weight: 300;
        white-space: nowrap;
    }
`;
