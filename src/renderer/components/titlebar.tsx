import { ComponentProps } from "react";
import styled from "styled-components";

export interface TitlebarProps extends ComponentProps<"div"> {}

function Titlebar({ children, ...props }: TitlebarProps) {
  return <Container {...props}>{children}</Container>;
}

export interface TitlebarTabProps extends ComponentProps<"button"> {
  selected?: boolean;
}

function TitlebarTab({ selected, children, ...props }: TitlebarTabProps) {
  const Element = selected ? TabActive : TabInactive;
  return <Element {...props}>{children}</Element>;
}

export default Object.assign(Titlebar, {
  Tab: TitlebarTab,
});

const Container = styled.div`
  width: 100%;
  height: 48px;
  padding-right: 137px;
  background: ${(p) => p.theme.background.e0};
  border-bottom: 1px solid ${(p) => p.theme.elevation.solid};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  -webkit-app-region: drag;
  > * {
    -webkit-app-region: no-drag;
  }
`;

const TabInactive = styled.button`
  height: 40px;
  color: ${(p) => p.theme.foreground.e1};
  padding: 0px 20px;
  border: 1px solid ${(p) => p.theme.elevation.t2};
  border-radius: 8px;
  &:hover {
    background: ${(p) => p.theme.elevation.t1};
  }
`;

const TabActive = styled(TabInactive)`
  background: ${(p) => p.theme.elevation.t1};
  color: ${(p) => p.theme.foreground.e0};
  &:hover {
    background: ${(p) => p.theme.elevation.t2};
  }
`;
