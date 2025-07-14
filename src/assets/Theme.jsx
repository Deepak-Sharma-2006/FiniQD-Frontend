import React, { useEffect, useState, useRef } from "react";

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        // Retrieve theme from localStorage or default to "light"
        return localStorage.getItem("theme") || "light";
    });
    const buttonRef = useRef(null);
    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Apply the theme to the document body
        document.body.className = theme === "dark" ? "dark-mode" : "";
        // Save theme preference in localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const startDrag = (e) => {
        dragging.current = true;
        dragOffset.current = {
            x: e.clientX - buttonRef.current.getBoundingClientRect().left,
            y: e.clientY - buttonRef.current.getBoundingClientRect().top,
        };
        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", stopDrag);
    };

    const handleDrag = (e) => {
        if (!dragging.current) return;
        const x = e.clientX - dragOffset.current.x;
        const y = e.clientY - dragOffset.current.y;
        buttonRef.current.style.left = `${x}px`;
        buttonRef.current.style.top = `${y}px`;
    };

    const stopDrag = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    };

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            onMouseDown={startDrag}
            style={{
                position: "fixed",
                top: "70px", // Initial position
                right: "90px", // Initial position beside the notes button
                zIndex: 1000,
                backgroundColor: "var(--button-bg-color)",
                color: "var(--button-text-color)",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                border: "none",
                cursor: "pointer",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
};

export default ThemeToggle;