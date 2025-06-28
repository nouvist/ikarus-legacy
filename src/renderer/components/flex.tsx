import { motion, MotionValue } from "motion/react";
import { ComponentProps, ForwardedRef, forwardRef } from "react";
import styled from "styled-components";

export enum FlexDirection {
  Row = "row",
  Column = "column",
}

export interface FlexProps extends React.ComponentProps<"div"> {
  direction?: FlexDirection;
  gap?: number;
}

const Flex = forwardRef(function Flex(
  { direction, gap, children, ...props }: FlexProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_Flex {...props} ref={ref} $direction={direction} $gap={gap}>
      {children}
    </_Flex>
  );
});

interface _FlexProps extends React.ComponentProps<"div"> {
  $direction?: FlexDirection;
  $gap?: number;
}

const _Flex = styled.div<_FlexProps>`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  flex-direction: ${(p) => p.$direction ?? FlexDirection.Row};
  gap: ${(p) => p.$gap ?? 0}px;
`;

export interface FlexFillProps extends React.ComponentProps<"div"> {
  flex?: number | string;
}

interface _FlexFillProps extends React.ComponentProps<"div"> {
  $flex?: number | string;
}

const FlexFill = forwardRef(function FlexFill(
  { flex, children, ...props }: FlexFillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_FlexFill {...props} ref={ref} $flex={flex}>
      {children}
    </_FlexFill>
  );
});

const _FlexFill = styled.div<_FlexFillProps>`
  flex: ${(p) => p.$flex ?? 1};
  width: 100%;
  height: 100%;
`;

const _FlexMotionFill = motion.create(FlexFill);

export interface FlexMotionFillProps
  extends Omit<ComponentProps<typeof _FlexMotionFill>, "flex"> {
  flex?: MotionValue<number> | number | string;
}

const FlexMotionFill = forwardRef(function FlexMotionFill(
  { flex, children, ...props }: FlexMotionFillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_FlexMotionFill
      {...props}
      ref={ref}
      style={{
        flex,
      }}
    >
      {children}
    </_FlexMotionFill>
  );
});

export default Object.assign(Flex, {
  Fill: FlexFill,
  MotionFill: FlexMotionFill,
});
