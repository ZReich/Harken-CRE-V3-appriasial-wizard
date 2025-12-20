// Animation utilities and variants for Framer Motion
// Used throughout the comps redesign

import { Variants } from 'framer-motion';
import { transitions, easings } from './design-tokens';

// Page transition animations
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.out,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: easings.in,
    },
  },
};

// Card animations with stagger
export const cardContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const cardItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.out,
    },
  },
};

// Card hover animation
export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: easings.out,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: easings.out,
    },
  },
};

// Slide in from right (for filters, sidebars)
export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.default,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easings.in,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.default,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easings.in,
    },
  },
};

// Fade animation
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Scale animation (for modals, popovers)
export const scaleIn: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easings.out,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: easings.in,
    },
  },
};

// Accordion/collapse animation
export const collapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easings.inOut,
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.out,
    },
  },
};

// List item animations (for delete, add)
export const listItem: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
  },
  animate: {
    opacity: 1,
    height: 'auto',
    marginBottom: 16,
    transition: {
      duration: 0.3,
      ease: easings.out,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      duration: 0.3,
      ease: easings.inOut,
    },
  },
};

// Chip/badge scale in animation
export const chipScale: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Pulse animation for notifications/badges
export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.inOut,
    },
  },
};

// Shimmer loading animation
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Button press animation
export const buttonPress = {
  whileTap: {
    scale: 0.97,
    transition: {
      duration: 0.1,
    },
  },
};

// Icon spin animation
export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Bounce animation
export const bounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.inOut,
    },
  },
};

// View transition (for switching between cards/table/map views)
export const viewTransition: Variants = {
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
  enter: {
    opacity: 0,
    scale: 0.98,
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.out,
    },
  },
};

// Stagger children utility
export const staggerContainer = (staggerDelay: number = 0.05): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

// Number counter animation (for financial metrics)
export const counterAnimation = {
  from: 0,
  duration: 1,
  ease: easings.out,
};


















