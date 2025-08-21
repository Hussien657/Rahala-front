import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useConfirmPasswordResetMutation } from '@/store/authApi';
import { validatePassword, validatePasswordMatch } from '@/lib/validation';

const ResetPassword = () => {
  const { uidb64 = '', token = '' } = useParams();
  const navigate = useNavigate();
  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password: string | null; confirm: string | null }>({ password: null, confirm: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      password: validatePassword(password),
      confirm: validatePasswordMatch(password, confirm),
    };
    setErrors(next);
    if (next.password || next.confirm) return;
    try {
      await confirmReset({ uidb64, token, new_password: password }).unwrap();
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch {
      toast({ title: 'Failed to update password', description: 'The link may be invalid or expired.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Set a new password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  required
                />
                {errors.password && <p id="password-error" className="text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={!!errors.confirm}
                  aria-describedby="confirm-error"
                  required
                />
                {errors.confirm && <p id="confirm-error" className="text-sm text-red-600">{errors.confirm}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">Update password</Button>
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link to="/login">Back to Sign In</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;


