import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { LoginPage } from './pages/LoginPage';
import { DesktopLayout } from './layouts/DesktopLayout';
import { MobileLayout } from './layouts/MobileLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NewOrderPOSPage } from './pages/NewOrderPOSPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { OutboxPage } from './pages/OutboxPage';
import { UsersPage } from './pages/UsersPage';
import { TenantsPage } from './pages/TenantsPage';
import { TenantRouteGuard } from './components/TenantRouteGuard';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'pos':
        return <NewOrderPOSPage />;
      case 'customers':
        return <CustomersPage />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'outbox':
        return <OutboxPage />;
      case 'users':
        return <UsersPage />;
      case 'tenants':
        return (
          <TenantRouteGuard>
            <TenantsPage />
          </TenantRouteGuard>
        );
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  if (isMobile) {
    return (
      <MobileLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
        {renderContent()}
      </MobileLayout>
    );
  }

  return (
    <DesktopLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderContent()}
    </DesktopLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <MainApp />
      </NetworkProvider>
    </AuthProvider>
  );
}

export default App;

