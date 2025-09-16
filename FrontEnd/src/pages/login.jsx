import React, { useEffect, useState } from 'react';
import * as Components from "../style/loginstyle.js";

const Login = () => {
  const [signIn, setSignIn] = useState(true);

  const handleToggle = () => {
    setSignIn(!signIn);
  };

  // For desktop/tablet/mobile: !signIn means sign-up is active
  const isSignUpActive = !signIn;
  useEffect(()=>{
    console.log(isSignUpActive)
  },[signIn])

  return (
    <Components.AppWrapper>
      <Components.Container>
        {/* Sign Up */}
        <Components.SignUpContainer $isActive={isSignUpActive}>
          <Components.Form>
            <Components.Title>Create Account</Components.Title>
            <Components.Input 
              type="text" 
              placeholder="Name" 
              autoComplete="name"
            />
            <Components.Input 
              type="email" 
              placeholder="Email" 
              autoComplete="email"
            />
            <Components.Input 
              type="password" 
              placeholder="Password" 
              autoComplete="new-password"
            />
            <Components.Button type="button">Sign Up</Components.Button>
          </Components.Form>
        </Components.SignUpContainer>
        
        {/* Sign In */}
        <Components.SignInContainer $isActive={isSignUpActive}>
          <Components.Form>
            <Components.Title>Sign In</Components.Title>
            <Components.Input 
              type="email" 
              placeholder="Email" 
              autoComplete="email"
            />
            <Components.Input 
              type="password" 
              placeholder="Password" 
              autoComplete="current-password"
            />
            <Components.Anchor href="#" onClick={(e) => e.preventDefault()}>
              Forgot your password?
            </Components.Anchor>
            <Components.Button type="button">Sign In</Components.Button>
          </Components.Form>
        </Components.SignInContainer>
        
        {/* Overlay for desktop/tablet */}
        <Components.OverlayContainer $isActive={isSignUpActive}>
          <Components.Overlay $isActive={isSignUpActive}>
            <Components.LeftOverlayPanel $isActive={isSignUpActive}>
              <Components.Title>Welcome Back!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info
              </Components.Paragraph>
              <Components.GhostButton onClick={handleToggle}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel $isActive={isSignUpActive}>
              <Components.Title>Hello, Friend!</Components.Title>
              <Components.Paragraph>
                Enter your personal details and start journey with us
              </Components.Paragraph>
              <Components.GhostButton onClick={handleToggle}>
                Sign Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>
      
      {/* Mobile toggle */}
      <Components.MobileToggleContainer>
        <Components.MobileToggleButton onClick={handleToggle}>
          {signIn 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Sign In"
          }
        </Components.MobileToggleButton>
      </Components.MobileToggleContainer>
    </Components.AppWrapper>
  );
};

export default Login;
