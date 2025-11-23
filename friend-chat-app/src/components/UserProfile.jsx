import React, { useState } from "react";
import "./styles/UserProfile.css";

const UserProfile = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="profile-card">
      <div className="profile-picture-wrapper">
        {image ? (
          <img src={image} alt="Profile" className="profile-img" />
        ) : (
          <div className="profile-placeholder">Upload Photo</div>
        )}
        <label className="upload-btn">
          Choose Image
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </label>
      </div>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="profile-name-input"
      />
    </div>
  );
};

export default UserProfile;
