import React from "react";
import { motion } from "framer-motion";

export const DNAHelix = ({ className }: { className?: string }) => {
  const points = 20;
  const dots = Array.from({ length: points });

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 400"
        className="w-full h-auto opacity-40 drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection Lines */}
        {dots.map((_, i) => {
          const y = i * 20 + 10;
          return (
            <motion.g
              key={`line-${i}`}
              initial={{ scaleX: 1, opacity: 0.1 }}
              animate={{
                scaleX: [1, -1, 1],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: `100px ${y}px` }}
            >
              <line
                x1={40}
                y1={y}
                x2={160}
                y2={y}
                stroke="#2563EB"
                strokeWidth={1.5}
                strokeOpacity={0.3}
              />
            </motion.g>
          );
        })}

        {/* Strand 1 */}
        {dots.map((_, i) => (
          <motion.circle
            key={`strand1-${i}`}
            cx={40}
            cy={i * 20 + 10}
            r={4}
            fill="#2563EB"
            initial={{ x: 0, scale: 1, opacity: 0.3 }}
            animate={{
              x: [0, 120, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Strand 2 */}
        {dots.map((_, i) => (
          <motion.circle
            key={`strand2-${i}`}
            cx={160}
            cy={i * 20 + 10}
            r={4}
            fill="#60A5FA"
            initial={{ x: 0, scale: 1, opacity: 0.3 }}
            animate={{
              x: [0, -120, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
