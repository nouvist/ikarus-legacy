import { Children, ComponentProps, Key, useRef } from "react";
import { styled } from "styled-components";
import getKey from "~/shared/key";
import getRandom from "~/shared/random";

export interface StackProps extends ComponentProps<"div"> {
  activeKey?: Key;
}

export default function Stack({ activeKey, children, ...props }: StackProps) {
  const mainKey = useRef(getRandom());
  return (
    <Container {...props}>
      {Children.map(children, (child) => {
        const key = getKey(child);
        const isActive = key === activeKey;
        return (
          <Item
            key={`${mainKey}::${key}`}
            zIndex={isActive ? 1 : 0}
            visible={isActive}
          >
            {child}
          </Item>
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

interface ItemProps extends ComponentProps<"div"> {
  zIndex?: number;
  visible?: boolean;
}

const Item = styled.div<ItemProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${(p) => p.zIndex ?? 0};
  opacity: ${p => p.visible ? 1 : 0};
  pointer-events: ${p => p.visible ? 'unset' : 'none'};
`;
