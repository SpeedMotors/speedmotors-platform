import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)" } : {}}
      className={cn(
        "bg-charcoal-800/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden transition-colors",
        hoverEffect && "hover:border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4 border-b border-white/5", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-xl font-display font-semibold text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4 border-t border-white/5", className)} {...props}>
    {children}
  </div>
);

export default Card;
