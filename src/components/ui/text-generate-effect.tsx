import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  words,
  className,
  duration = 0.5,
}) => {
  // Split into words to manage layout safely (prevents breaking inside words)
  const wordsArray = words.split(" ");

  // Calculate delay per character to match total duration
  const totalChars = words.length;
  const delayPerChar = duration / (totalChars || 1);

  // Helper to get global character index for delay calculation
  let charCounter = 0;

  return (
    <div
      className={cn(
        "font-bold tracking-tight text-neutral-900 dark:text-neutral-100",
        className
      )}
    >
      <div className="inline-flex flex-wrap justify-center gap-x-[0.3em] gap-y-1">
        {wordsArray.map((word, wordIndex) => {
          const isLastWord = wordIndex === wordsArray.length - 1;
          const wordChars = word.split("");

          return (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {wordChars.map((char, charIndex) => {
                const currentDelay = charCounter * delayPerChar;
                charCounter++;

                return (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.3,
                      delay: currentDelay,
                      ease: "easeOut"
                    }}
                    className={cn(
                      "inline-block",
                      isLastWord ? "text-violet-500" : "text-black dark:text-white"
                    )}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
};
