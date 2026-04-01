import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Employer Login | TeachNow',
  description: 'Sign in to your employer account to post jobs and manage applications.',
  robots: 'noindex',
};

export default function EmployerLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
