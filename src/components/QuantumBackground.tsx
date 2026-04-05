import React, { Suspense, lazy, memo, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { PerfTier } from "../lib/perfTier";
import { CanvasLiteBackground } from "./CanvasLiteBackground";
import { StaticCosmicBackground } from "./StaticCosmicBackground";

const QuantumField = lazy(() => import("./QuantumField"));

const ThreeBackground = ({ tier }: { tier: PerfTier }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => setReducedMotion(e.matches);
    handleChange(mq);
    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange as (e: MediaQueryListEvent) => void);
      return () => mq.removeEventListener("change", handleChange as (e: MediaQueryListEvent) => void);
    }
    mq.addListener(handleChange as (e: MediaQueryListEvent) => void);
    return () => mq.removeListener(handleChange as (e: MediaQueryListEvent) => void);
  }, []);

  const maxCount = tier === "high" ? 8000 : 3000;
  const initialCount = tier === "high" ? 6000 : 2000;
  const dpr = tier === "high" ? 1.5 : 1;

  return (
    <div className="quantum-bg-layer">
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true, stencil: false }}
        shadows={false}
        dpr={dpr}
      >
        <Suspense fallback={null}>
          <QuantumField
            performanceLevel={tier}
            reducedMotion={reducedMotion}
            maxCount={maxCount}
            initialCount={initialCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export const QuantumBackground = memo(function QuantumBackground({
  tier,
}: {
  tier: PerfTier;
}) {
  if (tier === "high") return <ThreeBackground tier={tier} />;
  if (tier === "mid") return <CanvasLiteBackground />;
  return <StaticCosmicBackground />;
});
