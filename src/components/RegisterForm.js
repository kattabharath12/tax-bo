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
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
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

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-300"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-center transition-all duration-300 hover:scale-105">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-6 shadow-lg animate-bounce">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome Aboard! 🎉
            </h2>
            
            <p className="text-white/80 mb-8 leading-relaxed">
              Your TaxBox.AI account has been created successfully. You're ready to revolutionize your tax experience!
            </p>
            
            <a 
              href="/login" 
              className="inline-block w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-purple-400 to-fuchsia-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-300"></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 9.55 9.45 10 10 10H11V22H13V16H15V22H17V10H18C18.55 10 19 9.55 19 9Z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Join TaxBox.AI
            </h1>
            <p className="text-white/70 text-sm">
              Create your account and start managing taxes smartly
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Register Form */}
          <div className="space-y-5">
            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                          index < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/60">
                    Password strength: <span className={`font-medium ${passwordStrength > 2 ? 'text-green-400' : passwordStrength > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {strengthLabels[passwordStrength - 1] || 'Too weak'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-400 focus:ring-red-400' 
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-white/20 focus:ring-fuchsia-400'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    {showConfirmPassword ? (
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C5.36 3 1.52 6.28 1.52 10s3.84 7 8.48 7 8.48-3.28 8.48-7-3.84-7-8.48-7zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"/>
                    ) : (
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    )}
                  </svg>
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs">Passwords don't match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-400 text-xs">Passwords match ✓</p>
              )}
            </div>

            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || password !== confirmPassword || !password || !email || !fullName}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                loading || password !== confirmPassword || !password || !email || !fullName
                  ? 'bg-gray-500/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors duration-200 hover:underline"
              >
                Sign in here
              </a>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/50 text-xs text-center">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-fuchsia-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-fuchsia-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
