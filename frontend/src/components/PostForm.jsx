import React, { useState, useEffect } from 'react';
import './PostForm.css';

export default function PostForm({ post, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setAuthor(post.author || '');
      setSummary(post.summary || '');
      setContent(post.content || '');
    } else {
      setTitle('');
      setAuthor('');
      setSummary('');
      setContent('');
    }
  }, [post]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!author.trim()) newErrors.author = 'Author name is required';
    if (!content.trim()) newErrors.content = 'Post content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim(),
        content: content.trim()
      });
    }
  };

  return (
    <div className="post-form-container glass animate-fade-in">
      <div className="form-header">
        <h2>{post ? 'Edit Blog Post' : 'Create New Post'}</h2>
        <div className="form-tabs">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Write
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => {
              if (validate()) setActiveTab('preview');
            }}
          >
            Preview
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input 
              type="text" 
              id="title"
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: ''});
              }}
              placeholder="e.g. Master the Backdrop Filter in CSS"
              className={errors.title ? 'error-input' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author">Author Name</label>
              <input 
                type="text" 
                id="author"
                value={author} 
                onChange={(e) => {
                  setAuthor(e.target.value);
                  if (errors.author) setErrors({...errors, author: ''});
                }}
                placeholder="e.g. John Doe"
                className={errors.author ? 'error-input' : ''}
              />
              {errors.author && <span className="error-text">{errors.author}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="summary">Short Summary <span className="label-optional">(Optional)</span></label>
              <input 
                type="text" 
                id="summary"
                value={summary} 
                onChange={(e) => setSummary(e.target.value)}
                maxLength={200}
                placeholder="Provide a quick 1-2 sentence preview"
              />
              <span className="char-counter">{summary.length}/200</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Full Content</label>
            <textarea 
              id="content"
              rows={12}
              value={content} 
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({...errors, content: ''});
              }}
              placeholder="Draft your thoughts here... Use markdown or plain text."
              className={errors.content ? 'error-input' : ''}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {post ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="preview-container">
          <div className="preview-meta">
            <span className="preview-author">By <strong>{author}</strong></span>
            <span className="preview-date">Drafting now</span>
          </div>
          <h1 className="preview-title">{title}</h1>
          {summary && <p className="preview-summary">{summary}</p>}
          <div className="preview-body">
            {content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setActiveTab('edit')}>
              Back to Editor
            </button>
            <button type="button" className="btn-submit" onClick={handleSubmit}>
              {post ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
