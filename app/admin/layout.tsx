import { Poppins } from 'next/font/google';
import { AdminProvider } from '@/components/admin/AdminContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '@/app/admin/admin.css';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { headers } from 'next/headers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-admin',
});

export const metadata = {
  title: 'Haler Admin — Command Center',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const headersList = headers();
  const fullPath = headersList.get('x-invoke-path') || '';

  // Safety check for missing environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Configuration Required</h1>
        <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
          Please add your <code className="bg-slate-800 px-2 py-1 rounded text-pink-400">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-slate-800 px-2 py-1 rounded text-pink-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="text-white underline">.env.local</code> file.
        </p>
        <div className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">
          Once added, please manually refresh this page
        </div>
      </div>
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Simple hardcoded admin check for now as requested
  const isAdmin = session?.user?.email === 'sejin9404@gmail.com';

  // More robust path check for local development
  const url = headersList.get('referer') || '';
  const isLoginPage = fullPath.includes('/admin/login') || url.includes('/admin/login');

  // TEMPORARILY DISABLED: Breaking the loop for local dev
  // If not admin and not on login page, redirect to login
  /*
  if (!isAdmin && !isLoginPage) {
    console.log('Redirecting to login: Not admin and not on login page');
    redirect('/admin/login');
  }
  */

  return (
    <AdminProvider>
      {/* Pretendard CDN for Korean */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
      />
      <div className={`admin-root ${poppins.variable}`}>
        <AdminSidebar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
