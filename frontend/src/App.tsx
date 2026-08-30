import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { NetworkProvider } from './context/NetworkContext';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CommerceProvider } from './context/CommerceContext';
import { CartProvider } from './context/CartContext';
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
  const { currentTab, isMobile } = useNavigation();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
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
        return <DashboardPage />;
    }
  };

  if (isMobile) {
    return <MobileLayout>{renderContent()}</MobileLayout>;
  }

  return <DesktopLayout>{renderContent()}</DesktopLayout>;
};

export function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <NetworkProvider>
          <ToastProvider>
            <NavigationProvider>
              <CommerceProvider>
                <CartProvider>
                  <MainApp />
                </CartProvider>
              </CommerceProvider>
            </NavigationProvider>
          </ToastProvider>
        </NetworkProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
