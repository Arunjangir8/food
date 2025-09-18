import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx'; // Add this import
import * as Components from "../../style/loginstyle.js";

const API_BASE_URL = 'http://localhost:3001/api';

const Login = () => {
  const [signIn, setSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use the auth context

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || "/";

  // Form states
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
      const response = await axios.post(`${API_BASE_URL}/auth/login`, signInForm);
      
      if (response.data.success) {
        // Use the auth context login function instead of direct localStorage
        login(response.data.data.user, response.data.data.token);
        
        // Redirect to the page they were trying to access or home
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, signUpForm);
      
      if (response.data.success) {
        // Use the auth context login function instead of direct localStorage
        login(response.data.data.user, response.data.data.token);
        
        // Redirect to home after successful registration
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(isSignUpActive);
  }, [signIn]);

  return (
    <Components.AppWrapper>
      <Components.Container>
        {/* Sign Up */}
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
        
        {/* Sign In */}
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
        
        {/* Rest of your existing JSX remains the same */}
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
