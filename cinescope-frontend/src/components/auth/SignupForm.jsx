import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setServerError('');
      
      try {
        const { confirmPassword, ...dataToSend } = formData;
        
        const response = await fetch('https://cinescope-backend-jany.onrender.com/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Show success and redirect to login
        alert('Registration successful! Please login.');
        navigate('/login');
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
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
        /* Added responsive padding and mobile full-screen */
        '@media (max-width: 768px)': {
          padding: '1.5rem',
        },
        '@media (max-width: 480px)': {
          padding: '1rem',
          borderRadius: '0',
          maxHeight: '100vh',
          overflow: 'auto',
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
        }}>Create Your Account</h2>

        {serverError && (
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
            {serverError}
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
            }}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.firstName ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
            {errors.firstName && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.firstName}</p>}
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
            }}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.lastName ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
            {errors.lastName && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.lastName}</p>}
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
            }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.email ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
            {errors.email && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</p>}
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
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.password ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
            {errors.password && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</p>}
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
            }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.confirmPassword ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            />
            {errors.confirmPassword && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>}
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
            }}>Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: errors.country ? '1px solid #e50914' : '1px solid #333',
                backgroundColor: '#2c2c44',
                color: '#fff',
                /* Added responsive padding */
                '@media (max-width: 480px)': {
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }
              }}
            >
              <option value="">Select Country</option>
              <option value="South Africa">South Africa</option>
              <option value="United States">United States</option>
              <option value="India">India</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
            {errors.country && <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.country}</p>}
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
            {loading ? 'Processing...' : 'Sign Up'}
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
            Already have an account?{' '}
            <span
              style={{
                color: '#e50914',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => navigate('/login')}
            >
              Log In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;