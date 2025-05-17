import { Fragment } from "react/jsx-runtime";
import font from "~/assets/fonts/space_grotesk/SpaceGrotesk-VariableFont_wght.ttf";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "SpaceGrotesk";
    src: url(${font}) format("truetype");
  }

  html {
    user-select: none;
    font-family: "SpaceGrotesk", sans-serif;
  }

  html,
  body {
    height: 100%;
  }

  #root {
    height: 100%;
  }
`;

export default function Shell() {
  return (
    <Fragment>
      <GlobalStyle />
      <webview
        ref={(el) => {
          console.log(el);
        }}
        src="https://github.com"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </Fragment>
  );
}
