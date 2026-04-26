import React, { useRef, useEffect, useState } from "react";

export const CanvasVoxelWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

    const gridSize = 24; 
    const blockSize = 14;
    const gap = 1; 
    
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
      const startX = width / 2;
      const startY = height / 2;
      const rotationAngle = time * 0.00004;
      const cosA = Math.cos(rotationAngle);
      const sinA = Math.sin(rotationAngle);
      const waveTime = time * 0.00015;

      const renderQueue: any[] = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const rNorm = row - gridSize / 2;
          const cNorm = col - gridSize / 2;
          const rotR = rNorm * cosA - cNorm * sinA;
          const rotC = rNorm * sinA + cosA * cNorm;
          const isoX = (rotC - rotR) * (blockSize + gap) * 0.75;
          const isoY = (rotC + rotR) * (blockSize + gap) * 0.42;

          const wave1 = Math.sin(row * 0.2 + waveTime) * Math.cos(col * 0.2 + waveTime);
          const wave2 = Math.sin(row * 0.1 - waveTime * 0.5) * Math.cos(col * 0.1 + waveTime * 0.5);
          const zHeight = (wave1 * 30) + (wave2 * 20);

          renderQueue.push({ x: startX + isoX, y: startY + isoY - zHeight - 15, depth: rotR + rotC });
        }
      }

      renderQueue.sort((a, b) => a.depth - b.depth);

      renderQueue.forEach(({ x, y }) => {
        const size = blockSize;
        
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fillStyle = "#f1f5f9";
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
  }, [isVisible]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent" ref={containerRef}>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
    </div>
  );
};

export default CanvasVoxelWave;
