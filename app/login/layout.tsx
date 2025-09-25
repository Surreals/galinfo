import { AdminAuthProvider } from '@/app/contexts/AdminAuthContext';
import { App } from 'antd';

export default function LoginLayout({
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
