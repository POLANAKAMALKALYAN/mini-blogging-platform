import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PostCard from './components/PostCard';
import PostForm from './components/PostForm';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'post' | 'create' | 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state (check local storage or default to dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Modal and Toast state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch all posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // API Call: GET all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
      showToast('Could not fetch blog posts from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  // API Call: GET single post
  const selectPost = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch post details');
      const data = await response.json();
      setSelectedPost(data);
      setCurrentView('post');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      showToast('Could not load post details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // API Call: POST create post
  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create post');
      }
      showToast('Post published successfully!');
      fetchPosts();
      setCurrentView('home');
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };

  // API Call: PUT update post
  const handleUpdatePost = async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update post');
      }
      showToast('Post updated successfully!');
      fetchPosts();
      // Reload post details view
      selectPost(selectedPost.id);
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    }
  };

  // API Call: DELETE post
  const handleDeletePost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${selectedPost.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete post');
      showToast('Post deleted successfully.', 'info');
      setIsDeleteModalOpen(false);
      setSelectedPost(null);
      fetchPosts();
      setCurrentView('home');
    } catch (error) {
      console.error(error);
      showToast('Error deleting post', 'error');
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="app-layout">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <Header 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'home') setSelectedPost(null);
        }} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="container main-content">
        {loading && (
          <div className="loader-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {/* --- VIEW: HOME --- */}
        {currentView === 'home' && (
          <div className="home-view">
            <section className="hero-section text-center">
              <h1 className="hero-title">
                Crafting Ideas on the <br />
                <span className="hero-gradient">Bento Box Canvas</span>
              </h1>
              <p className="hero-subtitle">
                A minimalistic, premium writing platform built for thinkers, designers, and developers.
              </p>
              
              <div className="search-bar-container glass">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search articles by title, author, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>&times;</button>
                )}
              </div>
            </section>

            {filteredPosts.length > 0 ? (
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onSelect={selectPost} 
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state glass">
                <span className="empty-icon">📁</span>
                <h3>No articles found</h3>
                <p>We couldn't find any articles matching "{searchQuery}". Try writing a different keyword.</p>
                {searchQuery && (
                  <button className="btn-reset" onClick={() => setSearchQuery('')}>Clear Search</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: POST DETAIL --- */}
        {currentView === 'post' && selectedPost && (
          <article className="post-detail-view animate-fade-in">
            <button className="btn-back" onClick={() => {
              setCurrentView('home');
              setSelectedPost(null);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="back-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Feed
            </button>

            <header className="post-detail-header text-center">
              <h1 className="post-detail-title">{selectedPost.title}</h1>
              
              <div className="post-detail-meta glass">
                <div className="detail-author-avatar">
                  {getInitials(selectedPost.author)}
                </div>
                <div className="meta-text">
                  <span className="meta-author">Written by <strong>{selectedPost.author}</strong></span>
                  <span className="meta-divider">|</span>
                  <span className="meta-date">{formatDate(selectedPost.publishedAt)}</span>
                </div>
              </div>
            </header>

            {selectedPost.summary && (
              <div className="post-detail-summary-box glass">
                <strong>Overview:</strong> {selectedPost.summary}
              </div>
            )}

            <div className="post-detail-content">
              {selectedPost.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <footer className="post-detail-footer">
              <div className="detail-actions glass">
                <button className="btn-edit" onClick={() => setCurrentView('edit')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  Edit Post
                </button>
                <button className="btn-delete" onClick={() => setIsDeleteModalOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="action-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete Post
                </button>
              </div>
            </footer>

            <DeleteModal 
              isOpen={isDeleteModalOpen}
              postTitle={selectedPost.title}
              onConfirm={handleDeletePost}
              onCancel={() => setIsDeleteModalOpen(false)}
            />
          </article>
        )}

        {/* --- VIEW: CREATE --- */}
        {currentView === 'create' && (
          <PostForm 
            onSubmit={handleCreatePost} 
            onCancel={() => setCurrentView('home')} 
          />
        )}

        {/* --- VIEW: EDIT --- */}
        {currentView === 'edit' && selectedPost && (
          <PostForm 
            post={selectedPost}
            onSubmit={handleUpdatePost} 
            onCancel={() => setCurrentView('post')} 
          />
        )}
      </main>
      
      <footer className="app-footer text-center">
        <p>© 2026 BentoBlog. Crafted with passion & glassmorphic aesthetics.</p>
      </footer>
    </div>
  );
}
