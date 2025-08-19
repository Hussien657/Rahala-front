import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ArrowLeft, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

const NotFound = () => {
  const location = useLocation();
  const { direction } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent relative flex items-center justify-center px-4" dir={direction}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-10 ${direction === 'rtl' ? 'right-10' : 'left-10'} w-32 h-32 border-2 border-white rounded-full`}></div>
        <div className={`absolute top-40 ${direction === 'rtl' ? 'left-20' : 'right-20'} w-24 h-24 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-20 ${direction === 'rtl' ? 'right-1/4' : 'left-1/4'} w-16 h-16 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-10 ${direction === 'rtl' ? 'left-10' : 'right-10'} w-20 h-20 border-2 border-white rounded-full`}></div>
      </div>

      <Card className="max-w-md w-full shadow-2xl border-0 relative z-10">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              <TranslatableText staticKey="notFound.title">Destination Not Found</TranslatableText>
            </h2>
            <p className="text-gray-600">
              <TranslatableText staticKey="notFound.description">
                Looks like you've wandered off the beaten path! This destination doesn't exist in our travel guide.
              </TranslatableText>
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full h-11 hover:scale-105 transition-transform">
              <Link to="/">
                <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="notFound.backToHome">Back to Home Base</TranslatableText>
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full h-11 hover:scale-105 transition-transform">
              <Link to="/explore">
                <Compass className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="notFound.exploreDestinations">Explore Destinations</TranslatableText>
              </Link>
            </Button>

            {/* Additional help text */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">
                <TranslatableText staticKey="notFound.needHelp">Need help finding your way?</TranslatableText>
              </p>
              <Button variant="ghost" asChild className="w-full text-primary">
                <Link to="/login">
                  <TranslatableText staticKey="notFound.signIn">Sign in to access more features</TranslatableText>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
