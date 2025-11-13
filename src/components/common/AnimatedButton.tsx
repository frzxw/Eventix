import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';

export interface AnimatedButtonProps extends ComponentProps<typeof Button> {
  children?: ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ...props }, ref) => {
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
