import { useState } from 'react';
import api from '../utils/axios';
import { clearToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';

export default function DeleteAccountModal({ show, onClose, userId }) {
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const addToast = useToast();

  if (!show) return null;

  const handleDelete = async () => {
    if (!password) {
      addToast('Please enter your password to delete your account', 'error');
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/auth/user/${userId}`, {
        data: { password }
      });
      addToast('Account deleted successfully', 'info');
      clearToken();
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setDeleting(false);
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-accent-700 mb-4">Delete Account</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="label">Enter your password to confirm:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            placeholder="Your password"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); setPassword(''); }}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger flex-1"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}