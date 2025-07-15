import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ForgotPassword.module.css';
import { API } from '../api'; // ✅ Import API from environment config

function ForgotPassword({ onClose }) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // Step 1: email, Step 2: OTP + new password

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/auth/send-otp`, { email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/auth/verify-otp`, {
                email,
                otp,
                newPassword,
            });
            toast.success('Password reset successful!');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 className={styles.modalTitle}>
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className={styles.form}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <button type="submit" className={styles.button}>
                            Send OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className={styles.form}>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <button type="submit" className={styles.button}>
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default ForgotPassword;
