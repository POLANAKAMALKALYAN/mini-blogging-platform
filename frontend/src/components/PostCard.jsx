import React from 'react';
import './PostCard.css';

export default function PostCard({ post, onSelect }) {
  // Helper to calculate reading time
  const getReadingTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Helper to format date
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // Get author initials
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <article className="post-card glass animate-fade-in" onClick={() => onSelect(post.id)}>
      <div className="card-header">
        <div className="author-avatar" title={post.author}>
          {getInitials(post.author)}
        </div>
        <div className="card-meta">
          <span className="author-name">{post.author}</span>
          <span className="dot">•</span>
          <span className="post-date">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="card-title">{post.title}</h3>
        <p className="card-summary">{post.summary}</p>
      </div>

      <div className="card-footer">
        <span className="read-time">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="footer-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {getReadingTime(post.content)} min read
        </span>
        
        <span className="btn-read-more">
          Read Post
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="arrow-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </article>
  );
}
