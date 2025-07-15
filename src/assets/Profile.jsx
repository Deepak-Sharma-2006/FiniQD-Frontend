import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./Profile.css";
import { API } from "../api"; // ✅ centralized API

const MySwal = withReactContent(Swal);

const Profile = () => {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userMeta, setUserMeta] = useState({ _id: "", role: "", createdAt: "", updatedAt: "" });
  const [imagePreview, setImagePreview] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", profession: "" });
  const fileInputRef = useRef();
  const [otpOpen, setOtpOpen] = useState(false);
  const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = res.data;
        setUser(fetchedUser);
        setFormData({ name: fetchedUser.name || "", profession: fetchedUser.profession || "" });
        setImagePreview(fetchedUser.pfp ? getImageUrl(fetchedUser.pfp) : "https://via.placeholder.com/150");
        setUserMeta({
          _id: fetchedUser._id,
          role: fetchedUser.role,
          createdAt: fetchedUser.createdAt,
          updatedAt: fetchedUser.updatedAt,
        });
      } catch {
        setError("Failed to load user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getImageUrl = (pfp) => {
    if (!pfp) return "https://via.placeholder.com/150";
    return pfp.startsWith("http") ? pfp : `${API}${pfp}`;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/users/me/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const newUrl = getImageUrl(res.data.pfp);
      setImagePreview(newUrl);
      setUser((prev) => ({ ...prev, pfp: res.data.pfp }));
      updateUser({ ...user, pfp: res.data.pfp });

      await MySwal.fire({
        icon: "success",
        title: "Profile Picture Updated",
        text: "Your new image has been uploaded successfully.",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
      });
    } catch {
      await MySwal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "There was an issue uploading your image.",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    const confirm = await MySwal.fire({
      icon: "question",
      title: "Save Changes?",
      text: "Are you sure you want to update your profile?",
      showCancelButton: true,
      confirmButtonText: "Yes, save it",
      cancelButtonText: "Cancel",
      background: theme === "dark" ? "#23272f" : "#fff",
      color: theme === "dark" ? "#f1f1f1" : "#000",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/auth/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => ({ ...prev, ...formData }));
      updateUser({ ...user, ...formData });
      setEditMode(false);

      await MySwal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved.",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
      });
    } catch {
      await MySwal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Unable to update profile. Please try again.",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
      });
    }
  };

  const handleSendOtp = async () => {
    try {
      setOtpOpen(true);
      await axios.post(`${API}/api/auth/send-otp`, { email: user.email });

      await MySwal.fire({
        title: "<strong>Enter OTP & New Password</strong>",
        html: `
          <input type="text" id="otp" class="swal2-input" placeholder="Enter OTP" />
          <input type="password" id="newPassword" class="swal2-input" placeholder="New Password" />
        `,
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
        allowOutsideClick: false,
        willClose: () => setOtpOpen(false),
        preConfirm: async () => {
          const otp = document.getElementById("otp").value;
          const newPassword = document.getElementById("newPassword").value;

          if (!otp || !newPassword) {
            Swal.showValidationMessage("Both fields are required");
            return false;
          }

          try {
            await axios.post(`${API}/api/auth/verify-otp`, {
              email: user.email,
              otp,
              newPassword,
            });

            await MySwal.fire({
              icon: "success",
              title: "Password Changed",
              text: "Your password was updated successfully.",
              toast: false,
              timer: 2500,
              showConfirmButton: false,
              position: "center",
              background: theme === "dark" ? "#23272f" : "#fff",
              color: theme === "dark" ? "#f1f1f1" : "#000",
            });
          } catch (err) {
            Swal.showValidationMessage(err.response?.data?.message || "Invalid OTP or password");
            return false;
          }
        },
      });
    } catch {
      setOtpOpen(false);
      await MySwal.fire({
        icon: "error",
        title: "OTP Failed",
        text: "Unable to send OTP. Try again later.",
        background: theme === "dark" ? "#23272f" : "#fff",
        color: theme === "dark" ? "#f1f1f1" : "#000",
      });
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  return (
    <div className={`profile-truecaller-bg ${otpOpen ? "blurred-bg" : ""}`}>
      <div className="profile-truecaller-card">
        <div className="profile-truecaller-left">
          <img src={imagePreview} alt={user.name} className="profile-truecaller-avatar" />
          <div className="profile-truecaller-name">{user.name || "-"}</div>
          <div className="profile-truecaller-profession">{user.profession || "-"}</div>
          <button onClick={() => fileInputRef.current.click()} className="profile-truecaller-upload-btn">Upload Image</button>
          <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleImageChange} />
        </div>

        <div className="profile-truecaller-details">
          {[
            {
              label: "User Name", value: editMode ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              ) : user.name || "-"
            },

            { label: "E-mail", value: user.email },
            { label: "Date of Birth", value: user.dob?.slice(0, 10) || "-" },

            {
              label: "Profession", value: editMode ? (
                <select name="profession" value={formData.profession} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="business">Business</option>
                  <option value="corporate">Corporate</option>
                </select>
              ) : user.profession || "-"
            },

            { label: "Created At", value: new Date(userMeta.createdAt).toLocaleString() },
            { label: "Updated At", value: new Date(userMeta.updatedAt).toLocaleString() },

            {
              label: "Password", value: (
                <>
                  **********
                  <button onClick={handleSendOtp} className="profile-truecaller-upload-btn" style={{ marginLeft: "10px" }}>
                    Change Password
                  </button>
                </>
              )
            }
          ].map(({ label, value }, i) => (
            <div key={i}>
              <div className="profile-truecaller-detail-label">{label}</div>
              <div className="profile-truecaller-detail-value">{value}</div>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            {editMode ? (
              <>
                <button onClick={handleUpdateProfile} className="profile-truecaller-upload-btn">Save Changes</button>
                <button onClick={() => setEditMode(false)} className="profile-truecaller-upload-btn">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="profile-truecaller-upload-btn">Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
