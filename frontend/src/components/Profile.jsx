import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: ''
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, []);

  const fetchUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        setFormData({
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          email: user.email || '',
          mobile: user.mobile || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressInputChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          mobile: formData.mobile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          firstname: data.user.firstname,
          lastname: data.user.lastname,
          mobile: data.user.mobile
        });
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressLine1: addressForm.addressLine1,
          street: addressForm.street,
          landmark: addressForm.landmark,
          city: addressForm.city,
          state: addressForm.state,
          pinCode: addressForm.pinCode
        })
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses([...addresses, newAddress]);
        setAddressForm({
          addressLine1: '',
          street: '',
          landmark: '',
          city: '',
          state: '',
          pinCode: ''
        });
        alert('Address added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add address');
      }
    } catch (err) {
      setError('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/addresses/${editingAddressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressLine1: addressForm.addressLine1,
          street: addressForm.street,
          landmark: addressForm.landmark,
          city: addressForm.city,
          state: addressForm.state,
          pinCode: addressForm.pinCode
        })
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        setAddresses(addresses.map(addr => 
          addr._id === editingAddressId ? updatedAddress : addr
        ));
        setAddressForm({
          addressLine1: '',
          street: '',
          landmark: '',
          city: '',
          state: '',
          pinCode: ''
        });
        setEditingAddressId(null);
        alert('Address updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update address');
      }
    } catch (err) {
      setError('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr._id !== addressId));
        alert('Address deleted successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete address');
      }
    } catch (err) {
      setError('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      addressLine1: address.addressLine1 || '',
      street: address.street || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pinCode: address.pinCode || ''
    });
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      addressLine1: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      pinCode: ''
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Home
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button 
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <button 
                  className="edit-btn"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </div>
                </div>

                {editMode && (
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                )}
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-section">
              <h2>Change Password</h2>
              
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="save-btn">
                  Change Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="addresses-section">
              <h2>My Addresses</h2>
              
              <div className="addresses-list">
                {addresses.map((address) => (
                  <div key={address._id} className="address-card">
                    <div className="address-info">
                      <p><strong>{address.addressLine1}</strong></p>
                      <p>{address.street}</p>
                      <p>{address.landmark}</p>
                      <p>{address.city}, {address.state} {address.pinCode}</p>
                    </div>
                    <div className="address-actions">
                      <button 
                        className="edit-address-btn"
                        onClick={() => handleEditAddress(address)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-address-btn"
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-address-form">
                <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                
                <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}>
                  <div className="form-group">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={addressForm.addressLine1}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Street</label>
                    <input
                      type="text"
                      name="street"
                      value={addressForm.street}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={addressForm.landmark}
                      onChange={handleAddressInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={addressForm.pinCode}
                      onChange={handleAddressInputChange}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </button>
                    {editingAddressId && (
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={cancelEditAddress}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 