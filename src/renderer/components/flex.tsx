import { motion, MotionValue } from "motion/react";
import { ComponentProps } from "react";
import styled from "styled-components";

export enum FlexDirection {
  Row = "row",
  Column = "column",
}

export interface FlexProps extends React.ComponentProps<"div"> {
  direction?: FlexDirection;
  gap?: number;
}

const Flex = styled.div<FlexProps>`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  flex-direction: ${(p) => p.direction ?? FlexDirection.Row};
  gap: ${(p) => p.gap ?? 0}px;
`;

export interface FlexFillProps extends React.ComponentProps<"div"> {
  flex?: number | string;
}

const Fill = styled.div<FlexFillProps>`
  flex: ${(p) => p.flex ?? 1};
  width: 100%;
  height: 100%;
`;

const _MotionFill = motion(Fill);

export interface FlexMotionFillProps
  extends Omit<ComponentProps<typeof _MotionFill>, "flex"> {
  flex?: MotionValue<number> | number | string;
}

function MotionFill({ flex, children, ...props }: FlexMotionFillProps) {
  return (
    <_MotionFill
      {...props}
      style={{
        flex,
      }}
    >
      {children}
    </_MotionFill>
  );
}

export default Object.assign(Flex, {
  Fill,
  MotionFill,
});
