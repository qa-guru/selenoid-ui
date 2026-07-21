import styled from "styled-components";

const borderLangsColor = "#3d444c";
const borderSectionColor = "#353b42";
const unselectedColor = "#376e52";
const selectedColor = "#59a781";
const errorColor = "#ff6e59";
const grayColor = "#666";

export const StyledCapabilities = styled.div`
  width: 100%;
  display: block;
  position: relative;

  /*
   * SSOT copy of configurator__layout--terminal (docs/layout-standard.md).
   * Mental 6-col: 1░ + cfg 2–3 + term 4–6. ░ = padding-left, NOT a track.
   * Tracks ALWAYS cfg | term — one formula ≥769 via clamp. No 1100/1280/1600
   * track rebuilds. No 1fr 2fr 2fr. No discrete ratio stages.
   */
  .capabilities-body {
    display: grid;
    align-items: start;
    justify-content: start;
    /* Same gap cfg↔term as Driver↔Remote hub (.setup gap) */
    --capabilities-gap: var(--space-3, 12px);
    column-gap: var(--capabilities-gap);
    row-gap: var(--capabilities-gap);
    width: 100%;
    box-sizing: border-box;
    padding: 20px var(--page-padding-x, 16px) 40px;
    --capabilities-col-rest: calc(
      (1600px - 2 * var(--page-padding-x, 16px) - 5 * var(--capabilities-gap)) / 6
    );
    --capabilities-span-2: calc(
      2 * var(--capabilities-col-rest) + var(--capabilities-gap)
    );
  }

  .setup,
  .code-panel {
    grid-column: auto;
    min-width: 0;
    align-self: start;
  }

  @media (min-width: 769px) {
    .capabilities-body {
      /*
       * Body sits full-bleed (page-pad is our own padding). Configurator's
       * layout 100% is already inside page-shell pad — subtract pads here so
       * the 6-col math matches SSOT.
       */
      --capabilities-gutter: clamp(
        0px,
        calc(
          100% - 2 * var(--page-padding-x, 16px) - 2 * var(--capabilities-span-2) -
            2 * var(--capabilities-gap)
        ),
        var(--capabilities-col-rest)
      );
      --capabilities-gutter-gap: min(
        var(--capabilities-gap),
        var(--capabilities-gutter)
      );
      padding-left: calc(
        var(--page-padding-x, 16px) + var(--capabilities-gutter) +
          var(--capabilities-gutter-gap)
      );
      --capabilities-cfg: clamp(
        var(--capabilities-col-rest),
        calc(100% - var(--capabilities-span-2) - var(--capabilities-gap)),
        var(--capabilities-span-2)
      );
      --capabilities-term: calc(
        100% - var(--capabilities-cfg) - var(--capabilities-gap)
      );
      grid-template-columns: var(--capabilities-cfg) var(--capabilities-term);
    }

    .setup {
      grid-column: 1 / 2;
    }

    .code-panel {
      grid-column: 2 / 3;
    }
  }

  .setup {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--capabilities-gap, var(--space-3, 12px));

    /* Content height only — do not flex-grow panel chrome to match terminal. */
    .panel {
      flex: 0 1 auto;
    }

    button.new-session {
      width: 100%;
      margin-top: 10px;
      cursor: pointer;
    }
  }

  .capabilities-config-panel {
    width: 100%;
    min-width: 0;
  }

  .capabilities-launch {
    display: flex;
    flex-direction: column;
    gap: var(--capabilities-gap, var(--space-3, 12px));
  }

  .code-panel {
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .panel {
      flex: 0 1 auto;
    }

    .capabilities-terminal-body {
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 320px;
    }

    .panel__code {
      flex: 0 1 auto;
      min-height: 320px;
      margin: 0;
      max-width: 100%;
    }

    .capabilities-vector-input {
      box-sizing: border-box;
      width: auto;
      min-width: 7.5rem;
      max-width: 14rem;
      height: 20px;
      margin: 0;
      padding: 0 8px;
      border: 1px solid rgba(89, 167, 129, 0.45);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1;
      color: inherit;
      outline: none;
      cursor: text;
      field-sizing: content;
    }

    .capabilities-vector-input:hover,
    .capabilities-vector-input:focus {
      border-color: rgba(89, 167, 129, 0.75);
      background: rgba(89, 167, 129, 0.28);
    }

    .capabilities-vector-input:focus {
      box-shadow: 0 0 0 1px rgba(89, 167, 129, 0.4);
    }

    .capabilities-vector-input--miss {
      border-color: rgba(255, 110, 89, 0.7);
      background: rgba(255, 110, 89, 0.22);
      color: #ffb3a8;
    }

    pre,
    pre code,
    pre code.hljs,
    pre .hljs {
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      overflow-x: hidden;
      max-width: 100%;
      box-sizing: border-box;
    }
  }

  @media (max-width: 768px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .new-session {
    height: 2rem;
    border: 1px solid ${unselectedColor};
    border-radius: 3px;
    background-color: ${borderSectionColor};
    color: ${selectedColor};
    text-transform: uppercase;
    font-size: 1.1em;
    outline: none;
    opacity: 1;

    &:hover {
      border-color: ${selectedColor};
      background-color: ${borderLangsColor};
    }

    &:disabled,
    &.disabled-true {
      border-color: ${borderLangsColor};
      background-color: ${borderLangsColor};
      color: ${grayColor};
      opacity: 1;
      -webkit-text-fill-color: ${grayColor};

      &:hover {
        border-color: ${borderLangsColor};
        cursor: default;
      }
    }

    &.error-true {
      border-color: ${errorColor};
      color: ${errorColor};
    }
  }

}

pre.hljs, code.hljs {
  font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: inherit;
}
`;
