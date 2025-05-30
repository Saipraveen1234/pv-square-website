// backend/scripts/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Settings = require('../models/Settings');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abhista-designers');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@abhistadesigners.com'
        });
        
        await adminUser.save();
        console.log('Admin user created successfully!');
        
        // Create default settings if they don't exist
        const existingSettings = await Settings.findOne();
        if (!existingSettings) {
            const defaultSettings = new Settings({
                contact: {
                    email: 'abhistadesigner@gmail.com',
                    phone: '+91 93999 71717',
                    address: 'Hyderabad, Telangana, India'
                }
            });
            await defaultSettings.save();
            console.log('Default settings created successfully!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();