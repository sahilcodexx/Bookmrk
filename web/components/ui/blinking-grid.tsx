"use client";
import React, { useEffect, useRef } from "react";

export function BlinkingGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const size = 4; // square size
    const gap = 2; // gap between squares
    const step = size + gap;

    let cols = 0;
    let rows = 0;
    let offsets: number[][] = [];
    let speeds: number[][] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
        cols = Math.ceil(width / step);
        rows = Math.ceil(height / step);
        
        offsets = Array.from({ length: cols }, () => 
          Array.from({ length: rows }, () => Math.random() * Math.PI * 2)
        );
        speeds = Array.from({ length: cols }, () => 
          Array.from({ length: rows }, () => 0.2 + Math.random() * 0.8) // SLOWED DOWN
        );
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;

      const isDark = document.documentElement.classList.contains("dark");
      // Cyan in dark mode, black/dark-gray in light mode
      const r = isDark ? 0 : 0;
      const g = isDark ? 180 : 0;
      const b = isDark ? 180 : 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const offset = offsets[i][j];
          const speed = speeds[i][j];
          
          const wave = Math.sin(time * speed + offset);
          
          let opacity = 0.02; // base dim
          if (wave > 0.9) {
            opacity = 0.1 + (wave - 0.9) * 3; // spikes up to 0.4
          } else if (wave > 0.7) {
            opacity = 0.05 + (wave - 0.7) * 0.5;
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fillRect(i * step, j * step, size, size);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
