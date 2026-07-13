"use client";

import React from 'react';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import AuthLayout from '../layout';
import { Language } from '../../../lib/i18n';

interface RegisterPageProps {
  onRegister: () => void;
  onNavigateLogin: () => void;
  language?: Language;
}

export default function RegisterPage({ onRegister, onNavigateLogin, language = 'fr' }: RegisterPageProps) {
  return (
    <AuthLayout>
      <RegisterForm
        onRegister={onRegister}
        onNavigateLogin={onNavigateLogin}
        language={language}
      />
    </AuthLayout>
  );
}
