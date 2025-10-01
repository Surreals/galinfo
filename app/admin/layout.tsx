import { AdminAuthProvider } from '@/app/contexts/AdminAuthContext';
import { MenuProvider } from '@/app/contexts/MenuContext';
import ProtectedAdminRoute from '@/app/components/ProtectedAdminRoute';
import { App } from 'antd';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <MenuProvider>
        <App>
          <ProtectedAdminRoute>
            {children}
          </ProtectedAdminRoute>
        </App>
      </MenuProvider>
    </AdminAuthProvider>
  );
}
