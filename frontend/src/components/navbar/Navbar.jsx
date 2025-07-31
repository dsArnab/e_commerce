import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, Box, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import LoginSignup from '../LoginSignup';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItemCount();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      fetchCartItemCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Checking auth status:', { token: !!token, user: !!user });
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log('User data:', userData);
        setIsLoggedIn(true);
        setUserRole(userData.role);
        setUserData(userData);
        console.log('Set user role to:', userData.role);
      } catch (err) {
        console.error('Error parsing user data:', err);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  };

  const fetchCartItemCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        const totalItems = cartData.items ? cartData.items.reduce((total, item) => total + item.quantity, 0) : 0;
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
    setCartItemCount(0);
    handleProfileMenuClose();
    navigate('/'); // Redirect to homepage
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
    handleProfileMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleCartClick = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    navigate('/cart');
  };

  const handleLoginSuccess = (user) => {
    console.log('Login success with user:', user);
    setIsLoggedIn(true);
    setUserRole(user.role);
    setUserData(user);
    setLoginOpen(false);
    fetchCartItemCount();
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  return (
    <>
      <div className='navbar'>
        <Grid container alignItems="center" justifyContent="space-between" className="navbar-grid">
          <Grid item xs={6} sm={3} className="navbar-left">
            <Typography variant="h6" className='title'>eCommerce</Typography>
          </Grid>
          {!isMobile && (
            <Grid item sm={6} className="navbar-center">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
                <button onClick={handleSearch} className="search-button">Search</button>
              </div>
            </Grid>
          )}
          <Grid item xs={6} sm={3} className="navbar-right" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isMobile ? (
              <>
                <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                  <AccountCircle style={{ color: '#fdc24a' }} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleCartClick}>
                    <IconButton color="inherit">
                      <Badge badgeContent={cartItemCount} color="error">
                        <ShoppingCartIcon />
                      </Badge>
                    </IconButton>
                    Cart ({cartItemCount})
                  </MenuItem>
                  {isLoggedIn && userRole === 'admin' && (
                    <MenuItem onClick={handleAdminDashboard}>
                      <IconButton color="inherit">
                        <AdminPanelSettingsIcon />
                      </IconButton>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  {isLoggedIn && userRole === 'user' && (
                    <MenuItem onClick={handleProfileClick}>
                      <IconButton color="inherit">
                        <PersonIcon />
                      </IconButton>
                      Profile
                    </MenuItem>
                  )}
                  {(isLoggedIn && (userRole === 'user' || userRole === 'admin')) && (
                    <MenuItem onClick={handleOrdersClick}>
                      <IconButton color="inherit">
                        <ShoppingCartIcon />
                      </IconButton>
                      My Orders
                    </MenuItem>
                  )}
                  {isLoggedIn ? (
                    <MenuItem onClick={handleLogout}>
                      <IconButton color="inherit">
                        <LogoutIcon />
                      </IconButton>
                      Logout
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => { setLoginOpen(true); handleProfileMenuClose(); }}>
                      <IconButton color="inherit">
                        <LoginIcon />
                      </IconButton>
                      Login
                    </MenuItem>
                  )}
                </Menu>
              </>
            ) : (
              <ButtonGroup variant="contained" color="primary" size='small' className='button-group'>
                {isLoggedIn && userRole === 'admin' && (
                  <Button
                    className='button admin-btn'
                    onClick={handleAdminDashboard}
                    startIcon={<AdminPanelSettingsIcon />}
                  >
                    Admin
                  </Button>
                )}
                {isLoggedIn && userRole === 'user' && (
                  <Button
                    className='button profile-btn'
                    onClick={handleProfileClick}
                    startIcon={<PersonIcon />}
                  >
                    Profile
                  </Button>
                )}
                {(isLoggedIn && (userRole === 'user' || userRole === 'admin')) && (
                  <Button
                    className='button orders-btn'
                    onClick={handleOrdersClick}
                    startIcon={<ShoppingCartIcon />}
                  >
                    My Orders
                  </Button>
                )}
                {isLoggedIn ? (
                  <Button
                    className='button logout-btn'
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    className='button login-btn'
                    onClick={() => setLoginOpen(true)}
                    startIcon={<LoginIcon />}
                  >
                    Login
                  </Button>
                )}
                <Button 
                  className='button cart-btn' 
                  startIcon={
                    <Badge badgeContent={cartItemCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  }
                  onClick={handleCartClick}
                >
                  Cart
                </Button>
              </ButtonGroup>
            )}
          </Grid>
        </Grid>
      </div>
      {isMobile && (
        <Box className="mobile-search-bar" sx={{ width: '100%', background: '#94897b', p: 2 }}>
          <div className="search-container" style={{ maxWidth: 600, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search Products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
              style={{ width: '100%' }}
            />
            <button onClick={handleSearch} className="search-button">Search</button>
          </div>
        </Box>
      )}
      <LoginSignup open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </>
  );
};

export default Navbar;