import { PropsWithChildren } from "react";
import { ThemeProvider } from "styled-components";
import { useDarkMode } from "~/shared/react";

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
    t1: string;
    t2: string;
    t3: string;
  };
}

export interface ThemeProps extends PropsWithChildren {}

export default function Theme({ children }: ThemeProps) {
  const isDarkMode = useDarkMode();

  const darkTheme: ThemeData = {
    background: {
      e0: "#181818",
      e1: "#1f1f1f",
    },
    foreground: {
      e0: "#ffffff",
      e1: "#818181",
    },
    accent: {
      primary: "#2a34bd",
      danger: "#c22528",
    },
    elevation: {
      t1: "#ffffff07",
      t2: "#ffffff0f",
      t3: "#ffffff19",
    },
  };

  const lightTheme: ThemeData = {
    background: {
      e0: "#ffffff",
      e1: "#f0f0f0",
    },
    foreground: {
      e0: "#000000",
      e1: "#404040",
    },
    accent: {
      primary: "#2a34bd",
      danger: "#c22528",
    },
    elevation: {
      t1: "#00000007",
      t2: "#0000000f",
      t3: "#00000019",
    },
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
}

declare module "styled-components" {
  export interface DefaultTheme extends ThemeData {}
}
