import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  shineColor?: string;
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, shineColor = "via-white/20", ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      {...props}
      className={cn(
        "relative rounded-full px-6 py-3 font-medium text-white shadow-sm transition-colors cursor-pointer",
        "bg-blue-600 hover:bg-blue-700",
        "overflow-hidden group",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* The shine effect */}
      <motion.div
        className={cn("absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent to-transparent", shineColor)}
        initial={{ left: "-100%" }}
        animate={{ left: "100%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 3,
          ease: "linear",
          delay: 1,
        }}
        style={{
          width: "200%",
        }}
      />
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";
