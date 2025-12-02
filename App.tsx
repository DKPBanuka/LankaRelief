import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Donations } from './pages/Donations';
import { PersonFinder } from './pages/PersonFinder';
import { Volunteers } from './pages/Volunteers';
import AdminApp from './pages/Admin/ra/AdminApp';


const AppContent: React.FC = () => {
  const [page, setPage] = useState('dashboard');
  const { isAdmin, loading } = useAuth();

  const renderPage = () => {
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'donations': return <Donations />;
      case 'finder': return <PersonFinder />;
      case 'volunteers': return <Volunteers />;
      case 'admin':
        return isAdmin ? <AdminApp /> : <Dashboard />;

      default: return <Dashboard />;
    }
  };

  if (page === 'admin') {
    return isAdmin ? <AdminApp /> : <Dashboard />;
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;