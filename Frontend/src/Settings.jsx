import "./Settings.css";
import { useContext, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { API_BASE_URL } from "./config.js";

function Settings() {
    const { user, token, updateUser, handleLogout, theme, toggleTheme, setCurrentPage, showToast } = useContext(MyContext);
    
    // Inline editing states for username
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || "");

    const handleSaveUsername = async () => {
        if (!newUsername.trim() || newUsername.trim().length < 2) {
            showToast("Username must be at least 2 characters.", "error");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/username`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.error || "Failed to update username.", "error");
                return;
            }

            updateUser(data);
            showToast("Username updated successfully!", "success");
            setIsEditing(false);
        } catch (err) {
            showToast("Failed to connect to server.", "error");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete your account?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/delete`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.error || "Failed to delete account.", "error");
                return;
            }

            handleLogout();
            showToast("Account deleted successfully.", "success");
        } catch (err) {
            showToast("Failed to connect to server.", "error");
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <button className="settings-back-btn" onClick={() => setCurrentPage("chat")}>
                    ← Back
                </button>
                <h1 className="settings-title">Settings</h1>

                {/* Profile Section */}
                {user && (
                    <div className="settings-card">
                        <h3 className="settings-card-title">Profile</h3>
                        
                        {/* Username Row */}
                        <div className="settings-row">
                            <span>Username</span>
                            {isEditing ? (
                                <div className="settings-edit-group">
                                    <input
                                        type="text"
                                        className="settings-edit-input"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
                                        autoFocus
                                    />
                                    <button className="settings-btn-save" onClick={handleSaveUsername}>Save</button>
                                    <button className="settings-btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="settings-value-group">
                                    <span className="settings-value">{user.username}</span>
                                    <button className="settings-btn-edit" onClick={() => { setNewUsername(user.username); setIsEditing(true); }}>
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Row */}
                        <div className="settings-row">
                            <span>Email</span>
                            <span className="settings-value">{user.email}</span>
                        </div>

                        {/* Plan Row */}
                        <div className="settings-row">
                            <span>Plan</span>
                            <span className="settings-value">{user.plan?.toUpperCase() || "FREE"}</span>
                        </div>
                    </div>
                )}

                {/* Theme Section */}
                <div className="settings-card">
                    <h3 className="settings-card-title">Appearance</h3>
                    <div className="settings-row">
                        <span>Theme</span>
                        <button className="settings-theme-btn" onClick={toggleTheme}>
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>
                </div>

                {/* Account Section (Only shown if logged in) */}
                {user && (
                    <div className="settings-card">
                        <h3 className="settings-card-title">Account (Danger Zone)</h3>
                        <div className="settings-row">
                            <span>Delete Account</span>
                            <button className="settings-delete-btn" onClick={handleDeleteAccount}>
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* About Section */}
                <div className="settings-card">
                    <h3 className="settings-card-title">About</h3>
                    <div className="settings-row">
                        <span>Version</span>
                        <span className="settings-value">v1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
