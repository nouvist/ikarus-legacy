import { ComponentProps, ForwardedRef, forwardRef, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import Button, { ButtonProps } from "~/renderer/components/button";
import Card from "~/renderer/components/card";

export interface TitlebarProps extends ComponentProps<"div"> {}

function Titlebar({ children, ...props }: TitlebarProps) {
  const theme = useTheme();
  useEffect(() => {
    managed.window.setTitleBarColor(theme.background.e0);
    managed.window.setTitleBarSymbolColor(theme.foreground.e0);
  }, [theme]);

  return <_Container {...props}>{children}</_Container>;
}

const _Container = styled(Card)`
  width: 100%;
  height: 49px;
  flex-shrink: 0;
  border-bottom: 1px solid ${(p) => p.theme.elevation.t3};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  z-index: 1000;
  -webkit-app-region: drag;
  > * {
    -webkit-app-region: no-drag;
  }
`;

export interface TitlebarTabProps extends ButtonProps {
  selected?: boolean;
}

function TitlebarTab(
  { selected, children, ...props }: TitlebarTabProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <_TitlebarTab ref={ref} {...props} data-selected={selected}>
      {children}
    </_TitlebarTab>
  );
}

const _TitlebarTab = styled(Button)`
  height: 40px;
  padding: 0px 20px;
  background: none;
  color: ${(p) => p.theme.foreground.e1};
  box-shadow: none;
  &:hover {
    background: ${(p) => p.theme.elevation.t1};
  }
  &[data-selected="true"] {
    background: ${(p) => p.theme.elevation.t1};
    color: ${(p) => p.theme.foreground.e0};
    font-weight: 600;
    &:hover {
      background: ${(p) => p.theme.elevation.t2};
    }
  }
`;

export default Object.assign(Titlebar, {
  Tab: forwardRef(TitlebarTab),
});
