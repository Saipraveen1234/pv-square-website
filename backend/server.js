// Backend API - server.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - IMPORTANT: Order matters here
app.use('/uploads', express.static('uploads'));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static(path.join(__dirname, '../public')));

// JWT Secret (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create uploads directory if it doesn't exist
        require('fs').mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

// Mock database (replace with actual database in production)
let db = {
    users: [
        {
            id: '1',
            username: 'admin',
            password: '$2a$10$I8vm5QScRiKafNV6G2A.quP2HW7qZD2AZ6Jbu1Ec2cM1qrbgBdmIy', // This is 'admin123'
            email: 'admin@abhistadesigners.com'
        }
    ],  
    slides: [],
    projects: [],
    settings: {
        contact: {
            email: 'abhistadesigner@gmail.com',
            phone: '+91 93999 71717',
            address: 'Hyderabad, Telangana, India'
        }
    }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// API Routes (all API routes should be under /api prefix)

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = db.users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
});

// Slides routes
app.get('/api/slides', authenticateToken, (req, res) => {
    res.json(db.slides);
});

app.get('/api/slides/:id', authenticateToken, (req, res) => {
    const slide = db.slides.find(s => s.id === req.params.id);
    if (!slide) {
        return res.status(404).json({ message: 'Slide not found' });
    }
    res.json(slide);
});

app.post('/api/slides', authenticateToken, upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]), (req, res) => {
    const { title, description } = req.body;
    
    const newSlide = {
        id: Date.now().toString(),
        title,
        description,
        desktopImage: req.files['desktopImage'] ? `/uploads/${req.files['desktopImage'][0].filename}` : null,
        mobileImage: req.files['mobileImage'] ? `/uploads/${req.files['mobileImage'][0].filename}` : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.slides.push(newSlide);
    res.status(201).json(newSlide);
});

app.put('/api/slides/:id', authenticateToken, upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]), (req, res) => {
    const slideIndex = db.slides.findIndex(s => s.id === req.params.id);
    if (slideIndex === -1) {
        return res.status(404).json({ message: 'Slide not found' });
    }

    const { title, description } = req.body;
    const slide = db.slides[slideIndex];

    slide.title = title || slide.title;
    slide.description = description || slide.description;
    
    if (req.files['desktopImage']) {
        slide.desktopImage = `/uploads/${req.files['desktopImage'][0].filename}`;
    }
    
    if (req.files['mobileImage']) {
        slide.mobileImage = `/uploads/${req.files['mobileImage'][0].filename}`;
    }
    
    slide.updatedAt = new Date().toISOString();

    db.slides[slideIndex] = slide;
    res.json(slide);
});

app.delete('/api/slides/:id', authenticateToken, (req, res) => {
    const slideIndex = db.slides.findIndex(s => s.id === req.params.id);
    if (slideIndex === -1) {
        return res.status(404).json({ message: 'Slide not found' });
    }

    db.slides.splice(slideIndex, 1);
    res.json({ message: 'Slide deleted successfully' });
});

// Projects routes
app.get('/api/projects', authenticateToken, (req, res) => {
    res.json(db.projects);
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
    const project = db.projects.find(p => p.id === req.params.id);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
});

app.post('/api/projects', authenticateToken, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'projectImages', maxCount: 10 }
]), (req, res) => {
    const { title, category, description, client, location, year, area } = req.body;
    
    const newProject = {
        id: Date.now().toString(),
        title,
        category,
        description,
        client,
        location,
        year,
        area,
        coverImage: req.files['coverImage'] ? `/uploads/${req.files['coverImage'][0].filename}` : null,
        images: req.files['projectImages'] ? req.files['projectImages'].map(file => `/uploads/${file.filename}`) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.projects.push(newProject);
    res.status(201).json(newProject);
});

app.put('/api/projects/:id', authenticateToken, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'projectImages', maxCount: 10 }
]), (req, res) => {
    const projectIndex = db.projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const { title, category, description, client, location, year, area } = req.body;
    const project = db.projects[projectIndex];

    project.title = title || project.title;
    project.category = category || project.category;
    project.description = description || project.description;
    project.client = client || project.client;
    project.location = location || project.location;
    project.year = year || project.year;
    project.area = area || project.area;
    
    if (req.files['coverImage']) {
        project.coverImage = `/uploads/${req.files['coverImage'][0].filename}`;
    }
    
    if (req.files['projectImages']) {
        // Add new images to existing ones
        const newImages = req.files['projectImages'].map(file => `/uploads/${file.filename}`);
        project.images = [...(project.images || []), ...newImages];
    }
    
    project.updatedAt = new Date().toISOString();

    db.projects[projectIndex] = project;
    res.json(project);
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    const projectIndex = db.projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }

    db.projects.splice(projectIndex, 1);
    res.json({ message: 'Project deleted successfully' });
});

// Settings routes
app.get('/api/settings/contact', authenticateToken, (req, res) => {
    res.json(db.settings.contact);
});

app.put('/api/settings/contact', authenticateToken, (req, res) => {
    const { email, phone, address } = req.body;
    
    db.settings.contact = {
        email: email || db.settings.contact.email,
        phone: phone || db.settings.contact.phone,
        address: address || db.settings.contact.address
    };
    
    res.json(db.settings.contact);
});

app.put('/api/settings/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    res.json({ message: 'Password updated successfully' });
});

// Public API routes (no authentication required)
app.get('/api/public/slides', (req, res) => {
    res.json(db.slides);
});

app.get('/api/public/projects', (req, res) => {
    res.json(db.projects);
});

// Handle admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Handle all other routes by sending the main index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`Main site: http://localhost:${PORT}`);
});

module.exports = app;