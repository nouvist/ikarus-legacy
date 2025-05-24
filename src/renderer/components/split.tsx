import {
  motion,
  useMotionValue,
  useTransform
} from "motion/react";
import { ComponentProps, useRef, useState } from "react";
import { styled } from "styled-components";
import Flex from "~/renderer/components/flex";
import Stack from "~/renderer/components/stack";
import { getTwo } from "~/shared/react";

export interface SplitProps extends ComponentProps<"div"> {}

export default function Split({ children, ...props }: SplitProps) {
  const container = useRef<HTMLDivElement>(null);
  const [left, right] = getTwo(children);
  const leftFlex = useMotionValue(0.5);
  const rightFlex = useTransform(() => 1 - leftFlex.get());
  const [isDrag, setIsDrag] = useState(false);

  return (
    <Stack ref={container}>
      <Stack.Fill>
        <Flex {...props}>
          <Flex.MotionFill flex={leftFlex}>{left}</Flex.MotionFill>
          <Splitter
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

interface SplitterProps extends ComponentProps<typeof motion.div> {
  isDrag?: boolean;
}

const Splitter = styled(motion.div)<SplitterProps>`
  flex: unset;
  width: 1px;
  height: 100%;
  position: relative;
  background: ${(p) => p.theme.elevation.solid};
  cursor: ew-resize;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: ${(p) => (p.isDrag ? "1000px" : "15px")};
    height: 100%;
    transform: translateX(-50%);
  }
`;
