"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default function AnimatedBackground() {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    // Generate orbs based on screen size
    const generateOrbs = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      const orbCount = isMobile ? 3 : isTablet ? 5 : 8;
      const newOrbs: FloatingOrb[] = [];

      for (let i = 0; i < orbCount; i++) {
        newOrbs.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 200 + 100,
          color: getRandomColor(),
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
        });
      }

      setOrbs(newOrbs);
    };

    generateOrbs();
    window.addEventListener("resize", generateOrbs);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("resize", generateOrbs);
    };
  }, []);

  const getRandomColor = () => {
    const colors = [
      "var(--primary-400)",
      "var(--secondary-400)",
      "var(--accent-400)",
      "var(--pink)",
      "var(--magenta)",
      "var(--lime)",
      "var(--electric-blue)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (isReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full opacity-20 blur-xl"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.2, 0.4, 0.1, 0.2],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Additional gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/10 via-transparent to-secondary-50/10" />
      <div className="absolute inset-0 bg-gradient-to-tl from-accent-50/5 via-transparent to-pink-50/5" />
    </div>
  );
}
