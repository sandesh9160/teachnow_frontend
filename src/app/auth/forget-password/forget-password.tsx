'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm/ResetPasswordForm';

export default function ForgetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
}