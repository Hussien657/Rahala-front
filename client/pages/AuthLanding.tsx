import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginMutation, useRegisterMutation, useResendVerificationMutation } from '@/store/authApi';
import { setCredentials } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { validateEmail, validatePassword, validateRequired, validatePasswordMatch, focusFirstInvalid } from '@/lib/validation';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import {
  Globe,
  Camera,
  Users,
  Heart,
  Eye,
  EyeOff,
  User,
  UserPlus
} from 'lucide-react';

const AuthLanding = () => {
  const dispatch = useDispatch();
  const { login: authLogin, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { direction, t } = useLanguage();
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [resendVerification, { isLoading: isResendLoading }] = useResendVerificationMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [signInErrors, setSignInErrors] = useState<{ email: string | null; password: string | null }>({ email: null, password: null });
  const [registerErrors, setRegisterErrors] = useState<{
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
  }>({ firstName: null, lastName: null, email: null, password: null, confirmPassword: null });
  const [signInTouched, setSignInTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [registerTouched, setRegisterTouched] = useState<{ firstName: boolean; lastName: boolean; email: boolean; password: boolean; confirmPassword: boolean }>({ firstName: false, lastName: false, email: false, password: false, confirmPassword: false });

  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Register form state - all required fields
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect authenticated users to feed or intended page
  useEffect(() => {
    if (isAuthenticated && !authIsLoading) {
      const from = (location.state as any)?.from?.pathname || '/feed';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authIsLoading, navigate, location]);

  const handleSignInChange = (field: string, value: string) => {
    setSignInData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      email: validateEmail(signInData.email),
      password: validatePassword(signInData.password),
    };
    setSignInErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      focusFirstInvalid(['signin-email', 'signin-password'], nextErrors as any);
      toast({ title: 'Please correct the highlighted fields' });
      return;
    }

    try {
      const res = await loginMutation({ email: signInData.email, password: signInData.password }).unwrap();
      dispatch(setCredentials({ access: res.access, refresh: res.refresh, user: res.user }));
      authLogin({
        id: String(res.user.id),
        name: res.user.username,
        email: res.user.email,
        role: 'user',
        isVerified: res.user.is_verified,
      });
      const from = (location.state as any)?.from?.pathname || '/feed';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Sign in failed:', error);
      toast({
        title: t('auth.loginFailed', 'Login failed'),
        description: t('auth.loginFailedDesc', 'Please check your credentials and try again.')
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      firstName: validateRequired('First name', registerData.firstName),
      lastName: validateRequired('Last name', registerData.lastName),
      email: validateEmail(registerData.email),
      password: validatePassword(registerData.password),
      confirmPassword: validatePasswordMatch(registerData.password, registerData.confirmPassword),
    };
    setRegisterErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      focusFirstInvalid(['register-firstName', 'register-lastName', 'register-email', 'register-password', 'confirm-password'], nextErrors as any);
      toast({ title: 'Please correct the highlighted fields' });
      return;
    }

    try {
      const body = {
        email: registerData.email,
        username: `${registerData.firstName}${registerData.lastName}`.trim() || 'user',
        password: registerData.password,
      };
      await registerMutation(body).unwrap();
      // After successful register, redirect to check-email with prefilled email
      navigate(`/check-email?email=${encodeURIComponent(registerData.email)}`);
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: t('auth.registrationFailed', 'Registration failed'),
        description: t('auth.registrationFailedDesc', 'Please try again later.')
      });
    }
  };

  // Check if forms are valid (for button disable only)
  const isSignInValid = signInData.email.trim() && signInData.password.trim();
  const isRegisterValid = registerData.firstName.trim() && registerData.lastName.trim() &&
    registerData.email.trim() && registerData.password.trim() &&
    registerData.confirmPassword.trim();

  const hasSignInTouched = signInTouched.email || signInTouched.password;
  const hasRegisterTouched = Object.values(registerTouched).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent" dir={direction}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-10 ${direction === 'rtl' ? 'right-10' : 'left-10'} w-32 h-32 border-2 border-white rounded-full`}></div>
        <div className={`absolute top-40 ${direction === 'rtl' ? 'left-20' : 'right-20'} w-24 h-24 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-20 ${direction === 'rtl' ? 'right-1/4' : 'left-1/4'} w-16 h-16 border-2 border-white rounded-full`}></div>
        <div className={`absolute bottom-10 ${direction === 'rtl' ? 'left-10' : 'right-10'} w-20 h-20 border-2 border-white rounded-full`}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

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

          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 h-[85vh] flex flex-col">
              <CardHeader className="text-center pb-4 flex-none">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  <TranslatableText staticKey="auth.welcomeTitle">Welcome to your journey</TranslatableText>
                </CardTitle>
                <p className="text-gray-600">
                  <TranslatableText staticKey="auth.welcomeSubtitle">Sign in or create a new account to start exploring</TranslatableText>
                </p>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">
                      <TranslatableText staticKey="auth.signIn">Sign In</TranslatableText>
                    </TabsTrigger>
                    <TabsTrigger value="register">
                      <TranslatableText staticKey="auth.createAccount">Create Account</TranslatableText>
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} noValidate className="space-y-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">
                          <TranslatableText staticKey="auth.email">Email</TranslatableText> *
                        </Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                          className="h-11"
                          value={signInData.email}
                          onChange={(e) => {
                            handleSignInChange('email', e.target.value);
                            if (signInErrors.email) setSignInErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                          }}
                          onBlur={(e) => {
                            setSignInTouched(prev => ({ ...prev, email: true }));
                            setSignInErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                          }}
                          aria-invalid={!!signInErrors.email && signInTouched.email}
                          aria-describedby="signin-email-error"
                          dir={direction}
                          required
                        />
                        {signInTouched.email && signInErrors.email && (
                          <p id="signin-email-error" className="text-sm text-red-600 mt-1">{signInErrors.email}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">
                          <TranslatableText staticKey="auth.password">Password</TranslatableText> *
                        </Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                            className={`h-11 ${direction === 'rtl' ? 'pl-10' : 'pr-10'}`}
                            value={signInData.password}
                            onChange={(e) => {
                              handleSignInChange('password', e.target.value);
                              if (signInErrors.password) setSignInErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                            }}
                            onBlur={(e) => {
                              setSignInTouched(prev => ({ ...prev, password: true }));
                              setSignInErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                            }}
                            aria-invalid={!!signInErrors.password && signInTouched.password}
                            aria-describedby="signin-password-error"
                            dir={direction}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2`}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {signInTouched.password && signInErrors.password && (
                          <p id="signin-password-error" className="text-sm text-red-600 mt-1">{signInErrors.password}</p>
                        )}
                      </div>

                      {/* Form Validation Message */}
                      {hasSignInTouched && (signInErrors.email || signInErrors.password) && (
                        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-600">
                            <TranslatableText staticKey="auth.correctFields">Please correct the highlighted fields</TranslatableText>
                          </p>
                        </div>
                      )}

                      {/* Sign In Button */}
                      <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={!isSignInValid || isLoginLoading}
                      >
                        {isLoginLoading ? (
                          <TranslatableText staticKey="auth.signingIn">Signing in...</TranslatableText>
                        ) : (
                          <>
                            <User className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            <TranslatableText staticKey="auth.signIn">Sign In</TranslatableText>
                          </>
                        )}
                      </Button>

                      {/* Form Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            <TranslatableText staticKey="auth.progress">Progress</TranslatableText>
                          </span>
                          <span>
                            {Object.values(signInData).filter(value => value.trim()).length}/2
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(Object.values(signInData).filter(value => value.trim()).length / 2) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => navigate('/forgot-password')}
                        >
                          <TranslatableText staticKey="auth.forgotPassword">Forgot your password?</TranslatableText>
                        </button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} noValidate className="space-y-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">
                            <TranslatableText staticKey="auth.firstName">First Name</TranslatableText> *
                          </Label>
                          <Input
                            id="register-firstName"
                            placeholder={t('auth.firstNamePlaceholder', 'First name')}
                            className="h-11"
                            value={registerData.firstName}
                            onChange={(e) => {
                              handleRegisterChange('firstName', e.target.value);
                              if (registerErrors.firstName) setRegisterErrors(prev => ({ ...prev, firstName: validateRequired('First name', e.target.value) }));
                            }}
                            onBlur={(e) => {
                              setRegisterTouched(prev => ({ ...prev, firstName: true }));
                              setRegisterErrors(prev => ({ ...prev, firstName: validateRequired('First name', e.target.value) }));
                            }}
                            aria-invalid={!!registerErrors.firstName && registerTouched.firstName}
                            aria-describedby="register-firstName-error"
                            dir={direction}
                            required
                          />
                          {registerTouched.firstName && registerErrors.firstName && (
                            <p id="register-firstName-error" className="text-sm text-red-600 mt-1">{registerErrors.firstName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">
                            <TranslatableText staticKey="auth.lastName">Last Name</TranslatableText> *
                          </Label>
                          <Input
                            id="register-lastName"
                            placeholder={t('auth.lastNamePlaceholder', 'Last name')}
                            className="h-11"
                            value={registerData.lastName}
                            onChange={(e) => {
                              handleRegisterChange('lastName', e.target.value);
                              if (registerErrors.lastName) setRegisterErrors(prev => ({ ...prev, lastName: validateRequired('Last name', e.target.value) }));
                            }}
                            onBlur={(e) => {
                              setRegisterTouched(prev => ({ ...prev, lastName: true }));
                              setRegisterErrors(prev => ({ ...prev, lastName: validateRequired('Last name', e.target.value) }));
                            }}
                            aria-invalid={!!registerErrors.lastName && registerTouched.lastName}
                            aria-describedby="register-lastName-error"
                            dir={direction}
                            required
                          />
                          {registerTouched.lastName && registerErrors.lastName && (
                            <p id="register-lastName-error" className="text-sm text-red-600 mt-1">{registerErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="register-email">
                          <TranslatableText staticKey="auth.email">Email</TranslatableText> *
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                          className="h-11"
                          value={registerData.email}
                          onChange={(e) => {
                            handleRegisterChange('email', e.target.value);
                            if (registerErrors.email) setRegisterErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                          }}
                          onBlur={(e) => {
                            setRegisterTouched(prev => ({ ...prev, email: true }));
                            setRegisterErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                          }}
                          aria-invalid={!!registerErrors.email && registerTouched.email}
                          aria-describedby="register-email-error"
                          dir={direction}
                          required
                        />
                        {registerTouched.email && registerErrors.email && (
                          <p id="register-email-error" className="text-sm text-red-600 mt-1">{registerErrors.email}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="register-password">
                          <TranslatableText staticKey="auth.password">Password</TranslatableText> *
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.strongPasswordPlaceholder', 'Enter a strong password')}
                            className={`h-11 ${direction === 'rtl' ? 'pl-10' : 'pr-10'}`}
                            value={registerData.password}
                            onChange={(e) => {
                              handleRegisterChange('password', e.target.value);
                              if (registerErrors.password) setRegisterErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                            }}
                            onBlur={(e) => {
                              setRegisterTouched(prev => ({ ...prev, password: true }));
                              setRegisterErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                            }}
                            aria-invalid={!!registerErrors.password && registerTouched.password}
                            aria-describedby="register-password-error"
                            dir={direction}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2`}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {registerTouched.password && registerErrors.password && (
                          <p id="register-password-error" className="text-sm text-red-600 mt-1">{registerErrors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          <TranslatableText staticKey="auth.confirmPassword">Confirm Password</TranslatableText> *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter your password')}
                            className={`h-11 ${direction === 'rtl' ? 'pl-10' : 'pr-10'}`}
                            value={registerData.confirmPassword}
                            onChange={(e) => {
                              handleRegisterChange('confirmPassword', e.target.value);
                              if (registerErrors.confirmPassword) setRegisterErrors(prev => ({ ...prev, confirmPassword: validatePasswordMatch(registerData.password, e.target.value) }));
                            }}
                            onBlur={(e) => {
                              setRegisterTouched(prev => ({ ...prev, confirmPassword: true }));
                              setRegisterErrors(prev => ({ ...prev, confirmPassword: validatePasswordMatch(registerData.password, e.target.value) }));
                            }}
                            aria-invalid={!!registerErrors.confirmPassword && registerTouched.confirmPassword}
                            aria-describedby="confirm-password-error"
                            dir={direction}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2`}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {registerTouched.confirmPassword && registerErrors.confirmPassword && (
                          <p id="confirm-password-error" className="text-sm text-red-600 mt-1">{registerErrors.confirmPassword}</p>
                        )}
                      </div>

                      {/* Form Validation Message */}
                      {hasRegisterTouched && (
                        registerErrors.firstName ||
                        registerErrors.lastName ||
                        registerErrors.email ||
                        registerErrors.password ||
                        registerErrors.confirmPassword
                      ) && (
                        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-600">
                            <TranslatableText staticKey="auth.correctFields">Please correct the highlighted fields</TranslatableText>
                          </p>
                        </div>
                      )}

                      {/* Register Button */}
                      <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={!isRegisterValid || registerData.password !== registerData.confirmPassword || isRegisterLoading}
                      >
                        {isRegisterLoading ? (
                          <TranslatableText staticKey="auth.creatingAccount">Creating account...</TranslatableText>
                        ) : (
                          <>
                            <UserPlus className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            <TranslatableText staticKey="auth.signUp">Sign Up</TranslatableText>
                          </>
                        )}
                      </Button>

                      {/* Form Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            <TranslatableText staticKey="auth.progress">Progress</TranslatableText>
                          </span>
                          <span>
                            {Object.values(registerData).filter(value => value.trim()).length}/5
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(Object.values(registerData).filter(value => value.trim()).length / 5) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Resend Verification */}
                      <div className="text-center text-sm text-gray-600">
                        Didn’t get the verification email?{' '}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={async () => {
                            try {
                              await resendVerification({ email: registerData.email || signInData.email }).unwrap();
                              toast({
                                title: t('auth.verificationSent', 'Verification email sent'),
                                description: t('auth.verificationSentDesc', 'Check your inbox.')
                              });
                            } catch {
                              toast({
                                title: t('auth.verificationFailed', 'Failed to send verification'),
                                description: t('auth.verificationFailedDesc', 'Please try again later.')
                              });
                            }
                          }}
                          disabled={isResendLoading}
                        >
                          <TranslatableText staticKey="auth.resendVerification">Resend verification</TranslatableText>
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
