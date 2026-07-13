"use client";

import React from 'react';
import { LoginForm } from '../../../components/auth/LoginForm';
import AuthLayout from '../layout';
import { Language } from '../../../lib/i18n';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateRegister: () => void;
  language?: Language;
}

export default function LoginPage({ onLogin, onNavigateRegister, language = 'fr' }: LoginPageProps) {
  // Access global router state or simulate it (via modifying window location or parent state callback)
  const handleNavigateForgotPassword = () => {
    // In our Vite React setup, we can dispatch a custom navigation event or change state
    // Let's search for the window listener or handle it by trigger
    const event = new CustomEvent('floussi_navigate', { detail: 'forgot-password' });
    window.dispatchEvent(event);
  };

  const handleNavigateGuest = () => {
    const event = new CustomEvent('floussi_navigate', { detail: 'dashboard' });
    window.dispatchEvent(event);
  };

  return (
    <AuthLayout>
      <LoginForm
        onLogin={onLogin}
        onNavigateRegister={onNavigateRegister}
        onNavigateForgotPassword={handleNavigateForgotPassword}
        onNavigateGuest={handleNavigateGuest}
        language={language}
      />
    </AuthLayout>
  );
}
