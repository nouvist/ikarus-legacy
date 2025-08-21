import { ComponentProps, ForwardedRef, forwardRef } from "react";
import styled, { css } from "styled-components";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import {
  BackgroundColor,
  ElevationColor,
  ForegroundColor,
} from "~/renderer/foundations/colors";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import Constraints from "~/renderer/foundations/constraints";

export interface CardProps extends ComponentProps<"div"> {
  background?: BackgroundColor;
  foreground?: ForegroundColor;
  radius?: number;
  border?: EdgeFlags;
  borderColor?: ElevationColor;
  margin?: EdgeInsets;
  padding?: EdgeInsets;
  solid?: boolean;
}

const Card = forwardRef(function Card(
  {
    background,
    foreground,
    radius,
    border,
    borderColor,
    margin,
    padding,
    children,
    solid,
    ...props
  }: CardProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_Card
      ref={ref}
      $background={background}
      $foreground={foreground}
      $radius={radius}
      $border={border}
      $borderColor={borderColor}
      $margin={margin}
      $padding={padding}
      $solid={solid || !managed.platform.isWindows}
      {...props}
    >
      {children}
    </_Card>
  );
});

interface _CardProps extends ComponentProps<"div"> {
  $background?: BackgroundColor;
  $foreground?: ForegroundColor;
  $radius?: number;
  $border?: EdgeFlags;
  $borderColor?: ElevationColor;
  $margin?: EdgeInsets;
  $padding?: EdgeInsets;
  $solid?: boolean;
}

const _Card = styled.div<_CardProps>`
  background: ${(p) =>
    p.$solid || p.$background
      ? p.theme.background[p.$background ?? BackgroundColor.E0]
      : "unset"};
  color: ${(p) => p.theme.foreground[p.$foreground ?? ForegroundColor.E0]};
  border-radius: ${(p) => p.$radius ?? 0}px;
  margin: ${(p) => p.$margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.$padding?.toCssVariable() ?? "0px"};

  ${(p) =>
    p.$border?.isLeft &&
    css`
      border-left: 1px solid
        ${p.theme.elevation[p.$borderColor ?? ElevationColor.T1]};
    `}
  ${(p) =>
    p.$border?.isRight &&
    css`
      border-right: 1px solid
        ${p.theme.elevation[p.$borderColor ?? ElevationColor.T1]};
    `}
  ${(p) =>
    p.$border?.isTop &&
    css`
      border-top: 1px solid
        ${p.theme.elevation[p.$borderColor ?? ElevationColor.T1]};
    `}
  ${(p) =>
    p.$border?.isBottom &&
    css`
      border-bottom: 1px solid
        ${p.theme.elevation[p.$borderColor ?? ElevationColor.T1]};
    `}
`;

const CardFull = forwardRef(function CardFull(
  {
    background,
    foreground,
    radius,
    border,
    borderColor,
    margin,
    padding,
    children,
    ...props
  }: CardProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_CardFull
      ref={ref}
      $background={background}
      $foreground={foreground}
      $radius={radius}
      $border={border}
      $borderColor={borderColor}
      $margin={margin}
      $padding={padding}
      {...props}
    >
      {children}
    </_CardFull>
  );
});

const _CardFull = styled(_Card)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

export interface CardConstrainedProps extends CardProps {
  constraints?: Constraints;
}

const CardConstrained = forwardRef(function CardConstrained(
  {
    background,
    foreground,
    radius,
    border,
    borderColor,
    margin,
    padding,
    constraints,
    children,
    ...props
  }: CardConstrainedProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_CardConstrained
      ref={ref}
      $background={background}
      $foreground={foreground}
      $radius={radius}
      $border={border}
      $borderColor={borderColor}
      $margin={margin}
      $padding={padding}
      $constraints={constraints}
      {...props}
    >
      {children}
    </_CardConstrained>
  );
});

interface _CardConstrainedProps extends _CardProps {
  $constraints?: Constraints;
}

const _CardConstrained = styled(_Card)<_CardConstrainedProps>`
  ${(p) => p.$constraints?.toCss()}
`;

const CardScroll = forwardRef(function CardScroll(
  {
    background,
    foreground,
    radius,
    border,
    borderColor,
    margin,
    padding,
    children,
    ...props
  }: CardProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <_CardScroll
      ref={ref}
      $background={background}
      $foreground={foreground}
      $radius={radius}
      $border={border}
      $borderColor={borderColor}
      $margin={margin}
      $padding={padding}
      {...props}
    >
      {children}
    </_CardScroll>
  );
});

const _CardScroll = styled(_Card)<CardProps>`
  overflow-y: scroll;
  padding-right: ${(p) => Math.max(p.padding?.right ?? 0, 32)}px;
  flex: 1;
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
  }

  &:hover {
    padding-right: 12px;
    &::-webkit-scrollbar {
      display: block;
      width: 20px;
    }
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(p) => p.theme.elevation.t2};
    border-radius: 10px;
    box-shadow: inset 0 0 0 6px ${(p) => p.theme.background.e0};
    &:hover {
      background-color: ${(p) => p.theme.elevation.t3};
    }
  }
`;

export default Object.assign(Card, {
  Full: CardFull,
  Constrained: CardConstrained,
  Scroll: CardScroll,
});
