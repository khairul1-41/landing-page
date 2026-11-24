import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';

// Public & User Pages
import { HomePage } from './pages/HomePage.tsx';
import { CreateLandingPage } from './pages/CreateLandingPage.tsx';
import { UserDashboard } from './pages/UserDashboard.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { PublicLandingPage } from './pages/PublicLandingPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminLandingPages } from './pages/admin/AdminLandingPages.tsx';
import { AdminUsers } from './pages/admin/AdminUsers.tsx';
import { AdminAds } from './pages/admin/AdminAds.tsx';
import { AdminTemplates } from './pages/admin/AdminTemplates.tsx';
import { AdminAnalytics } from './pages/admin/AdminAnalytics.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';
import { AdminAdmins } from './pages/admin/AdminAdmins.tsx';
import { AdminACO } from './pages/admin/AdminACO.tsx';

function Router() {
  const { user, isAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const [pathname, search] = path.split('?');
    setCurrentPath(pathname);
    setSearchParams(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract query param
  const getQueryParam = (key: string): string | undefined => {
    const params = new URLSearchParams(searchParams);
    return params.get(key) || undefined;
  };

  // Handle /admin, /appk, /apk shortcuts
  if (currentPath === '/admin') {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
    return null;
  }

  if (currentPath === '/appk' || currentPath === '/apk') {
    navigate('/admin/templates');
    return null;
  }

  // 1. Admin Area Routes
  if (currentPath === '/admin/login') {
    return <AdminLoginPage navigate={navigate} />;
  }

  if (currentPath.startsWith('/admin')) {
    return (
      <AdminLayout currentPath={currentPath} navigate={navigate}>
        {currentPath === '/admin/dashboard' && <AdminDashboard navigate={navigate} />}
        {currentPath === '/admin/landing-pages' && <AdminLandingPages navigate={navigate} />}
        {currentPath === '/admin/users' && <AdminUsers />}
        {currentPath === '/admin/advertisements' && <AdminAds />}
        {currentPath === '/admin/aco' && <AdminACO />}
        {currentPath === '/admin/admins' && <AdminAdmins />}
        {currentPath === '/admin/templates' && <AdminTemplates />}
        {currentPath === '/admin/analytics' && <AdminAnalytics />}
        {currentPath === '/admin/settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // 2. Public Generated Landing Page Route: /p/:slug
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace('/p/', '').replace(/\/$/, '');
    return <PublicLandingPage slug={slug} navigate={navigate} />;
  }

  // 3. User & Standard Public Pages (Rendered with Navbar & Footer)
  let pageContent: React.ReactNode = null;

  if (currentPath === '/') {
    pageContent = <HomePage navigate={navigate} />;
  } else if (currentPath === '/create') {
    const editId = getQueryParam('id');
    pageContent = <CreateLandingPage navigate={navigate} editId={editId} />;
  } else if (currentPath === '/login' || currentPath === '/register') {
    pageContent = (
      <AuthPage
        navigate={navigate}
        initialMode={currentPath === '/register' ? 'register' : 'login'}
      />
    );
  } else if (currentPath === '/dashboard') {
    if (!loading && !user) {
      navigate('/login');
      return null;
    }
    pageContent = <UserDashboard navigate={navigate} />;
  } else {
    pageContent = <NotFoundPage navigate={navigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1 flex flex-col">{pageContent}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
        <OfflineIndicator />
      </AuthProvider>
    </ToastProvider>
  );
}
