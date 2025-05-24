import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "motion/react";
import { ComponentProps } from "react";
import { styled } from "styled-components";
import Flex from "~/renderer/components/flex";
import Stack from "~/renderer/components/stack";
import { getTwo } from "~/shared/react";

export interface SplitProps extends ComponentProps<"div"> {}

export default function Split({ children, ...props }: SplitProps) {
  const [left, right] = getTwo(children);
  const leftFlex = useMotionValue(0.5);
  const rightFlex = useTransform(() => 1 - leftFlex.get());
  const drag = useDragControls();

  return (
    <Stack>
      <Stack.Fill>
        <Flex {...props}>
          <Flex.MotionFill flex={leftFlex}>{left}</Flex.MotionFill>
          <Splitter
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragMomentum={false}
            dragControls={drag}
            onDrag={(event, info) => {
              const width =
                (event.target as HTMLElement | undefined)?.parentElement
                  ?.clientWidth ?? 0;
              leftFlex.set(info.point.x / width);
            }}
          />
          <Flex.MotionFill flex={rightFlex}>{right}</Flex.MotionFill>
        </Flex>
      </Stack.Fill>
    </Stack>
  );
}

const Splitter = styled(motion.div)`
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
    left: -5px;
    width: 10px;
    height: 100%;
  }
`;
