const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'posts.json');

// Initial seed data
const seedData = [
  {
    id: 1,
    title: 'Unveiling the Secrets of CSS Grid & Bento Layouts',
    summary: 'Explore how CSS Grid allows you to build asymmetrical, content-rich, and visually striking "Bento Box" layouts inspired by Apple design patterns.',
    content: 'Bento box layouts have taken the web design world by storm. Originating from the Japanese bento lunchbox, this design pattern arranges content into clean, nested rectangular compartments. In this article, we cover how to leverage CSS grid properties like grid-template-areas, grid-column-span, and subtle glassmorphic borders to construct your own bento layouts. They are responsive, look incredibly sleek, and help organize disparate data elegantly on a single canvas.',
    author: 'Alex River',
    publishedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 2,
    title: 'The Art of Glassmorphism in Modern Web Interfaces',
    summary: 'A deep dive into using backdrop-filter, gradients, and transparency to craft state-of-the-art translucent user interfaces that feel premium.',
    content: 'Glassmorphism is a UI design trend that mimics the look of frosted glass. It relies on a combination of multi-layered translucent surfaces, background blur effects, and vibrant glowing gradients behind the glass pane. By combining CSS backdrop-filter: blur() with border shadows and semi-transparent border outlines, developers can create stunning visual depth. Learn when to use it, how to handle contrast ratios for accessibility, and why it remains a popular choice for premium applications.',
    author: 'Sophia Vance',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: 3,
    title: 'Building High-Performance APIs with Node.js and SQLite',
    summary: 'Why SQLite is the perfect fit for small to medium scale backend services, microservices, prototype applications, and local coding challenges.',
    content: 'When starting a new project, many developers default to heavy database solutions like PostgreSQL or MongoDB. However, for a wide array of applications, SQLite is more than sufficient. As a self-contained, serverless database engine, SQLite reads and writes directly to ordinary disk files. We discuss the simplicity, speed, concurrency limits, and how to wrap SQLite callback-based queries into clean ES6 promises in Node.js applications for a seamless developer experience.',
    author: 'Lucas Thorne',
    publishedAt: new Date().toISOString() // Just now
  }
];

// Helper to read posts from file
function readData() {
  try {
    if (!fs.existsSync(dbPath)) {
      writeData(seedData);
      return seedData;
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON DB:', err.message);
    return [];
  }
}

// Helper to write posts to file
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to JSON DB:', err.message);
  }
}

// Emulate SQLite Promise wrapper helpers
const queries = {
  all: async (sql, params = []) => {
    const posts = readData();
    // Sort logic: 'ORDER BY publishedAt DESC'
    if (sql.includes('ORDER BY publishedAt DESC')) {
      return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }
    return posts;
  },
  
  get: async (sql, params = []) => {
    const posts = readData();
    const id = params[0];
    if (!id) return null;
    return posts.find(p => p.id === parseInt(id)) || null;
  },

  run: async (sql, params = []) => {
    const posts = readData();
    
    // Check if INSERT
    if (sql.includes('INSERT INTO posts')) {
      const [title, summary, content, author, publishedAt] = params;
      const nextId = posts.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
      
      const newPost = {
        id: nextId,
        title,
        summary,
        content,
        author,
        publishedAt
      };
      
      posts.push(newPost);
      writeData(posts);
      return { id: nextId, changes: 1 };
    }
    
    // Check if UPDATE
    if (sql.includes('UPDATE posts SET')) {
      const [title, summary, content, author, id] = params;
      const index = posts.findIndex(p => p.id === parseInt(id));
      if (index === -1) return { id, changes: 0 };
      
      posts[index] = {
        ...posts[index],
        title,
        summary,
        content,
        author
      };
      
      writeData(posts);
      return { id: parseInt(id), changes: 1 };
    }
    
    // Check if DELETE
    if (sql.includes('DELETE FROM posts')) {
      const id = params[0];
      const index = posts.findIndex(p => p.id === parseInt(id));
      if (index === -1) return { id, changes: 0 };
      
      posts.splice(index, 1);
      writeData(posts);
      return { id: parseInt(id), changes: 1 };
    }

    return { changes: 0 };
  }
};

console.log('Using file-based JSON database store at:', dbPath);
// Initialize file if not existing
readData();

module.exports = queries;
