import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api.js';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import * as Components from "../../style/loginstyle.js";
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({ token, password });
      
      if (response.data.success) {
        toast.success('Password reset successfully!');
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Components.AppWrapper>
      <button
        onClick={() => navigate('/login')}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        <span>Back to Login</span>
      </button>
      
      <Components.Container>
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <Components.Title>Reset Password</Components.Title>
          <p className="text-gray-600 mb-6 text-center">
            Enter your new password below.
          </p>
          
          <Components.Form onSubmit={handleSubmit}>
            <Components.Input 
              type="password" 
              placeholder="New Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Components.Input 
              type="password" 
              placeholder="Confirm New Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <Components.Button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Components.Button>
          </Components.Form>
        </div>
      </Components.Container>
    </Components.AppWrapper>
  );
};

export default ResetPassword;