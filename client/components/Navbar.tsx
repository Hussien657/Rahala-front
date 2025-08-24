import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import TranslatableText from './TranslatableText';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Compass,
  Heart,
  Bell,
  User,
  PlusCircle,
  Search,
  Menu,
  X,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLogoutMutation } from '@/store/authApi';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from './AdvancedSearch';
import { NotificationBadge } from './NotificationBadge';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { t, direction } = useLanguage();
  const dispatch = useDispatch();
  const [logoutReq] = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { icon: Heart, label: t('nav.feed'), path: '/feed' },
    { icon: Compass, label: t('nav.explore'), path: '/explore' },
    { icon: Shield, label: t('nav.subscriptions', 'Subscriptions'), path: '/subscriptions' },
    ...(isAuthenticated ? [
      { icon: Bell, label: t('nav.notifications'), path: '/notifications' },
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken') || '';
      if (refresh) {
        await logoutReq({ refresh }).unwrap();
      }
    } catch (e) {
      // best-effort logout
      console.warn('Logout request failed', e);
    } finally {
      dispatch(clearCredentials());
      logout();
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fac285223133d4c4690a07a25427a1573%2F7ae77806540645af89506e260a82309c?format=webp&width=800"
              alt="RAHALA"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-gray-900">
              RAHALA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.path === '/notifications' ? (
                <NotificationBadge key={item.path} variant="button" showText className="px-3 py-2" />
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Advanced Search Bar & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <AdvancedSearch
              placeholder={t('nav.search')}
              className="w-80"
              maxResults={5}
              showHistory={true}
              showSuggestions={true}
              showPopular={true}
              enableRateLimitHandling={true}
            />

            {isAuthenticated ? (
              <>
                <Button asChild>
                  <Link to="/create-trip">
                    <PlusCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <TranslatableText staticKey="nav.sharetrip">Share Trip</TranslatableText>
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-10 w-10 rounded-full transition-all duration-300 ${isActive('/profile') || isActive('/settings')
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background'
                        }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user?.name}</p>
                          {user?.subscription_status?.is_active && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5">
                              <TranslatableText staticKey="nav.premium" fallback="Premium">Premium</TranslatableText>
                            </Badge>
                          )}
                        </div>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="nav.profile">Profile</TranslatableText>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="nav.settings">Settings</TranslatableText>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <TranslatableText staticKey="nav.admin">Admin Dashboard</TranslatableText>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="nav.logout">Log out</TranslatableText>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">
                    <TranslatableText staticKey="nav.signin">Sign In</TranslatableText>
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">
                    <TranslatableText staticKey="nav.joinnow">Join Now</TranslatableText>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={t('nav.search')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    dir={direction}
                  />
                </form>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <Link
                    to="/profile"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2",
                      isActive('/profile')
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-primary/90 hover:text-primary-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>
                      <TranslatableText staticKey="nav.profile">Profile</TranslatableText>
                    </span>
                  </Link>
                  <Link
                    to="/create-trip"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>
                      <TranslatableText staticKey="nav.sharetrip">Share Trip</TranslatableText>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
