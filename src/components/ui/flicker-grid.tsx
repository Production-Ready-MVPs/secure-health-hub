import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FlickerGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  color?: string;
  maxOpacity?: number;
  flickerChance?: number;
}

export const FlickerGrid: React.FC<FlickerGridProps> = ({
  className,
  squareSize = 4,
  gridGap = 6,
  color = "rgb(148, 163, 184)", // Slate 400 default
  maxOpacity = 0.3,
  flickerChance = 0.1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let squares: { opacity: number; targetOpacity: number; timer: number }[][] = [];

    const init = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;

      cols = Math.floor(width / (squareSize + gridGap)) + 1;
      rows = Math.floor(height / (squareSize + gridGap)) + 1;

      squares = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, () => ({
          opacity: Math.random() * maxOpacity,
          targetOpacity: Math.random() * maxOpacity,
          timer: Math.random() * 100,
        }))
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const sq = squares[i][j];
          sq.timer -= 1;

          if (sq.timer <= 0) {
            sq.timer = Math.random() * 50 + 50; // Random flicker duration
            if (Math.random() < flickerChance) {
               sq.targetOpacity = Math.random() * maxOpacity;
            } else {
               sq.targetOpacity = 0; 
            }
          }

          // Smoothly interpolate opacity
          sq.opacity += (sq.targetOpacity - sq.opacity) * 0.1;

          if (sq.opacity > 0) {
            ctx.fillStyle = color;
            ctx.globalAlpha = sq.opacity;
            ctx.fillRect(
              i * (squareSize + gridGap),
              j * (squareSize + gridGap),
              squareSize,
              squareSize
            );
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = requestAnimationFrame(render);
    };

    init();
    render();

    const handleResize = () => {
      init();
    };
    
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [squareSize, gridGap, color, maxOpacity, flickerChance]);

  return (
    <div className={cn("absolute inset-0 z-0 pointer-events-none w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
};
