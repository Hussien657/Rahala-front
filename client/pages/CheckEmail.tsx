import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useResendVerificationMutation } from '@/store/authApi';

const useQuery = () => new URLSearchParams(useLocation().search);

const CheckEmail = () => {
  const query = useQuery();
  const email = useMemo(() => query.get('email') || '', [query]);
  const [resend, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    try {
      await resend({ email }).unwrap();
      toast({ title: 'Verification email sent', description: 'Check your inbox.' });
    } catch (e) {
      toast({ title: 'Failed to send verification', description: 'Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Verify your email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <p className="text-gray-700">
              We sent a verification link to
              {email ? <span className="font-semibold"> {email}</span> : ' your email'}.
            </p>
            <p className="text-sm text-gray-600">Click the link in the email to activate your account.</p>
            <div className="space-y-3 pt-2">
              <Button onClick={handleResend} disabled={!email || isLoading} className="w-full">
                Resend verification email
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmail;


