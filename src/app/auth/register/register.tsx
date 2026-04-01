'use client';

import RegisterForm from '@/components/auth/RegisterForm/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register at TeachNow</h1>
        <RegisterForm />
      </div>
    </div>
  );
}