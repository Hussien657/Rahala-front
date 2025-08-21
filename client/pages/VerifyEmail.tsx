import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { useVerifyEmailMutation } from '@/store/authApi';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

const VerifyEmail = () => {
  const { uidb64 = '', token = '' } = useParams();
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const [verify] = useVerifyEmailMutation();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const run = async () => {
      try {
        await verify({ uidb64, token }).unwrap();
        setStatus('success');
        setTimeout(() => navigate('/login'), 2000);
      } catch {
        setStatus('error');
      }
    };
    run();
  }, [uidb64, token, verify, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent relative flex items-center justify-center px-4 py-10" dir={direction}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-10 ${direction === 'rtl' ? 'right-10' : 'left-10'} w-32 h-32 border-2 border-white rounded-full`}></div>
        <div className={`absolute top-40 ${direction === 'rtl' ? 'left-20' : 'right-20'} w-24 h-24 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-20 ${direction === 'rtl' ? 'right-1/4' : 'left-1/4'} w-16 h-16 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-10 ${direction === 'rtl' ? 'left-10' : 'right-10'} w-20 h-20 border-2 border-white rounded-full`}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className={`inline-flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 text-white hover:text-blue-100 transition-colors`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              <TranslatableText staticKey="notFound.backToHome">Back to Home</TranslatableText>
            </span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'success' ? (
                <TranslatableText staticKey="verifyEmail.emailVerified">Email verified</TranslatableText>
              ) : status === 'error' ? (
                <TranslatableText staticKey="verifyEmail.verificationFailed">Verification failed</TranslatableText>
              ) : (
                <TranslatableText staticKey="verifyEmail.verifying">Verifying...</TranslatableText>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center">
              {status === 'success' ? (
                <div className="relative">
                  <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
                  <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-green-600 animate-ping"></div>
                </div>
              ) : status === 'error' ? (
                <XCircle className="h-16 w-16 text-red-600" />
              ) : (
                <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              )}
            </div>

            {status === 'success' && (
              <div className="space-y-3">
                <p className="text-green-700 font-medium">
                  <TranslatableText staticKey="verifyEmail.verificationSuccess">
                    Your email has been successfully verified!
                  </TranslatableText>
                </p>
                <p className="text-gray-600 text-sm">
                  <TranslatableText staticKey="verifyEmail.redirectingToSignIn">
                    Redirecting to sign in...
                  </TranslatableText>
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-red-700 font-medium">
                    <TranslatableText staticKey="verifyEmail.verificationError">
                      We couldn't verify your email. Please try again.
                    </TranslatableText>
                  </p>
                  <p className="text-gray-600 text-sm">
                    <TranslatableText staticKey="verifyEmail.linkInvalidOrExpired">
                      The link is invalid or expired.
                    </TranslatableText>
                  </p>
                </div>
                <div className="space-y-3">
                  <Button asChild className="w-full h-11 hover:scale-105 transition-transform">
                    <Link to="/login">
                      <TranslatableText staticKey="verifyEmail.backToSignIn">Back to Sign In</TranslatableText>
                    </Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full h-11 hover:scale-105 transition-transform">
                    <Link to="/register">
                      <TranslatableText staticKey="auth.signUp">Sign Up Again</TranslatableText>
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'pending' && (
              <div className="space-y-3">
                <p className="text-gray-600">
                  <TranslatableText staticKey="verifyEmail.verifying">Verifying...</TranslatableText>
                </p>
                <p className="text-sm text-gray-500">
                  <TranslatableText staticKey="common.pleaseWait">Please wait while we verify your email address.</TranslatableText>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;


