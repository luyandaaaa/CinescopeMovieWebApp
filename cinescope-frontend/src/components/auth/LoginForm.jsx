import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://cinescope-backend-jany.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to home page
      navigate('/userHome');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      /* Added responsive padding */
      '@media (max-width: 768px)': {
        padding: '1rem',
      },
      '@media (max-width: 480px)': {
        padding: '0.5rem',
      }
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        /* Added responsive padding */
        '@media (max-width: 768px)': {
          padding: '1.5rem',
        },
        '@media (max-width: 480px)': {
          padding: '1rem',
          borderRadius: '0',
          maxWidth: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#e50914',
          marginBottom: '1.5rem',
          /* Added responsive font size */
          '@media (max-width: 480px)': {
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }
        }}>Login</h2>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
            border: '1px solid #e50914',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            color: '#e50914',
            /* Added responsive font size */
            '@media (max-width: 480px)': {
              padding: '0.5rem',
              fontSize: '0.875rem',
            }
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#fff',
              /* Added responsive font size */
              '@media (max-width: 480px)': {
                fontSize: '0.875rem',
                marginBottom: '0.25rem',
              }
            }}>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#fff',
              /* Added responsive font size */
              '@media (max-width: 480px)': {
                fontSize: '0.875rem',
                marginBottom: '0.25rem',
              }
            }}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '1.5rem',
              backgroundColor: loading ? '#7a0a10' : '#e50914',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              /* Added responsive padding & font size */
              '@media (max-width: 480px)': {
                padding: '0.5rem',
                fontSize: '0.875rem',
                marginTop: '1rem',
              }
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#f40612')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#e50914')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#aaa',
            /* Added responsive font size */
            '@media (max-width: 480px)': {
              fontSize: '0.875rem',
            }
          }}>
            Don't have an account?{' '}
            <span
              style={{
                color: '#e50914',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/register')}
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;