import styled from "styled-components";

export const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 678px;
  max-width: 100%;
  min-height: 400px;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 450px;
    min-height: 350px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    min-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
`;

export const SignUpContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 50%;
  opacity: 0;
  z-index: 1;
  transition: all 0.6s ease-in-out;

  /* Desktop/tablet: hidden by default, slides in when active */
  ${props => !props.$isActive && `
    transform: translateX(0);
  `}

  ${props => props.$isActive && `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  `}

  @media (max-width: 480px) {
    width: 100%;
    position: relative;
    transition: transform 0.3s ease-in-out;

    /* Hidden by default */
    transform: translateX(100%);
    opacity: 0;
    z-index: 1;
    pointer-events: none;


    /* Show when active */
    ${props => props.$isActive && `
      transform: translateX(0);
      opacity: 1;
      z-index: 5;
      pointer-events: auto;

    `}
    ${props => !props.$isActive && `
      transform: translateX(-100%);
      opacity: 0;
      display: none;
    `}
  }
`;


export const SignInContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  
  ${props => !props.$isActive && `
    transform: translateX(0);
  `}

  ${props => props.$isActive && `
    transform: translateX(100%);
  `}

  @media (max-width: 480px) {
    width: 100%;
    position: relative;
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);
    opacity: 1;
    z-index: 5;
    
    ${props => !props.$isActive && `
      transform: translateX(0);
      opacity: 1;
      z-index: 5;
    `}
    
    ${props => props.$isActive && `
      transform: translateX(-100%);
      opacity: 0;
      z-index: 1;
    `}
  }
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 30px;
  }

  @media (max-width: 480px) {
    padding: 60px 30px 120px 30px;
    height: 100vh;
    justify-content: center;
  }
`;

export const Title = styled.h1`
  font-weight: bold;
  margin: 0 0 20px 0;
  font-size: 2rem;

  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
`;

export const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid #ff4b2b;
    outline-offset: -2px;
  }

  @media (max-width: 480px) {
    padding: 16px 20px;
    margin: 12px 0;
    font-size: 16px;
    border-radius: 8px;
  }
`;

export const Button = styled.button`
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.15s ease;
  cursor: pointer;
  margin-top: 15px;

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 75, 43, 0.3);
  }

  &:hover {
    background-color: #e63e2b;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 16px 60px;
    font-size: 14px;
    margin: 25px 0 15px 0;
    width: 100%;
    max-width: 280px;
    border-radius: 25px;
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: #ffffff;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: #ff4b2b;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin: 20px 0;
  }
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  
  ${props => props.$isActive && `
    transform: translateX(-100%);
  `}

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Overlay = styled.div`
  background: #ff416c;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  
  ${props => props.$isActive && `
    transform: translateX(50%);
  `}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const LeftOverlayPanel = styled(OverlayPanel)`
  transform: translateX(-20%);
  
  ${props => props.$isActive && `
    transform: translateX(0);
  `}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
  right: 0;
  transform: translateX(0);
  
  ${props => props.$isActive && `
    transform: translateX(20%);
  `}
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;

  @media (max-width: 768px) {
    font-size: 13px;
    margin: 15px 0 25px;
  }
`;

export const MobileToggleContainer = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: linear-gradient(45deg, #ff4b2b, #ff416c);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  }
`;

export const MobileToggleButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
`;

export const AppWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 0;
    background: #f8f9fa;
  }
`;
