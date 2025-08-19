import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HoverGradientExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Hover Gradient Examples</h1>
        <p className="text-muted-foreground">
          Different ways to implement the hover gradient background effect
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSS Class Example */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Class Approach</CardTitle>
            <CardDescription>
              Using the .hover-gradient utility class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hover-gradient rounded-lg p-6 text-white text-center min-h-[200px] flex items-center justify-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Hover me!</h3>
                <p className="text-sm opacity-90">
                  This uses the .hover-gradient CSS class
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <code className="bg-muted p-1 rounded">
                className="hover-gradient"
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Inline Tailwind Example */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Tailwind Classes</CardTitle>
            <CardDescription>
              Using Tailwind classes directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-primary via-blue-600 to-accent hover:via-blue-500 transition-all duration-500 ease-in-out rounded-lg p-6 text-white text-center min-h-[200px] flex items-center justify-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Hover me too!</h3>
                <p className="text-sm opacity-90">
                  This uses inline Tailwind classes
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <code className="bg-muted p-1 rounded text-xs">
                bg-gradient-to-br from-primary via-blue-600 to-accent hover:via-blue-500 transition-all duration-500
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Button Example */}
        <Card>
          <CardHeader>
            <CardTitle>Button with Hover Gradient</CardTitle>
            <CardDescription>
              Applying the effect to buttons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="hover-gradient border-0 text-white font-semibold px-8 py-3">
              Gradient Button
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:via-blue-500 transition-all duration-500 border-0 text-white font-semibold px-8 py-3"
            >
              Inline Gradient Button
            </Button>
          </CardContent>
        </Card>

        {/* Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Card with Gradient Background</CardTitle>
            <CardDescription>
              Cards with hover gradient effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hover-gradient rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Gradient Card</h3>
              <p className="opacity-90 mb-4">
                This card has a beautiful gradient background that changes on hover.
              </p>
              <Button 
                variant="outline" 
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Example */}
      <Card>
        <CardHeader>
          <CardTitle>Full Screen Background</CardTitle>
          <CardDescription>
            For full-screen gradient backgrounds, visit the dedicated demo page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/gradient-demo">
              View Full Screen Demo
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HoverGradientExamples;
