import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, motion } from "framer-motion";

interface CanvasRevealEffectProps {
  animationSpeed?: number;
  containerClassName?: string;
  colors?: number[][];
  dotSize?: number;
  showGradient?: boolean;
}

export const CanvasRevealEffect: React.FC<CanvasRevealEffectProps> = ({
  animationSpeed = 3,
  containerClassName,
  colors = [[0, 255, 255]],
  dotSize = 3,
  showGradient = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: { x: number; y: number; opacity: number; color: number[] }[] = [];

    const spacing = dotSize * 3;

    const init = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const colorObj = colors[Math.floor(Math.random() * colors.length)];
          particles.push({
            x: i * spacing + spacing / 2,
            y: j * spacing + spacing / 2,
            opacity: 0,
            color: colorObj,
          });
        }
      }
    };

    let cx = 0;
    let cy = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const mX = mouseX.get();
      const mY = mouseY.get();
      
      cx += (mX - cx) * (animationSpeed * 0.05);
      cy += (mY - cy) * (animationSpeed * 0.05);

      particles.forEach((p) => {
        // Calculate distance from simulated mouse
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Reveal radius
        const maxDist = 200; 
        
        let targetOpacity = 0;
        if (hovered && dist < maxDist) {
          targetOpacity = 1 - (dist / maxDist);
        }

        // Smooth opacity transition
        p.opacity += (targetOpacity - p.opacity) * 0.1;

        if (p.opacity > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
          ctx.fill();
        }
      });

      requestAnimationFrame(render);
    };

    init();
    const animId = requestAnimationFrame(render);

    const handleResize = () => {
      init();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [colors, dotSize, animationSpeed, hovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn("absolute inset-0 w-full h-full overflow-hidden transition-colors duration-700", containerClassName)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
      
      {showGradient && hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-0 bg-blue-50/20"
        />
      )}
    </div>
  );
};
