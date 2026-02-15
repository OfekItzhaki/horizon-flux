import { useEffect } from 'react';

export default function LoginPage() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      // Save token and redirect home
      localStorage.setItem('tasks_management_token', accessToken);
      window.location.href = '/';
      return;
    }

    const ssoUrl = import.meta.env.VITE_AUTH_HUB_URL || 'http://localhost:5174';
    const loginUrl = ssoUrl.endsWith('/login') ? ssoUrl : `${ssoUrl}/login`;
    const returnUrl = window.location.href; // Use full URL to include current path if needed
    window.location.href = `${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-violet-500/20"></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Horizon Flux
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Refining Your Session...
          </p>
        </div>
      </div>
    </div>
  );
}
