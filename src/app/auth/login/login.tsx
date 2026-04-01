'use client';

import LoginForm from '@/components/auth/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to TeachNow</h1>
        <LoginForm />
      </div>
    </div>
  );
}