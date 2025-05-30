// backend/server.js
const express = require('express');
const cors = require('cors');

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import models
const User = require('./models/user');
const Slide = require('./models/Slide');
const Project = require('./models/Project');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static(path.join(__dirname, '../public')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
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
        fileSize: 50 * 1024 * 1024, // 50MB per file
        files: 20
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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Slides routes
app.get('/api/slides', authenticateToken, async (req, res) => {
    try {
        const slides = await Slide.find().sort({ createdAt: -1 });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/slides/:id', authenticateToken, async (req, res) => {
    try {
        const slide = await Slide.findById(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' });
        }
        res.json(slide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/slides', authenticateToken, upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const newSlide = new Slide({
            title,
            description,
            desktopImage: req.files['desktopImage'] ? `/uploads/${req.files['desktopImage'][0].filename}` : null,
            mobileImage: req.files['mobileImage'] ? `/uploads/${req.files['mobileImage'][0].filename}` : null
        });

        const savedSlide = await newSlide.save();
        res.status(201).json(savedSlide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/slides/:id', authenticateToken, upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const slide = await Slide.findById(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' });
        }

        const { title, description } = req.body;

        slide.title = title || slide.title;
        slide.description = description || slide.description;
        
        if (req.files['desktopImage']) {
            slide.desktopImage = `/uploads/${req.files['desktopImage'][0].filename}`;
        }
        
        if (req.files['mobileImage']) {
            slide.mobileImage = `/uploads/${req.files['mobileImage'][0].filename}`;
        }

        const updatedSlide = await slide.save();
        res.json(updatedSlide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/slides/:id', authenticateToken, async (req, res) => {
    try {
        const slide = await Slide.findById(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' });
        }

        await slide.deleteOne();
        res.json({ message: 'Slide deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Projects routes
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/projects', authenticateToken, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'projectImages', maxCount: 20 }
]), async (req, res) => {
    try {
        const { title, category, description, client, location, year, area } = req.body;
        
        const newProject = new Project({
            title,
            category,
            description,
            client,
            location,
            year,
            area,
            coverImage: req.files['coverImage'] ? `/uploads/${req.files['coverImage'][0].filename}` : null,
            images: req.files['projectImages'] ? req.files['projectImages'].map(file => `/uploads/${file.filename}`) : []
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/projects/:id', authenticateToken, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'projectImages', maxCount: 20 }
]), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { title, category, description, client, location, year, area } = req.body;

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
            const newImages = req.files['projectImages'].map(file => `/uploads/${file.filename}`);
            project.images = [...(project.images || []), ...newImages];
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Settings routes
app.get('/api/settings/contact', authenticateToken, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({
                contact: {
                    email: 'abhistadesigner@gmail.com',
                    phone: '+91 93999 71717',
                    address: 'Hyderabad, Telangana, India'
                }
            });
            await settings.save();
        }
        res.json(settings.contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/settings/contact', authenticateToken, async (req, res) => {
    try {
        const { email, phone, address } = req.body;
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ contact: {} });
        }
        
        settings.contact = {
            email: email || settings.contact.email,
            phone: phone || settings.contact.phone,
            address: address || settings.contact.address
        };
        
        await settings.save();
        res.json(settings.contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/settings/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public API routes (no authentication required)
app.get('/api/public/slides', async (req, res) => {
    try {
        const slides = await Slide.find().sort({ createdAt: -1 });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/public/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Handle admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Handle all other routes for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'File size too large. Maximum file size is 50MB.' 
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                message: 'Too many files. Maximum is 20 files per upload.' 
            });
        }
    }
    
    res.status(500).json({ message: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main site: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

module.exports = app;