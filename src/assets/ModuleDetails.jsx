import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api"; // ✅ Centralized API import

function ModuleDetails() {
  const { level, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/levels/${level}/topics/${topicId}`);
        setTopic(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch topic details:", err);
        setError("Failed to load topic details");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [level, topicId]);

  if (loading) return <div style={{ padding: "1rem" }}>Loading topic details...</div>;
  if (error) return <div style={{ color: "red", padding: "1rem" }}>{error}</div>;
  if (!topic?.levels?.[0]?.topics?.[0]) {
    return <div style={{ padding: "1rem" }}>No topic data found.</div>;
  }

  const topicDetails = topic.levels[0].topics[0];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{topic.seriesTitle}</h1>
      <h2 style={{ marginTop: "1rem" }}>{topicDetails.title}</h2>
      <p style={{ fontStyle: "italic", color: "#666" }}>{topicDetails.summary}</p>
      <div
        className="whitespace-pre-wrap"
        style={{ marginTop: "1rem", lineHeight: "1.6" }}
      >
        {topicDetails.content}
      </div>

      {/* Optional Enhancements */}
      {/* 
      {topicDetails.image && (
        <img
          src={`${API}/${topicDetails.image}`}
          alt={topicDetails.title}
          style={{ maxWidth: "100%", marginTop: "1rem" }}
        />
      )} 
      */}
    </div>
  );
}

export default ModuleDetails;
