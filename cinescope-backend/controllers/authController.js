import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
    const { firstName, lastName, email, password, country } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security
        
        // Create new user with all form fields
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            country, // Add country field
            createdAt: new Date()
        });

        // Save user to database
        const savedUser = await newUser.save();
        
        // Return success but don't automatically log them in
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful. Please login.',
            userId: savedUser._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.status(200).json({ 
            user: { 
                id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email,
                country: user.country 
            }, 
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};