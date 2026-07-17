import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiCheckSquare, FiArrowLeft, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });

      if (res.data.success) {
        setIsSent(true);
        toast.success('OTP sent to your email!');
        // Navigate to reset page after a brief delay
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <div className="glass-panel animate-slide-up" style={{
        padding: '2.5rem',
        width: '100%',
        maxWidth: '440px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            borderRadius: '12px',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
            marginBottom: '1rem',
          }}>
            <FiCheckSquare size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Forgot Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Enter your registered email and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        {isSent ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '12px',
          }}>
            <FiSend size={36} color="var(--status-done)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--status-done)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>OTP Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Check your inbox at <strong style={{ color: 'white' }}>{email}</strong>. Redirecting you to the reset page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="email"
                  className="input-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
        }}>
          <Link to="/login" style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <FiArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
