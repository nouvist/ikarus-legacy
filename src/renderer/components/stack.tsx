import { motion, MotionValue } from "motion/react";
import { ForwardedRef, forwardRef } from "react";
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

const StackFill = forwardRef(function StackFill(
  { top, left, right, bottom, children, ...props }: StackFillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_StackFill
      {...props}
      ref={ref}
      $top={top}
      $left={left}
      $right={right}
      $bottom={bottom}
    >
      {children}
    </_StackFill>
  );
});

interface _StackFillProps extends React.ComponentProps<"div"> {
  $top?: number | string;
  $left?: number | string;
  $right?: number | string;
  $bottom?: number | string;
}

const _StackFill = styled.div<_StackFillProps>`
  position: absolute;
  top: ${(p) => p.$top ?? 0};
  left: ${(p) => p.$left ?? 0};
  right: ${(p) => p.$right ?? 0};
  bottom: ${(p) => p.$bottom ?? 0};
`;

const _MotionStackFill = motion.create(StackFill);

export interface StackMotionFillProps
  extends Omit<
    React.ComponentProps<typeof _MotionStackFill>,
    "top" | "left" | "right" | "bottom"
  > {
  top?: MotionValue;
  left?: MotionValue;
  right?: MotionValue;
  bottom?: MotionValue;
}

function MotionStackFill({
  top,
  left,
  right,
  bottom,
  children,
  ...props
}: StackMotionFillProps) {
  return (
    <_MotionStackFill
      {...props}
      style={{
        top,
        left,
        right,
        bottom,
      }}
    >
      {children}
    </_MotionStackFill>
  );
}

export default Object.assign(Stack, {
  Fill: StackFill,
  MotionFill: MotionStackFill,
});
