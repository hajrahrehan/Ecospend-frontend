import React, { useEffect, useRef } from "react";
import { getCanvasFpsCap, shouldRunHeavyEffect, subscribeToPerformanceChanges } from "../perf/performanceGovernor";

export function CanvasLiteBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let last = 0;
    let fpsCapMs = 1000 / getCanvasFpsCap();
    let running = shouldRunHeavyEffect("canvasLite");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particleCount = 240;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
    }));

    const draw = (t: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(draw);
      if (t - last < fpsCapMs) return;
      last = t;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(120, 190, 255, 0.35)";

      for (const p of particles) {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const handlePerfChange = () => {
      const nextRunning = shouldRunHeavyEffect("canvasLite");
      fpsCapMs = 1000 / getCanvasFpsCap();
      if (!nextRunning && running) {
        running = false;
        cancelAnimationFrame(rafId);
        return;
      }
      if (nextRunning && !running) {
        running = true;
        last = 0;
        rafId = requestAnimationFrame(draw);
      }
    };

    const unsubscribe = subscribeToPerformanceChanges(handlePerfChange);
    if (running) rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      unsubscribe();
    };
  }, []);

  return <canvas ref={canvasRef} className="quantum-canvas-lite" />;
}
