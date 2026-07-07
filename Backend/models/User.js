import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", UserSchema);
