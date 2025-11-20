# Blog System Setup Guide

This blog system uses MongoDB to store blog posts. You'll write posts directly to the database (no admin UI).

## Prerequisites

- Node.js installed (v14 or higher)
- MongoDB installed locally OR MongoDB Atlas account

## Setup Instructions

### 1. Install Dependencies

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

### 2. Configure MongoDB

#### Option A: Local MongoDB
1. Make sure MongoDB is running on your machine
2. The default connection string is already set: `mongodb://localhost:27017/yahallo-blog`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Copy `.env.example` to `.env` and update `MONGODB_URI` with your Atlas connection string

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yahallo-blog
```

### 3. Start the Server

From the backend folder:

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Access the Blog

- Blog listing page: `http://localhost:3000/blog.html`
- Home page: `http://localhost:3000/index.html`

## Adding Blog Posts to MongoDB

Since there's no admin UI, you'll add posts directly to MongoDB. Here are several ways:

### Method 1: Using MongoDB Compass (GUI - Recommended)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your database
3. Navigate to `yahallo-blog` database → `blogposts` collection
4. Click "Insert Document"
5. Add a document with this structure:

```json
{
  "title": "Your Blog Title",
  "author": "Tomo",
  "category": "Grandma's Little Store",
  "content": "Your full blog post content here. You can use multiple paragraphs separated by double newlines.\n\nThis is a second paragraph.",
  "excerpt": "A short preview of your blog post (optional, will be auto-generated if not provided)",
  "imageUrl": "Images/YourImage.png",
  "publishedAt": "2025-02-12T00:00:00.000Z"
}
```

### Method 2: Using MongoDB Shell (mongosh)

```javascript
use yahallo-blog

db.blogposts.insertOne({
  title: "Your Blog Title",
  author: "Tomo",
  category: "Grandma's Little Store",
  content: "Your full blog post content here.\n\nThis is a second paragraph.",
  excerpt: "A short preview (optional)",
  imageUrl: "Images/YourImage.png",
  publishedAt: new Date("2025-02-12")
})
```

### Method 3: Using Node.js Script

Create a file `backend/add-post.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const blogPostSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  content: String,
  excerpt: String,
  imageUrl: String,
  publishedAt: Date,
  createdAt: Date
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

async function addPost() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yahallo-blog');
  
  const post = new BlogPost({
    title: "Your Blog Title",
    author: "Tomo",
    category: "Grandma's Little Store",
    content: "Your full blog post content here.\n\nThis is a second paragraph.",
    excerpt: "A short preview",
    imageUrl: "Images/YourImage.png",
    publishedAt: new Date("2025-02-12")
  });
  
  await post.save();
  console.log('Post added:', post._id);
  await mongoose.disconnect();
}

addPost();
```

Run it from the backend folder:
```bash
cd backend
node add-post.js
```

## Blog Post Schema

- `title` (required): Blog post title
- `author` (default: "Tomo"): Author name
- `category` (default: "Grandma's Little Store"): Category name
- `content` (required): Full blog post content (use `\n\n` for paragraph breaks)
- `excerpt` (optional): Short preview text (auto-generated from content if not provided)
- `imageUrl` (optional): Path to blog post image
- `publishedAt` (default: current date): Publication date
- `createdAt` (default: current date): Creation timestamp

## API Endpoints

- `GET /api/posts?page=1&limit=10` - Get paginated list of blog posts
- `GET /api/posts/:id` - Get single blog post by ID

## Notes

- Make sure the server is running when viewing blog pages
- Images should be placed in the `Images/` folder
- The blog pages fetch data from the API, so they need the server running
- For production, update `API_BASE_URL` in `blog.js` and `blog-post.js` to your production server URL

