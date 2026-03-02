import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  active: boolean;
}

export default function WaveformVisualizer({ active }: WaveformVisualizerProps) {
  const bars = 24;

  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-primary/40"
          animate={
            active
              ? {
                  height: [4, Math.random() * 20 + 6, 4],
                }
              : { height: 4 }
          }
          transition={
            active
              ? {
                  duration: 0.6 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.03,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
