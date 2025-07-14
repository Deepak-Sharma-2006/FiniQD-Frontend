// Layout.jsx
import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Reuse styles for navbar/footer

function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-container">
      {/* ----- NAVBAR ----- */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">MyApp</div>

          <nav className="navbar-center">
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="navbar-right">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
              alt="Profile"
              className="profile-pic"
            />
            <div className="profile-name">
              {user?.name || "Profile"} ▾
            </div>
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Sign out</button>
            </div>
          </div>
        </div>
      </header>

      {/* ----- PAGE CONTENT ----- */}
      <main className="home-wrapper">
        {children}
      </main>

      {/* ----- FOOTER ----- */}
      <footer className="footer">
        <div className="footer-content">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
