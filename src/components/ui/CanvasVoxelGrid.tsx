import React, { useRef, useEffect, useState, useCallback } from "react";

export const CanvasVoxelGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCoords, setHoverCoords] = useState({ r: -100, c: -100 });
  const [isVisible, setIsVisible] = useState(false);

  // Performance Optimization: Only render when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const GRID_SIZE = 12; 
    const PILL_W = 14;
    const ISO_X = PILL_W * 0.85;
    const ISO_Y = PILL_W * 0.45;

    let width = 0;
    let height = 0;
    let animationFrameId: number;

    const init = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2 + (GRID_SIZE * ISO_Y) / 2;
      const rotationAngle = time * 0.00008; 
      const cosA = Math.cos(rotationAngle);
      const sinA = Math.sin(rotationAngle);
      const waveTime = time * 0.00015;

      const renderQueue: any[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const rNorm = row - GRID_SIZE / 2;
          const cNorm = col - GRID_SIZE / 2;
          const rotR = rNorm * cosA - cNorm * sinA;
          const rotC = rNorm * sinA + cNorm * cosA;
          const x = centerX + (rotC - rotR) * ISO_X;
          const yBase = centerY + (rotR + rotC) * ISO_Y;

          const distToCenter = Math.sqrt(rNorm * rNorm + cNorm * cNorm);
          const unravelBase = (Math.sin(row * 1.5) * Math.cos(col * 1.5)) * 10;
          const explosion = Math.sin(distToCenter * 0.4 - waveTime * 4) * 10;
          
          const distToMouse = Math.sqrt(
            Math.pow(row - hoverCoords.r, 2) + Math.pow(col - hoverCoords.c, 2)
          );
          let hoverZ = 0;
          if (distToMouse < 4) hoverZ = (4 - distToMouse) * 10;

          renderQueue.push({ x, y: yBase - explosion - hoverZ - unravelBase, depth: rotR + rotC });
        }
      }

      renderQueue.sort((a, b) => a.depth - b.depth);

      renderQueue.forEach(({ x, y }) => {
        const size = PILL_W;
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size * 1.5);
        ctx.lineTo(x, y + size / 2);
        ctx.closePath();
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x, y + size * 1.5);
        ctx.lineTo(x, y + size / 2);
        ctx.closePath();
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();
      });
    };

    let lastTime = 0;
    const render = (time: number) => {
      // Limit to 60FPS to prevent CPU spikes
      if (time - lastTime > 16) {
        draw(time);
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    init();
    render(0);

    const handleResize = () => init();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [hoverCoords, isVisible]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setHoverCoords({ 
      r: Math.round((y / 7 - x / 14) / 2 + 6), 
      c: Math.round((x / 14 + y / 7) / 2 + 6) 
    });
  }, []);

  return (
    <div className="w-full h-full relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverCoords({ r: -100, c: -100 })} ref={containerRef}>
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
    </div>
  );
};

export default CanvasVoxelGrid;
