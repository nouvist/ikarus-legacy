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
  background: ${(p) => p.theme.elevation.t1};
  color: ${(p) => p.theme.foreground.e0};
  border: 1px solid ${(p) => p.theme.elevation.t2};
  border-radius: ${(p) => p.radius ?? 4}px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 200ms ease-in-out;
  display: flex;
  gap: 8px;
  margin: ${(p) => p.margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.padding?.toCssVariable() ?? "0px"};
  ${(p) => p.constraints?.toCss()}
  cursor: text;

  &:hover, &:focus, &:focus-within {
    border-color: ${(p) => p.theme.elevation.t3};
  }

  &:disabled {
    background: ${(p) => p.theme.elevation.t1};
    border-color: ${(p) => p.theme.elevation.t1};
    color: ${(p) => p.theme.foreground.e1};
  }
`;
