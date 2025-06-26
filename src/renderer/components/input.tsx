import { ComponentProps, ForwardedRef, forwardRef, ReactNode } from "react";
import { styled } from "styled-components";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface InputProps extends ComponentProps<"input"> {
  radius?: number;
  margin?: EdgeInsets;
  padding?: EdgeInsets;
  constraints?: Constraints;
  icon?: ReactNode;
}

export default forwardRef(Input);
function Input(
  { constraints, radius, margin, padding, icon, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <_Container
      constraints={constraints ?? new Constraints({ minHeight: 40 })}
      radius={radius}
      margin={margin}
      padding={padding ?? EdgeInsets.symmetric({ horizontal: 12 })}
    >
      {icon}
      <_Input {...props} ref={ref} />
    </_Container>
  );
}

const _Input = styled.input<InputProps>`
  min-width: 0px;
  width: 100%;
  height: 38px;
  background: none;
  flex: 1;
`;

const _Container = styled.label<InputProps>`
  cursor: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${(p) => p.theme.elevation.t1};
  color: ${(p) => p.theme.foreground.e0};
  border-radius: ${(p) => p.radius ?? 4}px;
  transition: box-shadow 200ms ease-in-out;
  margin: ${(p) => p.margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.padding?.toCssVariable() ?? "0px"};
  ${(p) => p.constraints?.toCss()}

  box-shadow:
    inset 0 0 0 1px ${(p) => p.theme.elevation.t2},
    inset 0 -2px 0 0 ${(p) => p.theme.elevation.t3};

  &:hover,
  &:focus,
  &:focus-within {
    box-shadow:
      inset 0 0 0 1px ${(p) => p.theme.elevation.t3},
      inset 0 -2px 0 0 ${(p) => p.theme.accent.primary};
  }

  &:disabled {
    background: ${(p) => p.theme.elevation.t1};
    box-shadow:
      inset 0 0 0 1px ${(p) => p.theme.elevation.t1},
      inset 0 -2px 0 0 ${(p) => p.theme.elevation.t3};
    color: ${(p) => p.theme.foreground.e1};
  }
`;
