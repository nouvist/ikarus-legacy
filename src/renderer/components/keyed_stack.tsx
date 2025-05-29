import { motion } from "motion/react";
import { Children, ComponentProps, Key } from "react";
import { styled } from "styled-components";
import Stack from "~/renderer/components/stack";
import { getKey, useRandom } from "~/shared/react";

export interface KeyedStackProps extends ComponentProps<"div"> {
  activeKey?: Key;
}

export default function KeyedStack({
  activeKey,
  children,
  ...props
}: KeyedStackProps) {
  const mainKey = useRandom();

  return (
    <Stack {...props}>
      {Children.map(children, (child) => {
        const key = getKey(child);
        const isActive = key === activeKey;

        return (
          <Item
            key={`${mainKey}::${key}`}
            index={isActive ? 1 : 0}
            visible={isActive}
            animate={{
              opacity: isActive ? 1 : 0,
              translateY: isActive ? 0 : 64,
            }}
          >
            {child}
          </Item>
        );
      })}
    </Stack>
  );
}

interface ItemProps extends ComponentProps<"div"> {
  index?: number;
  visible?: boolean;
}

const Item = motion(styled(Stack.Fill)<ItemProps>`
  z-index: ${(p) => p.index ?? 0};
  pointer-events: ${(p) => (p.visible ? "unset" : "none")};
`);
