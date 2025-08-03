import { motion, useMotionValue, useTransform } from "motion/react";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import Flex from "~/renderer/components/flex";
import Stack from "~/renderer/components/stack";
import { getTwo } from "~/shared/react";

export interface SplitProps extends ComponentProps<"div"> {
  defaultFlex?: number;
}

export default function Split({ children, defaultFlex, ...props }: SplitProps) {
  const container = useRef<HTMLDivElement>(null);
  const [left, right] = getTwo(children);
  const leftFlex = useMotionValue(0.5);
  const rightFlex = useTransform(() => 1 - leftFlex.get());
  const [isDrag, setIsDrag] = useState(false);

  useEffect(() => {
    if (!defaultFlex) return;
    leftFlex.set(defaultFlex);
  }, []);

  return (
    <Stack ref={container}>
      <Stack.Fill>
        <Flex fill {...props}>
          <Flex.MotionFill flex={leftFlex}>{left}</Flex.MotionFill>
          <_Splitter
            isDrag={isDrag}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => setIsDrag(true)}
            onDragEnd={() => setIsDrag(false)}
            onDrag={(_, info) => {
              const width = container.current?.clientWidth ?? 0;
              leftFlex.set(info.point.x / width);
            }}
          />
          <Flex.MotionFill flex={rightFlex}>{right}</Flex.MotionFill>
        </Flex>
      </Stack.Fill>
    </Stack>
  );
}

interface _SplitterProps extends ComponentProps<typeof motion.div> {
  isDrag?: boolean;
}

const _Splitter = styled(motion.div)<_SplitterProps>`
  flex: unset;
  width: 1px;
  height: 100%;
  position: relative;
  background: ${(p) => p.theme.elevation.solid};
  cursor: ew-resize;
  z-index: 1000;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: ${(p) => (p.isDrag ? "1000px" : "9px")};
    height: 100%;
    transform: translateX(-50%);
  }
`;
