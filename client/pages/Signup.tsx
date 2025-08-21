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
  Users,
  ArrowLeft,
  Compass,
  Globe,
  Camera,
  Heart,
  Check,
  Shield
} from 'lucide-react';
import { useRegisterMutation } from '@/store/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { toast } from '@/components/ui/use-toast';
import { validateEmail, validatePassword, validatePasswordMatch, validateRequired, focusFirstInvalid } from '@/lib/validation';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true,
    registerAsAdmin: false
  });

  const [errors, setErrors] = useState<{
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
    agreeToTerms: string | null;
  }>({ firstName: null, lastName: null, email: null, password: null, confirmPassword: null, agreeToTerms: null });

  const validateForm = () => {
    const nextErrors = {
      firstName: validateRequired('First name', formData.firstName),
      lastName: validateRequired('Last name', formData.lastName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
      agreeToTerms: formData.agreeToTerms ? null : 'You must agree to the Terms of Service',
    };
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      focusFirstInvalid(['firstName', 'lastName', 'email', 'password', 'confirmPassword'], nextErrors as any);
      toast({ title: 'Please correct the highlighted fields' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const body = {
        email: formData.email,
        username: `${formData.firstName}${formData.lastName}`.trim() || 'user',
        password: formData.password,
        password_confirm: formData.confirmPassword,
      };
      await register(body).unwrap();
      // After successful register, navigate to login page or auto-login if API returns tokens
      navigate('/login');
    } catch (err) {
      toast({ title: 'Registration failed', description: 'Please try again later.' });
      console.error(err);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const benefits = [
    'Share unlimited travel stories and photos',
    'Connect with travelers from around the world',
    'Discover hidden gems and local insights',
    'Get personalized destination recommendations',
    'Access exclusive travel tips and guides',
    'Join a community of 50,000+ adventurers'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Branding */}
          <div className="text-center lg:text-left text-white space-y-8 lg:pr-8">
            <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fac285223133d4c4690a07a25427a1573%2F7ae77806540645af89506e260a82309c?format=webp&width=800"
                  alt="RAHALA"
                  className="h-12 w-12 rounded-full object-cover filter brightness-0 invert"
                />
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Join Our Community</h1>
                  <p className="text-blue-100 text-lg">Start sharing your adventures today with RAHALA</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xl text-blue-100 leading-relaxed">
                  Create your free account and become part of the world's most inspiring travel community.
                </p>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">What you'll get:</h3>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="bg-white/20 p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-blue-100">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Create Your Account
                </CardTitle>
                <p className="text-gray-600">Join thousands of travelers sharing their stories</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => {
                          handleChange('firstName', e.target.value);
                          if (errors.firstName) setErrors(prev => ({ ...prev, firstName: validateRequired('First name', e.target.value) }));
                        }}
                        className="h-11"
                        aria-invalid={!!errors.firstName}
                        aria-describedby="firstName-error"
                        required
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => {
                          handleChange('lastName', e.target.value);
                          if (errors.lastName) setErrors(prev => ({ ...prev, lastName: validateRequired('Last name', e.target.value) }));
                        }}
                        className="h-11"
                        aria-invalid={!!errors.lastName}
                        aria-describedby="lastName-error"
                        required
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => {
                        handleChange('email', e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      className="h-11"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      required
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => {
                          handleChange('password', e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                        }}
                        className="h-11 pr-10"
                        aria-invalid={!!errors.password}
                        aria-describedby="password-error"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-sm text-red-600 mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          handleChange('confirmPassword', e.target.value);
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: validatePasswordMatch(formData.password, e.target.value) }));
                        }}
                        className="h-11 pr-10"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby="confirmPassword-error"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Admin Registration Option */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adminRegister"
                        checked={formData.registerAsAdmin}
                        onCheckedChange={(checked) => handleChange('registerAsAdmin', checked as boolean)}
                      />
                      <Label htmlFor="adminRegister" className="text-sm text-red-700 font-medium">
                        Register as Administrator
                      </Label>
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    {formData.registerAsAdmin && (
                      <p className="text-xs text-red-600 mt-2">
                        Admin accounts have special privileges and responsibilities for managing the platform.
                      </p>
                    )}
                  </div>

                  {/* Terms and Newsletter */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => {
                          handleChange('agreeToTerms', checked as boolean);
                          if (errors.agreeToTerms) setErrors(prev => ({ ...prev, agreeToTerms: (checked as boolean) ? null : 'You must agree to the Terms of Service' }));
                        }}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-1">{errors.agreeToTerms}</p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleChange('subscribeNewsletter', checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Send me travel tips and destination updates
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={isLoading} className={`w-full h-11 mt-6 ${formData.registerAsAdmin ? 'bg-red-600 hover:bg-red-700' : ''}`}>
                    {formData.registerAsAdmin ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        {isLoading ? 'Creating...' : 'Create Admin Account'}
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        {isLoading ? 'Creating...' : 'Join the Community'}
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or sign up with</span>
                    </div>
                  </div>

                  {/* Social Signup */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" className="h-11">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" className="h-11">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                  </div>

                  {/* Login Link */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary hover:underline font-medium">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
