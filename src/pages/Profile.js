import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    setEditing(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Profile Information</h5>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="card-body">
            {editing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            ) : (
              <div>
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Full Name:</strong>
                  </div>
                  <div className="col-sm-9">
                    {currentUser?.full_name}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Email:</strong>
                  </div>
                  <div className="col-sm-9">
                    {currentUser?.email}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Account Type:</strong>
                  </div>
                  <div className="col-sm-9">
                    {currentUser?.is_cpa ? 'CPA' : 'Individual'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Member Since:</strong>
                  </div>
                  <div className="col-sm-9">
                    {new Date(currentUser?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;