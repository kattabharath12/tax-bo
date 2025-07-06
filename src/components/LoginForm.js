import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      setError('Invalid email or password');
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden'
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
    top: '-200px',
    right: '-200px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(167, 85, 221, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite'
  };

  const orb2Style = {
    position: 'absolute',
    bottom: '-200px',
    left: '-200px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 8s ease-in-out infinite reverse'
  };

  const cardStyle = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
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

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: loading ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)'
  };

  const linkStyle = {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#6b7280'
  };

  const linkAStyle = {
    color: '#667eea',
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
        .login-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
        }
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }
        .login-input:focus {
          border-color: #667eea;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .eye-button:hover {
          color: #667eea;
        }
        .link-hover:hover {
          color: #4f46e5;
          text-decoration: underline;
        }
      `}</style>
      
      <div style={containerStyle}>
        <div style={backgroundElements}>
          <div style={orb1Style}></div>
          <div style={orb2Style}></div>
        </div>

        <div style={cardStyle} className="login-card">
          <div style={headerStyle}>
            <div style={logoStyle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <h1 style={titleStyle}>Welcome Back</h1>
            <p style={subtitleStyle}>Sign in to your TaxBox.AI account</p>
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
                  className="login-input"
                />
              </div>
            </div>

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
                  placeholder="Enter your password"
                  style={inputStyle}
                  className="login-input"
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
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={buttonStyle}
              className="login-button"
            >
              {loading ? (
                <>
                  <div style={spinnerStyle}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div style={linkStyle}>
            Don't have an account?{' '}
            <a href="/register" style={linkAStyle} className="link-hover">
              Create one here
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
