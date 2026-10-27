import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { shouldAnimate } from '../../utils/animationConfig';

interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const MotionPage: React.FC<MotionPageProps> = ({ children, className = '', id, style }) => {
  if (!shouldAnimate()) {
    return (
      <div id={id} style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MotionGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  id?: string;
  style?: React.CSSProperties;
}

export const MotionGrid: React.FC<MotionGridProps> = ({
  children,
  className = '',
  staggerDelay = 0.05,
  id,
  style,
}) => {
  if (!shouldAnimate()) {
    return (
      <div id={id} style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  id,
  style,
}) => {
  if (!shouldAnimate()) {
    return (
      <div id={id} style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: 'easeOut' },
        },
      }}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.18 } } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MotionItemProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const MotionItem: React.FC<MotionItemProps> = ({ children, className = '', id, style }) => {
  if (!shouldAnimate()) {
    return (
      <div id={id} style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedCounterProps {
  value: string | number;
  durationMs?: number;
}

/**
 * AnimatedCounter parses numeric values inside strings (like '₹12,400', '1,420', '5.0 Acres', '99.98%')
 * and smoothly animates from 0 up to target number on mount.
 * If animations are disabled or value is non-numeric, it renders the raw value instantly.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, durationMs = 800 }) => {
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate() || typeof value === 'undefined' || value === null) {
      setDisplayValue(value);
      return;
    }

    const str = String(value).trim();
    // Match optional prefix, integer or float with optional commas, and optional suffix
    // Example: "₹1,25,000", "5.0 Acres", "99.98%", "1,420", "50+"
    const regex = /^([^\d.]*)(\d+(?:[,\d]*\.\d+|\d*|\d+))([^\d.]*)$/;
    const match = str.match(regex);

    if (!match) {
      // Non-numeric string like "Grade A (Prime)" or "Tomato (Hybrid)"
      setDisplayValue(value);
      return;
    }

    const prefix = match[1];
    const rawNumberStr = match[2];
    const suffix = match[3];

    const hasComma = rawNumberStr.includes(',');
    const hasDecimal = rawNumberStr.includes('.');
    const decimalPlaces = hasDecimal ? rawNumberStr.split('.')[1].length : 0;
    const targetNumber = parseFloat(rawNumberStr.replace(/,/g, ''));

    if (isNaN(targetNumber) || targetNumber === 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const updateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNumber = targetNumber * easeProgress;

      let formattedNumber: string;
      if (hasDecimal) {
        formattedNumber = currentNumber.toFixed(decimalPlaces);
      } else {
        formattedNumber = Math.round(currentNumber).toString();
      }

      if (hasComma) {
        // Format with commas (Indian/standard number formatting)
        const parts = formattedNumber.split('.');
        parts[0] = Number(parts[0]).toLocaleString('en-IN');
        formattedNumber = parts.join('.');
      }

      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        setDisplayValue(value);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, durationMs]);

  return <span>{displayValue}</span>;
};
