export type PerfTier = "high" | "mid" | "low";

export function getPerfTier(): PerfTier {
  if (typeof window === "undefined") return "mid";

  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") ||
    (navigator.maxTouchPoints || 0) > 1 ||
    window.innerWidth < 900;

  if (isMobile) return "low";

  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as any).deviceMemory || 4;

  if (cores >= 8 && mem >= 8) return "high";
  if (cores >= 4 && mem >= 4) return "mid";
  return "low";
}
