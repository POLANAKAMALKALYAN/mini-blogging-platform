const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper validation function
const validatePost = (req, res, next) => {
  const { title, content, author } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Title is required and must be a valid string.');
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    errors.push('Content is required and must be a valid string.');
  }
  if (!author || typeof author !== 'string' || author.trim() === '') {
    errors.push('Author is required and must be a valid string.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

// --- API Endpoints ---

// GET /posts - Fetch all blog posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await db.all('SELECT * FROM posts ORDER BY publishedAt DESC');
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Database error fetching posts' });
  }
});

// GET /posts/:id - Fetch a specific blog post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [id]);
    
    if (!post) {
      return res.status(404).json({ error: `Post with ID ${id} not found` });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err.message);
    res.status(500).json({ error: 'Database error fetching post details' });
  }
});

// POST /posts - Create a new blog post
app.post('/posts', validatePost, async (req, res) => {
  try {
    const { title, summary, content, author } = req.body;
    
    // Auto-generate summary if not provided
    let finalSummary = summary;
    if (!finalSummary || finalSummary.trim() === '') {
      const cleanContent = content.trim();
      finalSummary = cleanContent.length > 150 
        ? cleanContent.substring(0, 150) + '...' 
        : cleanContent;
    }

    const publishedAt = new Date().toISOString();

    const result = await db.run(
      'INSERT INTO posts (title, summary, content, author, publishedAt) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), finalSummary.trim(), content.trim(), author.trim(), publishedAt]
    );

    const newPost = {
      id: result.id,
      title: title.trim(),
      summary: finalSummary.trim(),
      content: content.trim(),
      author: author.trim(),
      publishedAt
    };

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ error: 'Database error creating post' });
  }
});

// PUT /posts/:id - Update an existing blog post
app.put('/posts/:id', validatePost, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, author } = req.body;

    // Verify if post exists
    const existingPost = await db.get('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existingPost) {
      return res.status(404).json({ error: `Post with ID ${id} not found` });
    }

    // Auto-generate summary if not provided
    let finalSummary = summary;
    if (!finalSummary || finalSummary.trim() === '') {
      const cleanContent = content.trim();
      finalSummary = cleanContent.length > 150 
        ? cleanContent.substring(0, 150) + '...' 
        : cleanContent;
    }

    await db.run(
      'UPDATE posts SET title = ?, summary = ?, content = ?, author = ? WHERE id = ?',
      [title.trim(), finalSummary.trim(), content.trim(), author.trim(), id]
    );

    const updatedPost = {
      id: parseInt(id),
      title: title.trim(),
      summary: finalSummary.trim(),
      content: content.trim(),
      author: author.trim(),
      publishedAt: existingPost.publishedAt // Keep original published date
    };

    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err.message);
    res.status(500).json({ error: 'Database error updating post' });
  }
});

// DELETE /posts/:id - Delete a blog post
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify if post exists
    const existingPost = await db.get('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existingPost) {
      return res.status(404).json({ error: `Post with ID ${id} not found` });
    }

    await db.run('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: `Post with ID ${id} successfully deleted`, id: parseInt(id) });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ error: 'Database error deleting post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
