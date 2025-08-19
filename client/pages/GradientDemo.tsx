import React, { useState } from 'react';
import HoverGradientBackground from '@/components/HoverGradientBackground';
import HoverGradientDemo from '@/components/HoverGradientDemo';
import { Button } from '@/components/ui/button';

const GradientDemo: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'css-class' | 'component'>('css-class');

  if (currentDemo === 'css-class') {
    return (
      <HoverGradientDemo>
        <div className="mt-8 space-y-4">
          <Button 
            onClick={() => setCurrentDemo('component')}
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Switch to Component Demo
          </Button>
          <p className="text-sm opacity-75">
            This demo uses the CSS class approach (.hover-gradient-bg)
          </p>
        </div>
      </HoverGradientDemo>
    );
  }

  return (
    <HoverGradientBackground>
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Component-Based Hover Gradient
          </h1>
          <p className="text-lg mb-6 opacity-90">
            This uses the HoverGradientBackground component
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
            <p className="text-sm">
              Customizable props: fromColor, viaColor, viaHoverColor, toColor, transitionDuration
            </p>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={() => setCurrentDemo('css-class')}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Switch to CSS Class Demo
            </Button>
            <p className="text-sm opacity-75">
              This demo uses the component approach with props
            </p>
          </div>
        </div>
      </div>
    </HoverGradientBackground>
  );
};

export default GradientDemo;
