import { AdminAuthProvider } from '@/app/contexts/AdminAuthContext';
import { App } from 'antd';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <App>
        {children}
      </App>
    </AdminAuthProvider>
  );
}
