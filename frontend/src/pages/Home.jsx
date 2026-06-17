import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      navigate(user.role === 'HOSTEL' ? '/hostel' : '/volunteer');
    }
  }, [navigate]);

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-50 via-cream to-accent-50">
      <div className="animate-slide-up text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-primary-800 mb-3 tracking-tight">Second Serve</h1>
          <p className="text-primary-500 text-lg max-w-md leading-relaxed">
            Connect hostels with excess food to volunteers for redistribution. Reducing food waste, one meal at a time.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button onClick={handleLogin} className="btn-primary px-8 py-3 text-base">
            Login
          </button>
          <button onClick={handleRegister} className="btn-outline px-8 py-3 text-base">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}