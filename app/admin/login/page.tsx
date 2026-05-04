'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [id, setId] = useState(''); // This replaces the generic 'email' state for login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Sign Up Logic with ID and Name (Default: Unapproved)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: id,
              full_name: name,
              is_approved: email === 'sejin9404@gmail.com', // Auto-approve only Sejin
            },
            emailRedirectTo: `${window.location.origin}/admin/login`,
          }
        });

        if (signUpError) throw signUpError;
        
        // Record ID mapping in the new table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('admin_profiles')
            .insert({
              id: data.user.id,
              username: id,
              email: email
            });
          
          if (profileError) console.error('Profile recording error:', profileError);
        }

        if (data.user && data.user.identities?.length === 0) {
          throw new Error('This email is already registered. Please login instead.');
        }

        setError(email === 'sejin9404@gmail.com' 
          ? 'Master account created! You can now login.' 
          : 'Access requested! Please wait for administrator approval.');
        setIsRegistering(false);
      } else {
        // Login Logic with ID Lookup
        let loginEmail = id;

        // If ID doesn't look like an email, lookup the linked email in admin_profiles
        if (!id.includes('@')) {
          const { data: profile, error: lookupError } = await supabase
            .from('admin_profiles')
            .select('email')
            .eq('username', id)
            .single();

          if (lookupError || !profile) {
            throw new Error('Admin ID not found. Please check your ID or use your email.');
          }
          loginEmail = profile.email;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (authError) throw authError;

        // MASTER ACCESS: sejin9404@gmail.com always allowed
        const isMaster = data.user?.email === 'sejin9404@gmail.com';
        const isApproved = data.user?.user_metadata?.is_approved === true;

        if (!isMaster && !isApproved) {
          await supabase.auth.signOut();
          throw new Error('Your account is pending approval from the administrator.');
        }

        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1C88FF]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1C88FF]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo / Title Area */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          >
            <ShieldCheck className="w-8 h-8 text-[#1C88FF]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isRegistering ? 'Admin Setup' : 'Command Center'}
          </h1>
          <p className="text-white/40 text-sm">
            {isRegistering ? 'Initialize your administrator profile' : 'Secure ID-based access'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Registration Specific Fields */}
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#1C88FF] transition-colors" />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sejin Park"
                        required
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#1C88FF]/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Field - Used for linking during registration */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Linked Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#1C88FF] transition-colors" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sejin9404@gmail.com"
                        required
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#1C88FF]/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Admin ID Field (Used for both Login and Register) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">
                {isRegistering ? 'Create Admin ID' : 'Admin ID'}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#1C88FF] transition-colors" />
                <input 
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="haler_admin"
                  required
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#1C88FF]/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#1C88FF] transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 outline-none focus:border-[#1C88FF]/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            {/* Error/Success Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error-msg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-xs font-medium text-center py-3 px-4 rounded-xl border ${
                    error.includes('successful') 
                      ? 'text-green-400 bg-green-400/10 border-green-400/20' 
                      : 'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#1C88FF] hover:bg-[#007AFF] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1C88FF]/20 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Register Admin' : 'Authorize Access'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-white/40 hover:text-[#1C88FF] text-xs font-medium transition-colors"
            >
              {isRegistering 
                ? 'Already initialized? Authorize here' 
                : 'First time here? Register Admin ID'}
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1C88FF]/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-white/20 text-xs">
          Authorized personnel only. All access is logged.
        </p>
      </motion.div>
    </div>
  );
}
