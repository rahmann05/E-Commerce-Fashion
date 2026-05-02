"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useColorTheme } from "@/context/ColorContext";
import styles from "./MultiColorWave.module.css";

export default function MultiColorWave() {
  const { activeTheme } = useColorTheme();
  const [currentColors, setCurrentColors] = useState([
    activeTheme.primary,
    activeTheme.secondary,
    activeTheme.tertiary,
    activeTheme.accent || activeTheme.primary
  ]);

  // Update colors when theme changes
  useEffect(() => {
    setCurrentColors([
      activeTheme.primary,
      activeTheme.secondary,
      activeTheme.tertiary,
      activeTheme.accent || activeTheme.primary
    ]);
  }, [activeTheme]);

  return (
    <motion.div
      className={styles.waveRoot}
      animate={{ backgroundColor: currentColors[0] }}
      transition={{ duration: 3, ease: "easeInOut" }}
    >
      <div className={styles.waveInner}>
        {/* Blob 1 */}
        <motion.div
          animate={{
            x: ["0%", "20%", "-10%", "0%"],
            y: ["0%", "-30%", "20%", "0%"],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: currentColors[0],
            transition: "background 3s ease-in-out",
            mixBlendMode: "screen",
            opacity: 0.6,
          }}
        />

        {/* Blob 2 */}
        <motion.div
          animate={{
            x: ["0%", "-20%", "15%", "0%"],
            y: ["0%", "25%", "-15%", "0%"],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background: currentColors[1],
            transition: "background 3s ease-in-out",
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        />

        {/* Blob 3 */}
        <motion.div
          animate={{
            x: ["0%", "30%", "-20%", "0%"],
            y: ["0%", "-10%", "30%", "0%"],
            scale: [1, 1.5, 0.7, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "20%",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background: currentColors[2],
            transition: "background 3s ease-in-out",
            mixBlendMode: "multiply",
            opacity: 0.4,
          }}
        />

        {/* Blob 4 */}
        <motion.div
          animate={{
            x: ["0%", "-15%", "25%", "0%"],
            y: ["0%", "35%", "-10%", "0%"],
            scale: [1, 0.9, 1.4, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: "45%",
            height: "45%",
            borderRadius: "50%",
            background: currentColors[3],
            transition: "background 3s ease-in-out",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Noise Overlay */}
      <div className={styles.waveNoise} />
    </motion.div>
  );
}
