import { ForwardedRef, forwardRef } from "react";
import { styled } from "styled-components";
import Button, { ButtonProps } from "~/renderer/components/button";

const Tabs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  width: 320px;
  border-right: 1px solid ${(p) => p.theme.elevation.t3};
  padding: 30px;
`;

export interface TabsItemProps extends ButtonProps {
  selected?: boolean;
}

function TabsItem(
  { selected: active, children, ...props }: TabsItemProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <_TabsItem ref={ref} {...props} data-selected={active}>
      {children}
    </_TabsItem>
  );
}

const _TabsItem = styled(Button)`
  height: 40px;
  padding: 0px 20px;
  background: none;
  color: ${(p) => p.theme.foreground.e1};
  box-shadow: none;
  justify-content: flex-start;

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

export default Object.assign(Tabs, {
  Item: forwardRef(TabsItem),
});
