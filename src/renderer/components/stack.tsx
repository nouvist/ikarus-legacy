import { motion, MotionValue } from "motion/react";
import styled from "styled-components";

export interface StackProps extends React.ComponentProps<"div"> {}

const Stack = styled.div<StackProps>`
  position: relative;
  width: 100%;
  height: 100%;
`;

export interface StackFillProps extends React.ComponentProps<"div"> {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}

const Fill = styled.div<StackFillProps>`
  position: absolute;
  top: ${(p) => p.top ?? 0};
  left: ${(p) => p.left ?? 0};
  right: ${(p) => p.right ?? 0};
  bottom: ${(p) => p.bottom ?? 0};
`;

const _MotionFill = motion(Fill);

export interface StackMotionFillProps
  extends Omit<
    React.ComponentProps<typeof _MotionFill>,
    "top" | "left" | "right" | "bottom"
  > {
  top?: MotionValue;
  left?: MotionValue;
  right?: MotionValue;
  bottom?: MotionValue;
}

function MotionFill({
  top,
  left,
  right,
  bottom,
  children,
  ...props
}: StackMotionFillProps) {
  return (
    <_MotionFill
      {...props}
      style={{
        top,
        left,
        right,
        bottom,
      }}
    >
      {children}
    </_MotionFill>
  );
}

export default Object.assign(Stack, {
  Fill,
  MotionFill,
});
