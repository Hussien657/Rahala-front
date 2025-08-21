import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Construction, ArrowLeft, MessageSquare, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

interface PlaceholderPageProps {
  pageTitle: string;
  description?: string;
}

const PlaceholderPage = ({
  pageTitle,
  description
}: PlaceholderPageProps) => {
  const { direction, t } = useLanguage();

  const defaultDescription = t('placeholder.defaultDescription', "This page is currently under development. We're working hard to bring you an amazing experience!");
  const finalDescription = description || defaultDescription;

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
              <Construction className="h-10 w-10 text-primary" />
            </div>

            {/* Coming Soon Badge */}
            <div className="flex justify-center mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Clock className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                <TranslatableText staticKey="placeholder.comingSoon">Coming Soon</TranslatableText>
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-600 mb-2">
              {finalDescription}
            </p>
            <p className="text-sm text-primary font-medium">
              <TranslatableText staticKey="placeholder.stayTuned">Stay tuned for updates!</TranslatableText>
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full h-11 hover:scale-105 transition-transform">
              <Link to="/">
                <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="placeholder.backToHome">Back to Home</TranslatableText>
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full h-11 hover:scale-105 transition-transform">
              <Link to="/feed">
                <TranslatableText staticKey="placeholder.exploreFeed">Explore Feed</TranslatableText>
              </Link>
            </Button>

            {/* Additional Navigation Options */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/explore">
                  <TranslatableText staticKey="notFound.exploreDestinations">Explore</TranslatableText>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <TranslatableText staticKey="auth.signIn">Sign In</TranslatableText>
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500 mb-3">
              <TranslatableText staticKey="placeholder.feedbackPrompt">
                Want to help us improve? Let us know what you'd like to see on this page!
              </TranslatableText>
            </p>
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
              <MessageSquare className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              <TranslatableText staticKey="placeholder.sendFeedback">Send Feedback</TranslatableText>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
