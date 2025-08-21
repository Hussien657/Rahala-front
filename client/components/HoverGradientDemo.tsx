import React from 'react';

interface HoverGradientDemoProps {
  children?: React.ReactNode;
  className?: string;
}

const HoverGradientDemo: React.FC<HoverGradientDemoProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`hover-gradient-bg ${className}`}>
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Hover Gradient Background
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Hover over this area to see the gradient transition effect
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-sm">
              Background: min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent
            </p>
            <p className="text-sm mt-2">
              On hover: via color changes to blue-500 with smooth transition
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default HoverGradientDemo;
