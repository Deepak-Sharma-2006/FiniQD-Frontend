import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Login.module.css';
import { useAuth } from './AuthContext';
import ForgotPassword from './ForgotPassword';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', email: '', password: '', dob: '', profession: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = e =>
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegisterChange = e =>
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLoginSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:2100/api/auth/login', loginData);
      login(res.data.user, res.data.token); // Pass token to context
      navigate('/home');    // ✅ Redirect to home
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:2100/api/auth/register', registerData);
      setMessage(res.data.message);
      login(res.data.user, res.data.token); // Pass token to context
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:2100/api/auth/google-login', {
        token: credentialResponse.credential
      });
      login(res.data.user, res.data.token); // Pass token to context
      navigate('/home');    // ✅ Redirect
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {/* <div className={styles.logo}>TEMPLATE DSGN</div> */}
        <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className={styles.form}>
          <div className={styles.icon}><span role="img" aria-label="user">👤</span></div>

          {isLogin ? (
            <>
              <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} className={styles.input} />
              <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} className={styles.input} />
              <button type="submit" className={styles.button}>LOGIN</button>
              <div className={styles.extra}>
                <label><input type="checkbox" /> Remember me</label>
                <span className={styles.link} onClick={handleForgotPasswordClick}>Forgot password?</span>
              </div>
              <div style={{ margin: '16px 0' }}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Google login failed")}
                />
              </div>
            </>
          ) : (
            <>
              <input type="text" name="name" placeholder="Full Name" value={registerData.name} onChange={handleRegisterChange} className={styles.input} />
              <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} className={styles.input} />
              <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} className={styles.input} />
              <input type="date" name="dob" value={registerData.dob} onChange={handleRegisterChange} className={styles.input} />
              <select name="profession" value={registerData.profession} onChange={handleRegisterChange} className={styles.input}>
                <option value="">Select Profession</option>
                <option value="student">Student</option>
                <option value="business">Business</option>
                <option value="corporate">Corporate</option>
              </select>
              <button type="submit" className={styles.button}>Register</button>
            </>
          )}

          {message && <div className={styles.success}>{message}</div>}
          {error && <div className={styles.error}>{error}</div>}
        </form>

        <div className={styles.toggleText}>
          {isLogin ? 'Not a member?' : 'Already a member?'}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className={styles.toggleButton}>
            {isLogin ? 'Sign up now' : 'Sign in'}
          </button>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <img src="http://localhost:2100/uploads/WhatsApp%20Image%202025-06-29%20at%2021.51.42.jpeg" alt="Login" className={styles.bgImage} />
        <div className={styles.overlay} />
        <div className={styles.textContainer}>
          {/* All text content removed as requested */}
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Login;