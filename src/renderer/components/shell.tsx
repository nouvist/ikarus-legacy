import { ComponentProps } from "react";
import styled, { createGlobalStyle } from "styled-components";
import font from "~/renderer/assets/fonts/space_grotesk/SpaceGrotesk-VariableFont_wght.ttf";
import "normalize.css/normalize.css";

export interface ShellProps extends ComponentProps<"div"> {}

export default function Shell({ children, ...props }: ShellProps) {
  return (
    <Container {...props}>
      <GlobalStyle />
      {children}
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "SpaceGrotesk";
    src: url(${font}) format("truetype");
  }

  html {
    user-select: none;
    font-family: "SpaceGrotesk", sans-serif;
    background: ${(p) => p.theme.background.e0};
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
  }
`;
