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
   * Driver+Remote : terminal — canon configurator__layout--terminal 6-col ladder
   * (docs/layout-standard.md § Configurator terminal shell). Full-bleed: no 5% side pad.
   * Column heights independent — no align-items:stretch magnet between setup & terminal.
   */
  .capabilities-body {
    display: grid;
    align-items: start;
    gap: 20px 24px;
    width: 100%;
    padding: 20px 16px 40px;
    box-sizing: border-box;
  }

  .setup,
  .code-panel {
    grid-column: auto;
    min-width: 0;
    align-self: start;
  }

  /* ≥1600 — cols 2–3 cfg / 4–6 term */
  @media (min-width: 1600px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 3fr);
    }
    .setup { grid-column: 2; }
    .code-panel { grid-column: 3; }
  }

  @media (min-width: 1280px) and (max-width: 1599px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 2fr);
    }
    .setup { grid-column: 2; }
    .code-panel { grid-column: 3; }
  }

  @media (min-width: 1100px) and (max-width: 1279px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 2fr) minmax(0, 2fr);
    }
  }

  @media (min-width: 900px) and (max-width: 1099px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }
  }

  @media (min-width: 769px) and (max-width: 899px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }

  .setup {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;

    /* Content height only — do not flex-grow panel chrome to match terminal. */
    .panel {
      flex: 0 1 auto;
    }

    button.new-session,
    button.new-session-more-capabilities {
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
    gap: 12px;
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

  .new-session-more-capabilities {
    background: none;
    border: none;
    color: ${grayColor};
    text-align: left;
    padding: 0;
    margin-top: 8px;
  }
  
  textarea.more-capabilities {
    border: 1px solid ${unselectedColor};
    border-radius: 3px;
    background-color: ${borderSectionColor};
    color: ${selectedColor};
    font-size: 13px;
    font-family: "Source Code Pro",Menlo,Monaco,Consolas,"Courier New",monospace;
    outline: none;
    padding: 5px;
    resize: vertical;
    width: 100%;
    box-sizing: border-box;
    margin-top: 10px;
    
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
