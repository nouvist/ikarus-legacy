import { ComponentProps } from "react";
import styled from "styled-components";

export interface TitlebarProps extends ComponentProps<"div"> {}

export default function Titlebar({ children, ...props }: TitlebarProps) {
  return <Container {...props}>{children}</Container>;
}

const Container = styled.div`
  width: 100%;
  height: 32px;
  -webkit-app-region: drag;
  > * {
    -webkit-app-region: no-drag;
  }
`;
