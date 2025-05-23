import { PropsWithChildren } from "react";
import { ThemeProvider } from "styled-components";

export interface ThemeData {
  background: {
    e0: string;
    e1: string;
  };
  foreground: {
    e0: string;
    e1: string;
  };
  accent: {
    primary: string;
    danger: string;
  };
  elevation: {
    solid: string;
    t1: string;
    t2: string;
    t3: string;
  };
}

export interface ThemeProps extends PropsWithChildren {}

export default function Theme({ children }: ThemeProps) {
  const theme: ThemeData = {
    background: {
      e0: "#181818",
      e1: "#1f1f1f",
    },
    foreground: {
      e0: "#ffffff",
      e1: "#818181",
    },
    accent: {
      primary: "#482ab8",
      danger: "#b82a2c",
    },
    elevation: {
      solid: "#2b2b2b",
      t1: "#e7e7e707",
      t2: "#e7e7e70f",
      t3: "#e7e7e719",
    },
  };
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

declare module "styled-components" {
  export interface DefaultTheme extends ThemeData {}
}
