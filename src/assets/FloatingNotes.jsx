import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../api"; // ✅ Use environment-based backend URL
import "./FloatingNotes.css";

const FloatingNotes = () => {
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const popupRef = useRef(null);
  const iconRef = useRef(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchNotes();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedNotes(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
      } else {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes. Try again later.");
      }
    }
  };

  const saveNote = async () => {
    if (!token) {
      setError("You must be logged in to save notes.");
      return;
    }
    if (!note.trim()) {
      setVisible(false);
      setNote("");
      setError("");
      return;
    }

    try {
      await axios.post(
        `${API}/api/notes`,
        { content: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNote("");
      setVisible(false);
      fetchNotes();
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
      } else {
        setError("Failed to save note. Try again later.");
        console.error("Error saving note:", err);
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  };

  const startDrag = (e) => {
    dragging.current = false;
    dragOffset.current = {
      x: e.clientX - iconRef.current.getBoundingClientRect().left,
      y: e.clientY - iconRef.current.getBoundingClientRect().top,
    };
    document.addEventListener("mousemove", handleDragStartCheck);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleDragStartCheck = (e) => {
    const dx = Math.abs(
      e.clientX - (iconRef.current.getBoundingClientRect().left + dragOffset.current.x)
    );
    const dy = Math.abs(
      e.clientY - (iconRef.current.getBoundingClientRect().top + dragOffset.current.y)
    );
    if (dx > 3 || dy > 3) {
      dragging.current = true;
      document.removeEventListener("mousemove", handleDragStartCheck);
      document.addEventListener("mousemove", handleDrag);
    }
  };

  const handleDrag = (e) => {
    if (!dragging.current) return;
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;
    iconRef.current.style.left = `${x}px`;
    iconRef.current.style.top = `${y}px`;
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", handleDragStartCheck);
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
    setTimeout(() => {
      dragging.current = false;
    }, 0);
  };

  useEffect(() => {
    const header = popupRef.current?.querySelector(".popup-header");
    if (!header) return;

    let offsetX = 0,
      offsetY = 0,
      isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - popupRef.current.getBoundingClientRect().left;
      offsetY = e.clientY - popupRef.current.getBoundingClientRect().top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      popupRef.current.style.left = `${e.clientX - offsetX}px`;
      popupRef.current.style.top = `${e.clientY - offsetY}px`;
      popupRef.current.style.transform = "none";
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    header.addEventListener("mousedown", onMouseDown);
    return () => header.removeEventListener("mousedown", onMouseDown);
  }, [visible]);

  const handleNoteClick = (content) => {
    setNote(content);
  };

  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const iconBg = theme === "dark" ? "rgba(40,40,40,0.95)" : "rgba(255,255,255,0.95)";
  const iconBorder = theme === "dark" ? "1px solid #444" : "1px solid #eee";
  const iconBoxShadow = theme === "dark"
    ? "0 2px 8px rgba(0,0,0,0.32)"
    : "0 2px 8px rgba(0,0,0,0.12)";

  return (
    <>
      <div
        className="notes-icon"
        ref={iconRef}
        onMouseDown={startDrag}
        onClick={() => {
          if (!dragging.current) setVisible(!visible);
        }}
        style={{
          position: "fixed",
          top: "70px",
          left: "30px",
          zIndex: 2000,
          cursor: "grab",
          background: iconBg,
          borderRadius: "50%",
          boxShadow: iconBoxShadow,
          width: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          border: iconBorder,
        }}
      >
        📝
      </div>

      {visible && (
        <div className="notes-popup" ref={popupRef}>
          <div className="popup-header">My Notes</div>
          {error && <div className="error">{error}</div>}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your note here..."
          />
          <button className="save-btn" onClick={saveNote}>
            Save & Close
          </button>
          <div className="notes-list">
            {savedNotes.length > 0 && (
              <ul>
                {savedNotes.map((n) => (
                  <li key={n._id}>
                    <span
                      onClick={() => handleNoteClick(n.content)}
                      style={{
                        cursor: "pointer",
                        marginRight: "8px",
                        display: "inline-block",
                      }}
                    >
                      • {n.content}
                    </span>
                    <button
                      onClick={() => deleteNote(n._id)}
                      className="delete-btn"
                      title="Delete note"
                    >
                      DELETE
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNotes;
