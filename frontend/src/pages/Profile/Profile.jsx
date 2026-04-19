/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import "./Profile.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const Profile = () => {
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main Street, City, Country"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Save updated profile data to backend
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  if (!token) {
    return (
      <div className="profile-login">
        <h2>Please Login</h2>
        <p>You need to login to view your profile</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-header">
          <img src={assets.profile_icon} alt="Profile" className="profile-avatar" />
          <div className="profile-info">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              ) : (
                <div className="action-buttons">
                  <button className="save-btn" onClick={handleSave}>Save</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="profile-section">
            <h3>Delivery Address</h3>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={userData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="3"
              />
            </div>
          </div>

          <div className="profile-section">
            <h3>Quick Links</h3>
            <div className="quick-links">
              <button onClick={() => navigate("/my-orders")}>
                <img src={assets.bag_icon} alt="" />
                My Orders
              </button>
              <button onClick={() => navigate("/favorites")}>
                <img src={assets.rating_starts} alt="" />
                Favorites
              </button>
              <button onClick={() => navigate("/contact")}>
                <img src={assets.search_icon} alt="" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
