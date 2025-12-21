// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-50 to-gray-100">
      <h1 className="text-4xl font-bold text-violet-800 mb-6">Food Wastage MVP</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Connect hostels with excess food to volunteers for redistribution.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-2 bg-white border border-violet-600 text-violet-600 rounded hover:bg-violet-50 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}