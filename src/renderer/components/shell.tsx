import { ComponentProps, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import removeSplash from "~/renderer/foundations/remove_splash";

import "normalize.css/normalize.css";
import "~/renderer/assets/css/fonts.css";

export interface ShellProps extends ComponentProps<"div"> {}

export default function Shell({ children, ...props }: ShellProps) {
  useEffect(removeSplash, []);

  return (
    <_Container {...props}>
      <_GlobalStyle />
      {children}
    </_Container>
  );
}

const _Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const _GlobalStyle = createGlobalStyle`
  html {
    user-select: none;
    font-family: "SpaceGrotesk", sans-serif;
    /* background: ${(p) => p.theme.background.e0}; */
    color: ${(p) => p.theme.foreground.e0};
  }

  html, body, #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    user-select: none;
    -webkit-user-drag: none;
  }

  button, input {
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    background: inherit;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    min-width: 0;
    appearance: none;
    &:focus {
      outline: none;
    }
  }

  * {
    box-sizing: border-box;
    &::selection {
      background: ${(p) => p.theme.accent.primary};
    }
  }

  *[hidden] {
    display: none !important;
  }
`;
