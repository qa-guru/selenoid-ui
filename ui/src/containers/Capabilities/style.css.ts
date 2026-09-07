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
   * Full-bleed 1 : 1 : 2 (image | session+mobile+proxy | terminal).
   * No empty first-column gutter. One desktop media (769). No 1100/1280/1600
   * track rebuilds. No selected image → collapse to 1 : 2.
   */
  .capabilities-body {
    display: grid;
    align-items: start;
    justify-content: stretch;
    --capabilities-gap: var(--space-3, 12px);
    column-gap: var(--capabilities-gap);
    row-gap: var(--capabilities-gap);
    width: 100%;
    box-sizing: border-box;
    padding: 20px var(--page-padding-x, 16px) 40px;
  }

  .setup,
  .setup-side,
  .code-panel {
    grid-column: auto;
    min-width: 0;
    align-self: start;
  }

  @media (min-width: 769px) {
    /*
     * Independent column scrollports (layout-standard § Scrollports).
     * Lock this page to the viewport below the header — not html/body
     * (other routes still page-scroll). Config column scrolls as one stack
     * (panels keep content height). Terminal chrome stays put; .panel__code
     * / foot rail scroll.
     */
    height: calc(100vh - var(--header-occupied-height, var(--header-height, 40px)));
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .capabilities-body {
      padding-bottom: 20px;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
      grid-template-rows: minmax(0, 1fr);
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      align-items: stretch;
    }

    .capabilities-body:not(:has(.setup-side)) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }

    .setup,
    .setup-side {
      align-self: stretch;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: thin;
      overscroll-behavior: contain;

      .panel {
        flex: 0 0 auto;
        min-height: auto;
      }

      .panel__body {
        overflow: visible;
      }

      .capabilities-launch {
        flex: 0 0 auto;
        min-height: auto;
        overflow: visible;
      }
    }

    .setup {
      grid-column: 1 / 2;
    }

    .setup-side {
      grid-column: 2 / 3;
    }

    .capabilities-body:not(:has(.setup-side)) .code-panel {
      grid-column: 2 / 3;
    }

    .code-panel {
      grid-column: 3 / 4;
      align-self: stretch;
      min-height: 0;
      overflow: hidden;

      .panel {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 100%;
      }

      .capabilities-terminal-body {
        min-height: 0;
      }

      .panel__code {
        flex: 1 1 auto;
        min-height: 0;
        overscroll-behavior: contain;
      }
    }
  }

  .setup,
  .setup-side {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--capabilities-gap, var(--space-3, 12px));

    /* Content height only — do not flex-grow panel chrome to match terminal. */
    .panel {
      flex: 0 0 auto;
    }
  }

  .setup {
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

  .capabilities-config-panel--placeholder {
    opacity: 0.75;
  }

  .capabilities-ios-placeholder {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 2px;
  }

  .capabilities-ios-placeholder__title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: ${selectedColor};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .capabilities-ios-placeholder__hint {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: ${grayColor};
  }

  .capabilities-mobile-hint {
    margin: 0;
    padding: 0 2px;
    font-size: 12px;
    line-height: 1.4;
    color: ${grayColor};
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

    .capabilities-terminal-body {
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .panel__code {
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
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }
  }

  @media (max-width: 768px) {
    .capabilities-body {
      grid-template-columns: minmax(0, 1fr);
    }

    .code-panel {
      .panel {
        flex: 0 1 auto;
      }

      .capabilities-terminal-body {
        min-height: 320px;
      }

      .panel__code {
        flex: 0 1 auto;
        min-height: 320px;
      }
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
