import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./Topics.css";

function Topics() {
  const { level } = useParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const levelNumber = level.split("-")[1];
        const res = await axios.get(
          `http://localhost:2100/api/levels/${levelNumber}/topics`
        );
        setTopics(res.data);
      } catch (err) {
        setError("Failed to load topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [level]);

  const levelNumber = level.split("-")[1];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    return `http://localhost:2100/${imagePath.replace(/^\/+/, "")}`;
  };

  if (loading) return <div className="topics-loading">Loading...</div>;
  if (error) return <div className="topics-error">{error}</div>;

  return (
    <div className="topics-container">
      <h2 className="topics-title">Topics for Level {levelNumber}</h2>
      <div className="topics-list">
        {topics.length === 0 ? (
          <div className="topics-empty">No topics found.</div>
        ) : (
          topics.map((topic, idx) => (
            <div className="topic-card" key={topic.customId}>
              <div className="topic-header">Topic {idx + 1}</div>
              <div className="topic-image-placeholder">
                <div className="image-wrapper">
                  {topic.image ? (
                    <img
                      src={getImageUrl(topic.image)}
                      alt={topic.title || `Topic ${idx + 1}`}
                    />
                  ) : (
                    <div className="no-image-fallback">No image available</div>
                  )}
                </div>
              </div>
              <div className="topic-title">{topic.topic || topic.title}</div>
              <div className="topic-summary">{topic.summary}</div>
              <Link
                to={`/levels/${levelNumber}/topics/${topic.customId}`}
                className="read-more-btn"
              >
                Read More
              </Link>
            </div>
          ))
        )}
      </div>
      <div className="topics-back">
        <Link to="/modules">&larr; Back to Modules</Link>
      </div>
    </div>
  );
}

export default Topics;
