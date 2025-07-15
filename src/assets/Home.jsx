import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Swal from "sweetalert2";
import "./Home.css";
import logo from "../assets/finq-logo.png";
import { API } from "../api"; // ✅ Use API constant

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    const styles = getComputedStyle(document.body);
    const background = styles.getPropertyValue("--popup-bg-color").trim();
    const textColor = styles.getPropertyValue("--popup-text-color").trim();

    Swal.fire({
      title: "Are you sure?",
      text: "You will be signed out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out",
      cancelButtonText: "Cancel",
      background,
      color: textColor,
      customClass: {
        popup: "swal-theme-aware",
        confirmButton: "swal-button-confirm",
        cancelButton: "swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Signed out successfully",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background,
          color: textColor,
          customClass: {
            popup: "swal-theme-aware",
          },
        });

        setTimeout(() => {
          navigate("/login");
        }, 500);
      }
    });
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const getImageUrl = (pfp) => {
    if (!pfp) return "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";
    if (pfp.startsWith("http")) return pfp;
    return `${API}${pfp}`; // ✅ Now uses environment-safe base URL
  };

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-left">
          <img
            src={logo}
            alt="FinIQ Logo"
            className="navbar-logo"
            style={{
              height: "40px",
              marginRight: "10px",
              verticalAlign: "middle",
            }}
          />
          <span
            style={{
              verticalAlign: "middle",
              fontWeight: "bold",
              fontSize: "1.3rem",
            }}
          >
            FinIQ
          </span>
        </div>
        <nav className="navbar-center"></nav>
        <div
          className="navbar-right profile-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={getImageUrl(user?.pfp)}
            alt="Profile"
            className="profile-pic"
          />
          <div className="profile-name">{user?.name || "Profile"} ▾</div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleProfile}>Profile</button>
              <button onClick={handleLogout}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            FinIQ
            <br /> Master Your Money, One Lesson at a Time
          </h1>
          <br />
          <br />
          <h2 className="hero-subheading">
            Interactive, beginner-friendly modules to build real-world financial
            skills
          </h2>
          <br />
          <br />
          <p>
            FinIQ is your personal guide to understanding money, markets, and
            investing. Whether you're a student, a young professional, or just
            getting started with personal finance — our visual-rich lessons,
            short videos, and hands-on quizzes make learning simple, practical,
            and engaging.
            <br />
            <br />
            No ads, Just free, high-quality financial education for everyone.
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/modules")}
            >
              Start Learning Now
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          &copy; 2025 FinIQ. All rights reserved. | Contributors:
          <a
            href="https://github.com/soham-06"
            target="_blank"
            rel="noopener noreferrer"
          >
            soham-06(Soham)
          </a>
          ,
          <a
            href="https://github.com/Infinity915"
            target="_blank"
            rel="noopener noreferrer"
          >
            Infinity915(Taksh)
          </a>
          ,
          <a
            href="https://github.com/Deepak-Sharma-2006"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deepak-Sharma-2006(Deepak)
          </a>
        </p>
      </footer>
    </div>
  );
}

export default Home;
