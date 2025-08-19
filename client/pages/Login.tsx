import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  MapPin,
  Camera,
  Users,
  Globe,
  Heart,
  Shield
} from 'lucide-react';
import { useLoginMutation } from '@/store/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { validateEmail, validatePassword, focusFirstInvalid } from '@/lib/validation';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { direction, t } = useLanguage();
  const [login, { isLoading }] = useLoginMutation();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
    loginAsAdmin: false
  });

  const [errors, setErrors] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      focusFirstInvalid(['email', 'password'], nextErrors as any);
      toast({ title: t('login.correctFields', 'Please correct the highlighted fields') });
      return;
    }
    try {
      const res = await login({ email: formData.email, password: formData.password }).unwrap();
      dispatch(setCredentials({ access: res.access, refresh: res.refresh, user: res.user }));
      // Sync with AuthContext for the existing app structure
      authLogin({
        id: String(res.user.id),
        name: res.user.username,
        email: res.user.email,
        role: 'user',
        isVerified: res.user.is_verified,
      });
      navigate(formData.loginAsAdmin ? '/admin' : '/feed');
    } catch (err) {
      toast({
        title: t('login.loginFailed', 'Login failed'),
        description: t('login.loginFailedDesc', 'Please check your credentials and try again.')
      });
      console.error(err);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent relative" dir={direction}>
      {/* Background pattern omitted for brevity */}

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className={`text-center ${direction === 'rtl' ? 'lg:text-right' : 'lg:text-left'} text-white space-y-8`}>
            <div className={`flex items-center justify-center ${direction === 'rtl' ? 'lg:justify-end space-x-reverse' : 'lg:justify-start'} space-x-4`}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fac285223133d4c4690a07a25427a1573%2F7ae77806540645af89506e260a82309c?format=webp&width=800"
                alt="RAHALA"
                className="h-16 w-16 rounded-full object-cover filter brightness-0 invert"
              />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                  <TranslatableText staticKey="auth.appName">RAHALA</TranslatableText>
                </h1>
                <p className="text-blue-100 text-lg mt-2">
                  <TranslatableText staticKey="auth.tagline">The Social Travel Platform for Adventurers</TranslatableText>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xl text-blue-100 leading-relaxed">
                <TranslatableText staticKey="auth.description">
                  Join a community of passionate travelers sharing their experiences, discovering new destinations, and inspiring each other to embark on the next adventure.
                </TranslatableText>
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span>
                    <TranslatableText staticKey="auth.shareTrips">Share your trips</TranslatableText>
                  </span>
                </div>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span>
                    <TranslatableText staticKey="auth.discoverDestinations">Discover new destinations</TranslatableText>
                  </span>
                </div>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <span>
                    <TranslatableText staticKey="auth.connectTravelers">Connect with travelers</TranslatableText>
                  </span>
                </div>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span>
                    <TranslatableText staticKey="auth.getInspired">Get inspired</TranslatableText>
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className={`flex justify-center ${direction === 'rtl' ? 'lg:justify-end space-x-reverse' : 'lg:justify-start'} space-x-8 pt-4`}>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-blue-200 text-sm">
                    <TranslatableText staticKey="auth.travelers">Travelers</TranslatableText>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">120K+</div>
                  <div className="text-blue-200 text-sm">
                    <TranslatableText staticKey="auth.tripsShared">Trips Shared</TranslatableText>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">195+</div>
                  <div className="text-blue-200 text-sm">
                    <TranslatableText staticKey="auth.countries">Countries</TranslatableText>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  <TranslatableText staticKey="login.signInToAccount">Sign In to Your Account</TranslatableText>
                </CardTitle>
                <p className="text-gray-600">
                  <TranslatableText staticKey="login.enterCredentials">Enter your credentials to continue your journey</TranslatableText>
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <TranslatableText staticKey="login.emailAddress">Email Address</TranslatableText>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                      value={formData.email}
                      onChange={(e) => {
                        handleChange('email', e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      className="h-11"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      dir={direction}
                      required
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <TranslatableText staticKey="login.password">Password</TranslatableText>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.enterPassword', 'Enter your password')}
                        value={formData.password}
                        onChange={(e) => {
                          handleChange('password', e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                        }}
                        className={`h-11 ${direction === 'rtl' ? 'pl-10' : 'pr-10'}`}
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                        dir={direction}
                        required
                      />
                      <button
                        type="button"
                        aria-label={t(showPassword ? 'login.hidePassword' : 'login.showPassword', showPassword ? 'Hide password' : 'Show password')}
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-sm text-red-600 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                        <Checkbox
                          id="remember"
                          checked={formData.remember}
                          onCheckedChange={(checked) => handleChange('remember', checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm">
                          <TranslatableText staticKey="login.rememberMe">Remember me</TranslatableText>
                        </Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        <TranslatableText staticKey="login.forgotPassword">Forgot password?</TranslatableText>
                      </Link>
                    </div>

                    <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 p-3 bg-red-50 rounded-lg border border-red-200`}>
                      <Checkbox
                        id="adminLogin"
                        checked={formData.loginAsAdmin}
                        onCheckedChange={(checked) => handleChange('loginAsAdmin', checked as boolean)}
                      />
                      <Label htmlFor="adminLogin" className="text-sm text-red-700 font-medium">
                        <TranslatableText staticKey="login.loginAsAdmin">Login as Administrator</TranslatableText>
                      </Label>
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className={`w-full h-11 ${formData.loginAsAdmin ? 'bg-red-600 hover:bg-red-700' : ''}`}>
                    {formData.loginAsAdmin ? (
                      <>
                        <Shield className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey={isLoading ? 'login.signingIn' : 'login.accessAdminDashboard'}>
                          {isLoading ? 'Signing in...' : 'Access Admin Dashboard'}
                        </TranslatableText>
                      </>
                    ) : (
                      <>
                        <MapPin className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey={isLoading ? 'login.signingIn' : 'login.continueYourJourney'}>
                          {isLoading ? 'Signing in...' : 'Continue Your Journey'}
                        </TranslatableText>
                      </>
                    )}
                  </Button>

                  {/* Social login and sign-up links can be added here */}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
