import React from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';

interface SectionTransitionProps {
  children: React.ReactNode;
  animationKey: string;
  direction?: number;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({ 
  children, 
  animationKey, 
  direction = 1 
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Premium, subtle easing curve (Apple-like smooth stop)
  const premiumEase = [0.25, 0.1, 0.25, 1];

  const variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 15 : -15,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'tween', duration: 0.35, ease: premiumEase },
        opacity: { duration: 0.35, ease: premiumEase }
      }
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir < 0 ? 15 : -15,
      opacity: 0,
      transition: {
        x: { type: 'tween', duration: 0.28, ease: premiumEase },
        opacity: { duration: 0.28, ease: premiumEase }
      }
    })
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={animationKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="w-full min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
