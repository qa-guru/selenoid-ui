import styled from "styled-components";

const borderLangsColor = "#3d444c";
const borderSectionColor = "#353b42";
const unselectedColor = "#376e52";
const selectedColor = "#59a781";
const errorColor = "#ff6e59";
const grayColor = "#666";

const selectBgColor = "#30363C";

export const StyledCapabilities = styled.div`
  width: 100%;
  display: block;
  position: relative;

  .section-title {
    color: ${grayColor};
    position: relative;
    top: 0;
    left: 0;
    padding-left: 5%;
    border-bottom: 1px solid ${borderSectionColor};
    width: 95%;
    letter-spacing: 1px;
    font-size: 10px;
    line-height: 20px;
  }

  .capabilities-body {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    padding: 20px 5% 40px;
    box-sizing: border-box;
  }

    .setup {
    width: 250px;
    flex: 0 0 250px;
    margin-right: 30px;

    .capabilities-launch-actions {
      width: 100%;
    }

    .capabilities-launch-actions .btn {
      width: 100%;
      margin-top: 10px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .new-session-more-capabilities {
      width: 100%;
      margin-top: 8px;
      text-align: left;
      justify-content: flex-start;
      padding-left: 0;
      color: ${grayColor};
    }
    
    
    .Select-control {
    background-color: inherit;
    border-radius: 0;
    border: none;
    color: #fff;
    height: 30px;

    &:hover {
      box-shadow: none;
    }

    & .Select-input {
      outline: none;

      input {
        color: #fff;
      }
    }
  }

    .has-value.Select--single > .Select-control .Select-value .Select-value-label,
    .has-value.is-pseudo-focused.Select--single > .Select-control .Select-value .Select-value-label {
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  
    .Select-menu-outer {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      background-color: inherit;
      border: 0;
      box-shadow: none;
    }
  
    .Select-option {
      background-color: ${selectBgColor};
      color: #ccc;
      text-transform: uppercase;
    }
    .Select-option:last-child {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
    .Select-option.is-selected {
      background-color: ${selectBgColor};
      color: ${selectedColor};
    }
    .Select-option.is-focused {
      background-color: ${selectBgColor};
      color: ${selectedColor};
    }
  
  }

  .code-panel {
    flex: 1 1 auto;
    min-width: 420px;
    max-width: 720px;
    margin: 0 30px 0 10px;
    overflow: hidden;

    pre {
      min-height: 320px;
      margin: 0;
      max-width: 100%;
      overflow: hidden;
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

  .lang-selector {
    flex: 0 0 auto;
    margin-left: auto;
    margin-top: 0;
  }

  .capabilities-langs {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
  }

  .capabilities-lang {
    color: #fff;
    padding: 10px;
    text-transform: capitalize;
    line-height: 20px;
    border-left: 3px solid ${borderLangsColor};
    cursor: pointer;
    transition: border-color 0.2s ease-out 0s;
    min-width: 80px;

    &_active {
      border-left-color: ${selectedColor};
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

    &:hover {
      border-color: ${selectedColor};
      background-color: ${borderLangsColor};
    }

    &.disabled-true {
      border-color: ${borderLangsColor};
      background-color: ${borderLangsColor};
      color: ${grayColor};

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
