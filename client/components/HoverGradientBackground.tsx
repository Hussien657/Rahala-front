import React from 'react';
import { cn } from '@/lib/utils';

interface HoverGradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Custom gradient colors - defaults to primary, blue-600, accent
   */
  fromColor?: string;
  viaColor?: string;
  viaHoverColor?: string;
  toColor?: string;
  /**
   * Transition duration - defaults to 500ms
   */
  transitionDuration?: string;
}

const HoverGradientBackground: React.FC<HoverGradientBackgroundProps> = ({
  children,
  className = "",
  fromColor = "from-primary",
  viaColor = "via-blue-600",
  viaHoverColor = "hover:via-blue-500",
  toColor = "to-accent",
  transitionDuration = "duration-500"
}) => {
  return (
    <div 
      className={cn(
        "min-h-screen bg-gradient-to-br transition-all ease-in-out",
        fromColor,
        viaColor,
        viaHoverColor,
        toColor,
        transitionDuration,
        className
      )}
    >
      {children}
    </div>
  );
};

export default HoverGradientBackground;
