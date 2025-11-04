import { motion } from 'motion/react';
import { Button, type ButtonProps } from '../ui/button';
import { forwardRef } from 'react';

export interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ripple = true, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
