import * as motion from "motion/react-client";
// Type definitions
import { TapEventHandler } from "@/types";
import { PropsWithChildren } from "react";

export interface TapBounceProps extends PropsWithChildren {
  className?: string;
  onTap?: TapEventHandler
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function TapBounce({ children, ...props }: TapBounceProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
