import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center text-center px-4">
      <div>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Globe className="text-white" size={32} />
          </div>
        </div>
        <div className="text-8xl font-bold text-white/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-blue-200 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 mx-auto">
          <Home size={18} />
          Go Home
        </button>
      </div>
    </div>
  );
}
