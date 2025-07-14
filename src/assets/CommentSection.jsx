import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./CommentSection.css";

const CommentSection = ({ topicId, userEmail }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [replyTo, setReplyTo] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const inputRef = useRef(null);

    const commentsPerPage = 5;

    useEffect(() => {
        fetchComments();
    }, [topicId]);

    useEffect(() => {
        if (replyTo && inputRef.current) inputRef.current.focus();
    }, [replyTo]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:2100/api/comments/${topicId}`);
            setComments(res.data);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:2100/api/comments", {
                topicId,
                userEmail,
                text,
                parentId: replyTo || null,
            });
            setText("");
            setReplyTo(null);
            fetchComments();
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (commentId, type) => {
        try {
            await axios.post(`http://localhost:2100/api/comments/vote/${commentId}`, {
                type,
                userEmail,
            });
            fetchComments();
        } catch (err) {
            console.error("Error voting:", err);
        }
    };

    const toggleReplyVisibility = (id) => {
        setExpandedReplies((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const cancelReply = () => {
        setReplyTo(null);
        setText("");
    };

    const countNestedReplies = (id, all) => {
        let count = 0;
        const map = new Map(all.map(c => [c._id, c]));
        const queue = [id];

        while (queue.length) {
            const current = queue.shift();
            const children = all.filter(c => String(c.parentId) === String(current));
            count += children.length;
            queue.push(...children.map(c => c._id));
        }

        return count;
    };

    const findTopLevelParent = (id, all) => {
        const map = new Map(all.map(c => [c._id, c]));
        let current = map.get(id);
        while (current && current.parentId) {
            current = map.get(String(current.parentId));
        }
        return current?._id || null;
    };

    const sortComments = (list) => {
        const topLevel = list.filter(c => !c.parentId);

        if (sortBy === "upvotes") {
            return [...topLevel].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        }

        if (sortBy === "most-replied") {
            const replyCounts = {};
            list.forEach((c) => {
                if (c.parentId) {
                    const root = findTopLevelParent(c._id, list);
                    if (root) replyCounts[root] = (replyCounts[root] || 0) + 1;
                }
            });

            return [...topLevel].sort((a, b) => {
                const countA = replyCounts[a._id] || 0;
                const countB = replyCounts[b._id] || 0;
                return countB - countA;
            });
        }

        return [...topLevel].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const paginate = (list) => {
        const start = (currentPage - 1) * commentsPerPage;
        return list.slice(start, start + commentsPerPage);
    };

    const renderReplies = (parentId, depth = 1) => {
        const children = comments.filter(c => String(c.parentId) === String(parentId));
        if (!expandedReplies[parentId]) return null;

        return (
            <div className="replies">
                {children.map(reply => (
                    <div key={reply._id} className="comment-box nested-reply">
                        <div className="comment-header">{reply.userEmail}</div>
                        <div className="comment-body">{reply.text}</div>
                        <div className="comment-footer">
                            <small>{new Date(reply.createdAt).toLocaleString()}</small>
                            <div className="vote-controls">
                                <button
                                    className={`thumb-button ${reply.votedBy?.includes(userEmail + "-up") ? "active" : ""}`}
                                    onClick={() => handleVote(reply._id, "upvote")}
                                >
                                    <i className="far fa-thumbs-up" />
                                </button>
                                <span>{reply.upvotes || 0}</span>
                                <button
                                    className={`thumb-button ${reply.votedBy?.includes(userEmail + "-down") ? "active" : ""}`}
                                    onClick={() => handleVote(reply._id, "downvote")}
                                >
                                    <i className="far fa-thumbs-down" />
                                </button>
                                <span>{reply.downvotes || 0}</span>
                                <button className="reply-btn" onClick={() => setReplyTo(reply._id)}>Reply</button>
                            </div>
                            {comments.some(c => String(c.parentId) === String(reply._id)) && (
                                <button
                                    className="show-more-btn"
                                    onClick={() => toggleReplyVisibility(reply._id)}
                                >
                                    {expandedReplies[reply._id] ? "Hide" : "Show"} replies ({countNestedReplies(reply._id, comments)})
                                </button>
                            )}
                        </div>
                        {renderReplies(reply._id, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

    const renderComments = () => {
        const visibleTopLevel = paginate(sortComments(comments));

        return visibleTopLevel.map(comment => {
            const replyCount = countNestedReplies(comment._id, comments);
            return (
                <div key={comment._id} className="comment-box">
                    <div className="comment-header">{comment.userEmail}</div>
                    <div className="comment-body">{comment.text}</div>
                    <div className="comment-footer">
                        <small>{new Date(comment.createdAt).toLocaleString()}</small>
                        <div className="vote-controls">
                            <button
                                className={`thumb-button ${comment.votedBy?.includes(userEmail + "-up") ? "active" : ""}`}
                                onClick={() => handleVote(comment._id, "upvote")}
                            >
                                <i className="far fa-thumbs-up" />
                            </button>
                            <span>{comment.upvotes || 0}</span>
                            <button
                                className={`thumb-button ${comment.votedBy?.includes(userEmail + "-down") ? "active" : ""}`}
                                onClick={() => handleVote(comment._id, "downvote")}
                            >
                                <i className="far fa-thumbs-down" />
                            </button>
                            <span>{comment.downvotes || 0}</span>
                            <button className="reply-btn" onClick={() => setReplyTo(comment._id)}>Reply</button>
                        </div>
                        {comments.some(c => String(c.parentId) === String(comment._id)) && (
                            <button
                                className="show-more-btn"
                                onClick={() => toggleReplyVisibility(comment._id)}
                            >
                                {expandedReplies[comment._id] ? "Hide" : "Show"} replies ({replyCount})
                            </button>
                        )}
                    </div>
                    {renderReplies(comment._id)}
                </div>
            );
        });
    };

    const replyToText = replyTo && comments.find((c) => c._id === replyTo)?.text;

    return (
        <div className="comment-section">
            <div className="sort-section">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="upvotes">Most Upvoted</option>
                    <option value="most-replied">Most Replied</option>
                </select>
            </div>

            {replyTo && (
                <div className="reply-indicator">
                    <div className="reply-preview">{replyToText}</div>
                    <button onClick={cancelReply} className="cancel-reply">Cancel</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="new-comment-form">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {replyTo ? "Reply" : "Comment"}
                </button>
            </form>

            <div className="all-comments">{renderComments()}</div>

            <div className="pagination">
                {Array.from({ length: Math.ceil(comments.filter(c => !c.parentId).length / commentsPerPage) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "active" : ""}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;