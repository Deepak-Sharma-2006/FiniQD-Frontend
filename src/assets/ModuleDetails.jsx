import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function ModuleDetails() {
  const { level, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:2100/api/levels/${level}/topics/${topicId}`);
        setTopic(res.data);
      } catch (err) {
        console.error("Failed to fetch topic details:", err);
        setError("Failed to load topic details");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [level, topicId]);

  if (loading) return <div>Loading topic details...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Example assumes data structure as you described:
  // { seriesTitle, levels: [{ topics: [{ title, summary, content, ... }] }] }
  const topicDetails = topic.levels[0].topics[0];

  return (
    <div>
      <h1>{topic.seriesTitle}</h1>
      <h2>{topicDetails.title}</h2>
      <p>{topicDetails.summary}</p>
      <div className="whitespace-pre-wrap">{topicDetails.content}</div>
      {/* Add images, quiz, etc. if desired */}
    </div>
  );
}

export default ModuleDetails;
