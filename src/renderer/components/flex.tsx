import { motion, MotionValue } from "motion/react";
import { ComponentProps, ForwardedRef, forwardRef } from "react";
import styled from "styled-components";

export enum FlexDirection {
  Row = "row",
  Column = "column",
}

export enum JustifyContent {
  Start = "flex-start",
  End = "flex-end",
  Center = "center",
  SpaceBetween = "space-between",
  SpaceAround = "space-around",
}

export enum AlignItems {
  Start = "flex-start",
  End = "flex-end",
  Center = "center",
  Stretch = "stretch",
  Baseline = "baseline",
}

export interface FlexProps extends React.ComponentProps<"div"> {
  gap?: number;
  direction?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  fill?: boolean;
}

const Flex = forwardRef(function Flex(
  {
    gap,
    direction,
    justifyContent,
    alignItems,
    fill,
    children,
    ...props
  }: FlexProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_Flex
      {...props}
      ref={ref}
      $direction={direction}
      $gap={gap}
      $justifyContent={justifyContent}
      $alignItems={alignItems}
      data-fill={fill}
    >
      {children}
    </_Flex>
  );
});

interface _FlexProps extends React.ComponentProps<"div"> {
  $gap?: number;
  $direction?: FlexDirection;
  $justifyContent?: JustifyContent;
  $alignItems?: AlignItems;
}

const _Flex = styled.div<_FlexProps>`
  display: flex;
  flex: 1;
  flex-direction: ${(p) => p.$direction ?? FlexDirection.Row};
  justify-content: ${(p) => p.$justifyContent ?? JustifyContent.Start};
  align-items: ${(p) => p.$alignItems ?? AlignItems.Stretch};
  gap: ${(p) => p.$gap ?? 0}px;
  &[data-fill="true"] {
    width: 100%;
    height: 100%;
  }
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
