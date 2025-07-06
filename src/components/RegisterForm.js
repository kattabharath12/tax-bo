import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  // Password strength checker
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 1;
    if (/\d/.test(pass)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await register(email, fullName, password);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #c084fc 50%, #e879f9 75%, #f472b6 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  };

  const successContainerStyle = {
    ...containerStyle,
    background: 'linear-gradient(135deg, #059669 0%, #10b981 25%, #34d399 50%, #6ee7b7 75%, #a7f3d0 100%)'
  };

  const backgroundElements = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0
  };

  const orb1Style = {
    position: 'absolute',
    top: '-150px',
    right: '-150px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 8s ease-in-out infinite'
  };

  const orb2Style = {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 10s ease-in-out infinite reverse'
  };

  const orb3Style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite'
  };

  const cardStyle = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const logoStyle = {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
  };

  const successLogoStyle = {
    ...logoStyle,
    background: 'linear-gradient(135deg, #059669, #10b981)',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
    animation: 'bounce 2s infinite'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  };

  const errorStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '20px',
    color: '#dc2626',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  };

  const inputContainerStyle = {
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 12px 12px 44px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const passwordInputStyle = (isValid) => ({
    ...inputStyle,
    paddingRight: '44px',
    borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' :
                 confirmPassword && password === confirmPassword ? '#22c55e' : '#d1d5db'
  });

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none'
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.2s ease'
  };

  const strengthBarStyle = {
    display: 'flex',
    gap: '4px',
    marginTop: '8px'
  };

  const strengthSegmentStyle = (index) => ({
    height: '3px',
    flex: 1,
    borderRadius: '2px',
    backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb',
    transition: 'all 0.3s ease'
  });

  const strengthTextStyle = {
    fontSize: '12px',
    color: passwordStrength > 2 ? '#22c55e' : passwordStrength > 1 ? '#eab308' : '#ef4444',
    marginTop: '4px',
    fontWeight: '500'
  };

  const validationTextStyle = (isValid) => ({
    fontSize: '12px',
    marginTop: '4px',
    color: isValid ? '#22c55e' : '#ef4444',
    fontWeight: '500'
  });

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: loading || password !== confirmPassword || !password || !email || !fullName ? 
               '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading || password !== confirmPassword || !password || !email || !fullName ? 
            'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: loading || password !== confirmPassword || !password || !email || !fullName ? 
               'none' : '0 4px 20px rgba(139, 92, 246, 0.4)'
  };

  const successButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #059669, #10b981)',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
  };

  const linkStyle = {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#6b7280'
  };

  const termsStyle = {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    color: '#9ca3af'
  };

  const linkAStyle = {
    color: '#8b5cf6',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  };

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  };

  // Success Screen
  if (success) {
    return (
      <>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-15px); }
            70% { transform: translateY(-7px); }
            90% { transform: translateY(-3px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div style={successContainerStyle}>
          <div style={backgroundElements}>
            <div style={{...orb1Style, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'}}></div>
            <div style={{...orb2Style, background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)'}}></div>
          </div>

          <div style={cardStyle} className="register-card">
            <div style={headerStyle}>
              <div style={successLogoStyle}>
                <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 style={titleStyle}>Welcome Aboard! 🎉</h1>
              <p style={subtitleStyle}>Your TaxBox.AI account has been created successfully</p>
            </div>

            <div style={{textAlign: 'center', marginBottom: '32px'}}>
              <p style={{fontSize: '16px', color: '#374151', lineHeight: '1.6', margin: '0 0 24px 0'}}>
                You're ready to revolutionize your tax experience with AI-powered solutions!
              </p>
            </div>

            <a href="/login" style={{textDecoration: 'none'}}>
              <button style={successButtonStyle} className="success-button">
                Start Your Journey
              </button>
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .register-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
        }
        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(139, 92, 246, 0.6);
        }
        .success-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(16, 185, 129, 0.6);
        }
        .register-input:focus {
          border-color: #8b5cf6;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        .eye-button:hover {
          color: #8b5cf6;
        }
        .link-hover:hover {
          color: #7c3aed;
          text-decoration: underline;
        }
        .strength-pulse {
          animation: pulse 1s ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
      
      <div style={containerStyle}>
        <div style={backgroundElements}>
          <div style={orb1Style}></div>
          <div style={orb2Style}></div>
          <div style={orb3Style}></div>
        </div>

        <div style={cardStyle} className="register-card">
          <div style={headerStyle}>
            <div style={logoStyle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 9.55 9.45 10 10 10H11V22H13V16H15V22H17V10H18C18.55 10 19 9.55 19 9Z"/>
              </svg>
            </div>
            <h1 style={titleStyle}>Join TaxBox.AI</h1>
            <p style={subtitleStyle}>Create your account and start managing taxes smartly</p>
          </div>

          {error && (
            <div style={errorStyle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px'}}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <div>
            {/* Full Name */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputContainerStyle}>
                <svg style={iconStyle} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  style={inputStyle}
                  className="register-input"
                />
              </div>
            </div>

            {/* Email */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <div style={inputContainerStyle}>
                <svg style={iconStyle} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={inputStyle}
                  className="register-input"
                />
              </div>
            </div>

            {/* Password */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={inputContainerStyle}>
                <svg style={iconStyle} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  style={passwordInputStyle()}
                  className="register-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  className="eye-button"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    {showPassword ? (
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C5.36 3 1.52 6.28 1.52 10s3.84 7 8.48 7 8.48-3.28 8.48-7-3.84-7-8.48-7zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"/>
                    ) : (
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div>
                  <div style={strengthBarStyle}>
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        style={strengthSegmentStyle(index)}
                        className={index < passwordStrength ? 'strength-pulse' : ''}
                      />
                    ))}
                  </div>
                  <p style={strengthTextStyle}>
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={inputContainerStyle}>
                <svg style={iconStyle} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  style={passwordInputStyle(confirmPassword && password === confirmPassword)}
                  className="register-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={eyeButtonStyle}
                  className="eye-button"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    {showConfirmPassword ? (
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C5.36 3 1.52 6.28 1.52 10s3.84 7 8.48 7 8.48-3.28 8.48-7-3.84-7-8.48-7zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"/>
                    ) : (
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    )}
                  </svg>
                </button>
              </div>
              {confirmPassword && (
                <p style={validationTextStyle(password === confirmPassword)}>
                  {password === confirmPassword ? 'Passwords match ✓' : 'Passwords don\'t match'}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || password !== confirmPassword || !password || !email || !fullName}
              style={buttonStyle}
              className="register-button"
            >
              {loading ? (
                <>
                  <div style={spinnerStyle}></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div style={linkStyle}>
            Already have an account?{' '}
            <a href="/login" style={linkAStyle} className="link-hover">
              Sign in here
            </a>
          </div>

          <div style={termsStyle}>
            By creating an account, you agree to our{' '}
            <a href="/terms" style={linkAStyle} className="link-hover">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={linkAStyle} className="link-hover">Privacy Policy</a>
          </div>
        </div>
      </div>
    </>
  );
}
