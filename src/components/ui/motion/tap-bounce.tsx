import * as motion from "motion/react-client";
// Type definitions
import { TapEventHandler } from "@/types";
import { PropsWithChildren } from "react";

export interface TapBounceProps extends PropsWithChildren {
  disableAnimation?: boolean;
  className?: string;
  onTap?: TapEventHandler;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function TapBounce({
  disableAnimation = false,
  children,
  ...props
}: TapBounceProps) {
  return (
    <motion.div
      whileHover={!disableAnimation ? { scale: 1.1 } : undefined}
      whileTap={!disableAnimation ? { scale: 0.8 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
