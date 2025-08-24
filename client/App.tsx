import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLanding from "./pages/AuthLanding";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import TripDetails from "./pages/TripDetails";
import CreateTrip from "./pages/CreateTrip";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SearchResults from "./pages/SearchResults";
import GradientDemo from "./pages/GradientDemo";
import HoverGradientExamples from "./components/HoverGradientExamples";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import PaymentCallback from "./pages/PaymentCallback";
import SettingsTest from "./components/SettingsTest";
import SimpleTranslationTest from "./components/SimpleTranslationTest";
import LanguageTest from "./components/LanguageTest";

function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const hideNavbar =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/check-email' ||
    pathname.startsWith('/verify-email/') ||
    pathname.startsWith('/reset-password/');

  return (
    <div className="min-h-screen bg-background">
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<AuthLanding />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings-test" element={<ProtectedRoute><SettingsTest /></ProtectedRoute>} />
          <Route path="/simple-test" element={<SimpleTranslationTest />} />
          <Route path="/language-test" element={<LanguageTest />} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/notifications/settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
          <Route path="/trip/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/edit-trip/:tripId" element={<ProtectedRoute><PlaceholderPage pageTitle="Edit Trip" /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gradient-demo" element={<GradientDemo />} />
          <Route path="/gradient-examples" element={<HoverGradientExamples />} />
          <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
          <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
