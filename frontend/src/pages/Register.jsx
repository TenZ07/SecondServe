import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { setToken } from '../utils/auth';
import { useToast } from '../components/Toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VOLUNTEER',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const addToast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      
      const { token, role } = res.data;
      setToken(token);
      addToast('Account created successfully!', 'success');
      
      if (role === 'HOSTEL') {
        navigate('/hostel');
      } else {
        navigate('/volunteer');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-50 via-cream to-accent-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-800">Create Account</h2>
            <p className="text-primary-400 text-sm mt-1">Join Second Serve today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                className="input"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="label">I am a</label>
              <select
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="VOLUNTEER">Volunteer</option>
                <option value="HOSTEL">Hostel Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., San Francisco, CA"
                className="input"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-primary-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-accent-500 hover:text-accent-600 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}