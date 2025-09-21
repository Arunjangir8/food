import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import * as Components from "../../style/loginstyle.js";
import toast from 'react-hot-toast';

const Login = () => {
  const [signIn, setSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use the auth context


  const from = location.state?.from?.pathname || "/";


  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleToggle = () => {
    setSignIn(!signIn);
    setError('');
  };

  const isSignUpActive = !signIn;

  const handleSignInChange = (e) => {
    setSignInForm({
      ...signInForm,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignUpChange = (e) => {
    setSignUpForm({
      ...signUpForm,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(signInForm);
      
      if (response.data.success) {
        // Use the auth context login function instead of direct localStorage
        login(response.data.data.user, response.data.data.token);
        
        // Redirect to the page they were trying to access or home
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(signUpForm);
      
      if (response.data.success) {
        // Use the auth context login function instead of direct localStorage
        login(response.data.data.user, response.data.data.token);
        
        // Redirect to home after successful registration
        navigate('/', { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(isSignUpActive);
  }, [signIn]);

  return (
    <Components.AppWrapper>

      <button
        onClick={() => navigate('/select-login')}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      
      <Components.Container>

        <Components.SignUpContainer $isActive={isSignUpActive}>
          <Components.Form onSubmit={handleSignUp}>
            <Components.Title>Create Account</Components.Title>
            
            {error && !signIn && (
              <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
                {error}
              </div>
            )}
            
            <Components.Input 
              type="text" 
              name="name"
              placeholder="Full Name" 
              value={signUpForm.name}
              onChange={handleSignUpChange}
              autoComplete="name"
              required
            />
            <Components.Input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={signUpForm.email}
              onChange={handleSignUpChange}
              autoComplete="email"
              required
            />
            <Components.Input 
              type="tel" 
              name="phone"
              placeholder="Phone Number (Optional)" 
              value={signUpForm.phone}
              onChange={handleSignUpChange}
              autoComplete="tel"
            />
            <Components.Input 
              type="password" 
              name="password"
              placeholder="Password (min 6 characters)" 
              value={signUpForm.password}
              onChange={handleSignUpChange}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <Components.Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Components.Button>
          </Components.Form>
        </Components.SignUpContainer>
        

        <Components.SignInContainer $isActive={isSignUpActive}>
          <Components.Form onSubmit={handleSignIn}>
            <Components.Title>Sign In</Components.Title>
            
            {error && signIn && (
              <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
                {error}
              </div>
            )}
            
            <Components.Input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={signInForm.email}
              onChange={handleSignInChange}
              autoComplete="email"
              required
            />
            <Components.Input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={signInForm.password}
              onChange={handleSignInChange}
              autoComplete="current-password"
              required
            />
            <Components.Anchor href="#" onClick={(e) => e.preventDefault()}>
              Forgot your password?
            </Components.Anchor>
            <Components.Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Components.Button>
          </Components.Form>
        </Components.SignInContainer>
        

        <Components.OverlayContainer $isActive={isSignUpActive}>
          <Components.Overlay $isActive={isSignUpActive}>
            <Components.LeftOverlayPanel $isActive={isSignUpActive}>
              <Components.Title>Welcome Back!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info
              </Components.Paragraph>
              <Components.GhostButton onClick={handleToggle} disabled={loading}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel $isActive={isSignUpActive}>
              <Components.Title>Hello, Friend!</Components.Title>
              <Components.Paragraph>
                Enter your personal details and start journey with us
              </Components.Paragraph>
              <Components.GhostButton onClick={handleToggle} disabled={loading}>
                Sign Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
        
        <Components.MobileToggleContainer>
          <Components.MobileToggleButton onClick={handleToggle} disabled={loading}>
            {signIn 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </Components.MobileToggleButton>
        </Components.MobileToggleContainer>
      </Components.Container>
    </Components.AppWrapper>
  );
};

export default Login;
