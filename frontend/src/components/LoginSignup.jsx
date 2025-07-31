import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, TextField, Button, IconButton, Alert, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE = 'http://localhost:5000/api/auth';

const LoginSignup = ({ open, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    mobile: '', 
    role: 'user' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { firstname, lastname, email, password, mobile, role } = signupData;
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, email, password, mobile, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {tab === 0 && (
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        )}
        {tab === 1 && (
          <Box component="form" onSubmit={handleSignup} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              name="firstname"
              value={signupData.firstname}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              name="lastname"
              value={signupData.lastname}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <TextField
              label="Mobile"
              name="mobile"
              value={signupData.mobile}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <TextField
              label="Role"
              name="role"
              select
              value={signupData.role}
              onChange={handleSignupChange}
              required
              fullWidth
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginSignup; 