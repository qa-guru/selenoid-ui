import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
html,
body {
  margin: 0;
  padding: 0;
  width: 100%; //fallback
  width: 100vw;
  height: 100%; //fallback
  height: 100vh;
  min-height: 100vh;
  min-width: 100vw;
  overflow: auto;
}

body {
  font-size: var(--font-size-base, 14px);
  font-family: var(--font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
  margin: 0 auto;
  background: var(--color-surface, #30363c);
  color: var(--color-text, #fff);
  /* Offset content below the fixed canonical header (#app-header / header.css). */
  padding-top: var(--header-occupied-height, var(--header-height, 40px));
}
`;

/* Content shell below the fixed header: positioned containing block for
   VNC/app fullscreen (`position: absolute; inset: 0` fills this box). */
export const StyledViewport = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--header-occupied-height, var(--header-height, 40px)));
`;
