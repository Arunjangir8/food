import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.js';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import * as Components from "../../style/loginstyle.js";
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      
      if (response.data.success) {
        setSent(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative text-center">
      <button
        onClick={() => navigate('/login')}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        <span>Back to Login</span>
      </button>
      
      <Components.Container className='flex justify-center items-center max-w-lg w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg'>
        <div className="w-full max-w-md mx-auto">
          {!sent ? (
            <>
              <Components.Title>Forgot Password</Components.Title>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <Components.Form onSubmit={handleSubmit}>
                <Components.Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Components.Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Components.Button>
              </Components.Form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <Components.Title>Check Your Email</Components.Title>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Components.Button 
                type="button" 
                onClick={() => setSent(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                Try Again
              </Components.Button>
            </div>
          )}
        </div>
      </Components.Container>
    </div>
  );
};

export default ForgotPassword;