import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useRequestPasswordResetMutation } from '@/store/authApi';
import { validateEmail } from '@/lib/validation';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const { direction, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;

    try {
      await requestReset({ email }).unwrap();
      toast({
        title: t('forgotPassword.resetLinkSent', 'Reset link sent'),
        description: t('forgotPassword.resetLinkSentDesc', 'Check your email inbox.')
      });
      // Clear the form after successful submission
      setEmail('');
      setError(null);
    } catch {
      toast({
        title: t('forgotPassword.failedToSend', 'Failed to send reset link'),
        description: t('forgotPassword.failedToSendDesc', 'Please try again later.')
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent relative" dir={direction}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-10 ${direction === 'rtl' ? 'right-10' : 'left-10'} w-32 h-32 border-2 border-white rounded-full`}></div>
        <div className={`absolute top-40 ${direction === 'rtl' ? 'left-20' : 'right-20'} w-24 h-24 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-20 ${direction === 'rtl' ? 'right-1/4' : 'left-1/4'} w-16 h-16 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-10 ${direction === 'rtl' ? 'left-10' : 'right-10'} w-20 h-20 border-2 border-white rounded-full`}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link
            to="/login"
            className={`inline-flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 text-white hover:text-blue-100 transition-colors`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              <TranslatableText staticKey="forgotPassword.backToLogin">Back to login</TranslatableText>
            </span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              <TranslatableText staticKey="forgotPassword.title">Forgot your password?</TranslatableText>
            </CardTitle>
            <p className="text-gray-600 mt-2">
              <TranslatableText staticKey="forgotPassword.description">
                Enter your email address and we'll send you a link to reset your password.
              </TranslatableText>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <TranslatableText staticKey="forgotPassword.emailAddress">Email address</TranslatableText>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder', 'your@email.com')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (error) setError(null);
                  }}
                  aria-invalid={!!error}
                  aria-describedby="email-error"
                  className="h-11"
                  dir={direction}
                  required
                />
                {error && <p id="email-error" className="text-sm text-red-600">{error}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11">
                {isLoading ? (
                  <TranslatableText staticKey="forgotPassword.sending">Sending...</TranslatableText>
                ) : (
                  <>
                    <Mail className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <TranslatableText staticKey="forgotPassword.sendResetLink">Send reset link</TranslatableText>
                  </>
                )}
              </Button>

              {/* Remember Password Link */}
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  <TranslatableText staticKey="forgotPassword.rememberPassword">Remember your password?</TranslatableText>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


