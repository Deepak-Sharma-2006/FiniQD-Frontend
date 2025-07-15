import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../api"; // adjust path if needed
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "./TopicDetails.css";

const TopicDetails = () => {
  const { levelId, topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false); // Add toggle state for quiz

  const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest@example.com";

  const numericLevel = parseInt(levelId.replace(/[^0-9]/g, ""));
  const topicNumber = parseInt(topicId.split("-")[2], 10);
  const topicPrefix = topicId.split("-").slice(0, 2).join("-");
  const isFirstTopic = topicNumber === 1;
  const isLastTopic = topicNumber === 10;

  const getPreviousLink = () => {
    if (numericLevel === 1 && isFirstTopic) return "/modules";
    if (numericLevel > 1 && isFirstTopic) {
      const prevLevel = numericLevel - 1;
      return `/levels/${prevLevel}/topics/level${prevLevel}-topic-010`;
    }
    return `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber - 1).padStart(3, "0")}`;
  };

  const nextLink = isLastTopic
    ? null
    : `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber + 1).padStart(3, "0")}`;

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setTopic(null);
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(null);

        const levelNumber = levelId.replace(/[^0-9]/g, "");
        const res = await axios.get(`${API}/api/levels/${levelNumber}/topics/${topicId}`);

        setTopic(res.data);
        window.scrollTo(0, 0);

        if (!sessionStorage.getItem("visitedTopic")) {
          sessionStorage.setItem("visitedTopic", "true");
        } else {
          navigate(`/levels/${levelId}/topics/${topicId}`, { replace: true });
        }
      } catch (err) {
        setError("Could not load topic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [levelId, topicId, navigate]);

  const formatContent = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const handleSubmit = async () => {
    const totalQuestions = topic.quiz.length;
    const answered = Object.keys(selectedAnswers).length;
    const unansweredCount = totalQuestions - answered;

    if (answered === 0) {
      await showThemeAwareAlert({
        icon: "warning",
        title: "No Answers Selected",
        text: "Please answer at least one question before submitting.",
      });
      return;
    }

    if (unansweredCount > 0) {
      const result = await showThemeAwareAlert({
        title: "Some Questions Unanswered",
        text: `You have left ${unansweredCount} question(s) unanswered. Do you still want to submit?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Submit Anyway",
        cancelButtonText: "No, Go Back",
      });

      if (!result.isConfirmed) return;
    }

    let correct = 0;
    topic.quiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const selectedText = q.options[selected];
      // Support both correctAnswer and answer fields
      const correctAns = q.correctAnswer || q.answer;
      if (selectedText === correctAns) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    await showThemeAwareAlert({
      icon: "success",
      title: "Quiz Submitted!",
      toast: false,
      timer: 2500,
      showConfirmButton: false,
      position: "center",
    });


    try {
      await axios.post(`${API}/api/quiz-scores/submit`, {

        userEmail,
        levelId: numericLevel,
        topicId: topic.customId,
        score: correct,
        total: totalQuestions,
      });
    } catch (err) {
      if (err.response?.status === 409) {
        await showThemeAwareAlert({
          title: "⚠️ Duplicate",
          text: "You have already submitted this quiz.",
          icon: "info"
        });
      } else {
        console.error("Quiz submission error", err);
        await showThemeAwareAlert({
          title: "Error",
          text: "There was an error submitting your quiz.",
          icon: "error"
        });
      }
    }
  };

  // Add Swal theme configuration
  const getThemeColors = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      background: computedStyle.getPropertyValue('--card-bg-color').trim(),
      color: computedStyle.getPropertyValue('--text-color').trim(),
      confirmButtonBg: computedStyle.getPropertyValue('--button-primary-bg-color').trim(),
      confirmButtonColor: computedStyle.getPropertyValue('--button-primary-text-color').trim(),
      cancelButtonBg: computedStyle.getPropertyValue('--button-bg-color').trim(),
      cancelButtonColor: computedStyle.getPropertyValue('--text-color').trim(),
    };
  };

  const showThemeAwareAlert = (options) => {
    const colors = getThemeColors();
    return Swal.fire({
      background: colors.background,
      color: colors.color,
      confirmButtonColor: colors.confirmButtonBg,
      cancelButtonColor: colors.cancelButtonBg,
      ...options,
      customClass: {
        confirmButton: 'swal-confirm-button',
        cancelButton: 'swal-cancel-button',
        ...options.customClass,
      },
    });
  };

  if (loading) return <div className="loading">Loading topic...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  return (
    <div className="topic-details-container">
      <div className="topic-header">
        <div className="series-title">{topic.seriesTitle || topic.title}</div>
        <h1>{topic.title || topic.topic}</h1>
        <Link to={`/topics/level-${numericLevel}`} className="back-link">
          ← Back to Topics
        </Link>
        {/* Show additionalImages[0] below the title if present */}
        {Array.isArray(topic.additionalImages) && topic.additionalImages[0] && (
          <div className="topic-image-top" style={{ margin: "20px 0", textAlign: "center" }}>
            <img
              src={topic.additionalImages[0]}
              alt="topic-additional-img-0"
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(25, 118, 210, 0.10)",
              }}
            />
          </div>
        )}
      </div>

      <div className="topic-content">
        {/* Show main image if present (optional, can remove if not needed) */}
        {topic.image && (
          <div className="topic-image" style={{ margin: "20px 0", textAlign: "center" }}>
            <img
              src={topic.image}
              alt={topic.title || topic.topic}
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(25, 118, 210, 0.10)",
              }}
            />
          </div>
        )}
        {/* Main content */}
        <div className="topic-main-content">{formatContent(topic.content || "")}</div>
        {/* Show additionalImages[1] after content if present */}
        {Array.isArray(topic.additionalImages) && topic.additionalImages[1] && (
          <div className="topic-image-after-content" style={{ margin: "20px 0", textAlign: "center" }}>
            <img
              src={topic.additionalImages[1]}
              alt="topic-additional-img-1"
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(25, 118, 210, 0.10)",
              }}
            />
          </div>
        )}
        {/* Show video preview only if videoLinks[0] is present */}
        {Array.isArray(topic.videoLinks) && topic.videoLinks[0] && (
          <>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 25, margin: '32px 0 12px 0', color: '#1976d2', letterSpacing: 1 }}>
              Learn More
            </div>
            <div className="topic-video-preview" style={{ margin: "0 0 32px 0", textAlign: "center" }}>
              {topic.videoLinks[0].includes('youtube.com') || topic.videoLinks[0].includes('youtu.be') ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <iframe
                    src={topic.videoLinks[0].replace('watch?v=', 'embed/')}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: '100%',
                      maxWidth: 720,
                      aspectRatio: '16/9',
                      minHeight: 320,
                      borderRadius: 16,
                      boxShadow: '0 4px 24px rgba(25, 118, 210, 0.18)',
                      border: 'none',
                      background: '#000',
                    }}
                  />
                </div>
              ) : (
                <video
                  src={topic.videoLinks[0]}
                  controls
                  style={{ maxWidth: 720, width: '100%', maxHeight: 400, borderRadius: 16, boxShadow: "0 4px 24px rgba(25, 118, 210, 0.18)", margin: 'auto', display: 'block', background: '#000' }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </>
        )}

        {/* Quiz Toggle Button */}
        {topic.quiz?.length > 0 && (
          <div className="topic-quiz-toggle-wrapper">
            <button
              className="quiz-toggle-btn"
              onClick={() => setQuizOpen((open) => !open)}
              style={{
                background: "var(--button-primary-bg-color)",
                color: "var(--button-primary-text-color)",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontWeight: 600,
                fontSize: "1.1rem",
                margin: "32px auto 0 auto",
                display: "block",
                boxShadow: "0 2px 8px var(--card-shadow-color)",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              {quizOpen ? "Hide Quiz" : "Prove Yourself"}
            </button>
            {quizOpen && (
              <div
                className="topic-quiz quiz-scrollable"
                style={{
                  background: "var(--card-bg-color)",
                  borderRadius: 12,
                  boxShadow: "0 2px 12px var(--card-shadow-color)",
                  padding: 24,
                  marginTop: 24,
                  maxHeight: 480,
                  overflowY: "auto"
                }}
              >
                {topic.quiz.map((q, idx) => {
                  const isUnanswered = submitted && selectedAnswers[idx] === undefined;
                  // Use CSS variables for theme-aware colors
                  const amberTranslucent = 'var(--not-attempted-bg, rgba(255,179,0,0.32))';
                  const correctTranslucent = 'var(--quiz-correct-bg, rgba(56, 183, 70, 0.15))';
                  const wrongTranslucent = 'var(--quiz-wrong-bg, rgba(220, 38, 38, 0.15))';
                  const correctBorder = 'var(--quiz-correct-border, #38b746)';
                  const wrongBorder = 'var(--quiz-wrong-border, #dc2626)';
                  return (
                    <div
                      key={idx}
                      className={`quiz-question ${isUnanswered ? "unanswered-highlight" : ""}`}
                      style={{ position: 'relative', marginBottom: 32 }}
                    >
                      {/* Not Attempted label (theme-aware) */}
                      {isUnanswered && (
                        <div style={{
                          position: 'absolute',
                          top: -28,
                          left: 0,
                          background: amberTranslucent,
                          color: '#fff',
                          fontWeight: 700,
                          padding: '2px 12px',
                          borderRadius: 8,
                          fontSize: 14,
                          boxShadow: '0 2px 8px rgba(255,179,0,0.10)',
                          zIndex: 2
                        }}>
                          Not Attempted
                        </div>
                      )}
                      <h4 style={{ color: "var(--text-color)" }}>Question {idx + 1}</h4>
                      <p style={{ color: "var(--text-color)" }}>{q.question}</p>
                      <div className="quiz-options">
                        {q.options.map((opt, i) => {
                          const isSelected = selectedAnswers[idx] === i;
                          const correctAns = q.correctAnswer || q.answer;
                          const isCorrect = correctAns === opt;
                          let optionClass = "";
                          let symbol = "";
                          let highlightStyle = {};
                          if (submitted) {
                            if (isCorrect) {
                              optionClass = "correct";
                              symbol = "✔";
                              // Theme-aware green translucent for correct answer
                              highlightStyle = {
                                background: correctTranslucent,
                                border: `2px solid ${correctBorder}`,
                                boxShadow: `0 0 0 2px ${correctBorder}`,
                                fontWeight: 600
                              };
                            } else if (isSelected) {
                              optionClass = "wrong";
                              symbol = "❌";
                              // Theme-aware red translucent for wrong selected
                              highlightStyle = {
                                background: wrongTranslucent,
                                border: `2px solid ${wrongBorder}`,
                                boxShadow: `0 0 0 2px ${wrongBorder}`,
                                fontWeight: 600
                              };
                            }
                          } else if (isSelected) {
                            // Blue highlight for selected (not submitted)
                            highlightStyle = {
                              border: '2px solid #1976d2',
                              background: 'rgba(25, 118, 210, 0.10)',
                              boxShadow: '0 0 0 2px #1976d2',
                              fontWeight: 600
                            };
                          }
                          return (
                            <label
                              key={i}
                              className={`quiz-option ${optionClass}`}
                              style={{
                                pointerEvents: submitted ? "none" : "auto",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--button-bg-color)",
                                color: "var(--text-color)",
                                border: optionClass ? `2px solid var(--${optionClass}-border)` : "none",
                                boxShadow: optionClass ? `0 0 0 2px var(--${optionClass}-shadow)` : "none",
                                marginBottom: 8,
                                cursor: submitted ? 'default' : 'pointer',
                                ...highlightStyle
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="radio"
                                  name={`question-${idx}`}
                                  value={i}
                                  checked={isSelected}
                                  onClick={(e) => {
                                    setSelectedAnswers((prev) => {
                                      if (prev[idx] === i) {
                                        // Deselect if already selected
                                        const updated = { ...prev };
                                        delete updated[idx];
                                        return updated;
                                      } else {
                                        return { ...prev, [idx]: i };
                                      }
                                    });
                                  }}
                                  disabled={submitted}
                                  style={{ accentColor: isSelected ? '#1976d2' : undefined, width: 18, height: 18 }}
                                />

                                <span>{opt}</span>
                              </div>
                              {submitted && isCorrect && (
                                <span className="feedback-icon">✔</span>
                              )}
                              {submitted && !isCorrect && isSelected && (
                                <span className="feedback-icon">❌</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!submitted && (
                  <button className="submit-btn" onClick={handleSubmit}>
                    Submit Quiz
                  </button>
                )}
                {submitted && (
                  <div className="quiz-score-result">
                    ✅ You scored {score} out of {topic.quiz.length}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="topic-navigation-buttons" style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          <button className="nav-button" onClick={() => navigate(getPreviousLink(), { replace: true })}>
            ← Previous
          </button>
          <Link to="/modules" className="nav-button">Module Page</Link>
          {nextLink && (
            <button className="nav-button" onClick={() => navigate(nextLink, { replace: true })}>
              Next →
            </button>
          )}
        </div>

        <hr className="comment-divider" style={{ margin: '32px 0 10px 0' }} />
        <div className="comment-section" style={{
          margin: '0 auto',
          maxWidth: 700,
          padding: '0 12px 24px 12px',
          background: 'none',
        }}>
          <h2 className="discussion-title" style={{
            margin: '0 0 2px 0',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-color)'
          }}>💬 Discussion</h2>
          <CommentSection topicId={topic.customId} userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;