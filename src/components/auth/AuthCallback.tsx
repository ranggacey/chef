import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChefHat } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Proses URL callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }
        
        // Redirect ke dashboard setelah berhasil
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-red-400 mb-4 text-xl">Authentication Error</div>
            <p className="text-white mb-6">{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Authenticating...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 