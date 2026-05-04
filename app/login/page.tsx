'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Mail, ArrowRight, Lock, ScanFace, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callback = searchParams.get('callback') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check credentials via mock DB logic
    const { db } = await import('@/lib/db');
    const success = await db.verifyCredentials(email, password);
    
    if (success) {
      router.push(callback);
    } else {
      setLoading(false);
      alert("Invalid credentials. Hint: use 'kalcross' / '000000'");
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const result = await authenticateWithBiometrics();
    if (result.success) {
      setTimeout(() => router.push(callback), 800);
    } else {
      setLoading(false);
      alert("Biometric authentication failed or cancelled.");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?callback=${encodeURIComponent(callback)}`,
      },
    });
    
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="liquid-glass p-12 rounded-[60px] max-w-lg w-full border border-white/30"
    >
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-light mb-2">Welcome Back</h1>
        <p className="text-gray-400 font-light">Sign in with [kalcross / 000000]</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-4">ID or Email</label>
          <input 
            type="text" 
            placeholder="kalcross"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/40 border border-white/20 rounded-full py-5 px-8 outline-none focus:border-blue-500 transition-all text-lg"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-4">Password</label>
          <input 
            type="password" 
            placeholder="000000"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/40 border border-white/20 rounded-full py-5 px-8 outline-none focus:border-blue-500 transition-all text-lg"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-6 rounded-full text-xl font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          {loading && !bioAvailable ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
        </button>
      </form>

      {bioAvailable && (
        <button 
          onClick={handleBiometricLogin}
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-3 bg-blue-500 text-white py-6 rounded-full text-xl font-medium hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ScanFace className="w-6 h-6" />}
          Sign In with Face ID
        </button>
      )}

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white/20 backdrop-blur-md text-gray-400 font-light">OR CONTINUE WITH</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-full hover:bg-gray-50 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="font-medium">Google</span>
        </button>
        <button 
          onClick={() => handleSocialLogin('apple')}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-black text-white py-4 rounded-full hover:bg-gray-900 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          <span className="font-medium">Apple</span>
        </button>
      </div>

      <p className="text-center mt-10 text-gray-400 font-light cursor-pointer hover:text-gray-600 transition-colors">
        Don't have an account? <span className="text-blue-500 font-normal">Create one</span>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="px-6 flex items-center justify-center notch-safe-hero notch-safe-bottom">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
