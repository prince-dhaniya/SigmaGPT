import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 3) {
        return res.status(400).json({ error: "Password must be at least 3 characters." });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                plan: user.plan,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.log("Signup error:", err);
        res.status(500).json({ error: "Failed to create account." });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                plan: user.plan,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.log("Login error:", err);
        res.status(500).json({ error: "Login failed." });
    }
});

// Get current user info
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            plan: user.plan,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.log("Get user error:", err);
        res.status(500).json({ error: "Failed to get user info." });
    }
});

// Update user plan tier
router.put("/plan", authMiddleware, async (req, res) => {
    const { plan } = req.body;
    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan type." });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { plan },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            plan: user.plan,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.log("Update plan error:", err);
        res.status(500).json({ error: "Failed to update plan." });
    }
});

// Update username
router.put("/username", authMiddleware, async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
        return res.status(400).json({ error: "Username must be at least 2 characters long." });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { username: username.trim() },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            plan: user.plan,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.log("Update username error:", err);
        res.status(500).json({ error: "Failed to update username." });
    }
});

// Delete user account
router.delete("/delete", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json({ success: "Account deleted successfully." });
    } catch (err) {
        console.log("Delete account error:", err);
        res.status(500).json({ error: "Failed to delete account." });
    }
});

export default router;
