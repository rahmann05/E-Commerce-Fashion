"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useRef, useState, useEffect } from "react";
import { HERO_CLOTHING } from "../../data/products";
import Image from "next/image";

import { getImageUrl } from "@/shared/utils/image-utils";

interface TrailItem {
  id: number;
  x: number;
  y: number;
  clothingIndex: number;
  rotation: number;
  scale: number;
}

interface CursorTrailProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function CursorTrail({ containerRef }: CursorTrailProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const trailIdRef = useRef(0);
  const lastSpawnTime = useRef(0);
  const clothingCycleRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawnTime.current < 150) return;
      lastSpawnTime.current = now;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newItem: TrailItem = {
        id: trailIdRef.current++,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        clothingIndex: clothingCycleRef.current % HERO_CLOTHING.length,
        rotation: (Math.random() - 0.5) * 40,
        scale: 0.6 + Math.random() * 0.5,
      };

      clothingCycleRef.current++;

      setTrail((prev) => {
        const next = [...prev, newItem];
        if (next.length > 12) return next.slice(-12);
        return next;
      });

      setTimeout(() => {
        setTrail((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 1800);
    },
    [containerRef]
  );

  // Auto-trail for mobile devices
  useEffect(() => {
    let animationFrameId: number;
    let start: number | null = null;
    let isMobile = false;

    const simulateMobileTrail = (timestamp: number) => {
      if (!isMobile) return;
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Create an active, elegant figure-8 pattern sweeping across the viewport
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = cx + Math.sin(elapsed / 450) * (window.innerWidth * 0.38); 
      const y = cy + Math.cos(elapsed / 900) * (window.innerHeight * 0.22) - 50; 

      // Call handleMouseMove synthetically
      handleMouseMove({ clientX: x, clientY: y } as unknown as React.MouseEvent);

      animationFrameId = requestAnimationFrame(simulateMobileTrail);
    };

    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        isMobile = true;
        if (start === null) start = performance.now();
        animationFrameId = requestAnimationFrame(simulateMobileTrail);
      } else {
        isMobile = false;
        cancelAnimationFrame(animationFrameId);
        start = null;
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleMouseMove]);

  return (
    <>
      {/* Invisible overlay to capture mouse events */}
      <div
        onMouseMove={handleMouseMove}
        style={{ position: "absolute", inset: 0, zIndex: 9 }}
      />
      <AnimatePresence>
        {trail.map((item) => {
          const clothing = HERO_CLOTHING[item.clothingIndex];
          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                scale: 0.3,
                x: item.x - clothing.width / 2,
                y: item.y - clothing.height / 2,
                rotate: item.rotation - 20,
              }}
              animate={{
                opacity: [0, 0.9, 0.9, 0],
                scale: [0.3, item.scale, item.scale * 0.9, 0.2],
                y: item.y - clothing.height / 2 - 30,
                rotate: item.rotation,
              }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
              transition={{
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
                opacity: { times: [0, 0.15, 0.7, 1] },
                scale: { times: [0, 0.15, 0.7, 1] },
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: clothing.width,
                height: clothing.height,
                zIndex: 10,
                pointerEvents: "none",
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.4))",
              }}
            >
              <Image src={getImageUrl(clothing.src)} alt="" fill style={{ objectFit: "contain" }} sizes="(max-width: 768px) 100vw, 20vw" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}

