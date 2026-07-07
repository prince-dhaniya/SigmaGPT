import "./Login.css";
import { useState, useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function Login({ onLogin, onCancel, initialIsSignup = false }) {
    const { showToast } = useContext(MyContext);
    const [isSignup, setIsSignup] = useState(initialIsSignup);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSocialClick = (provider) => {
        showToast(`${provider} login is not configured in this demo.`, "info");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const url = isSignup
            ? "http://localhost:8080/api/auth/signup"
            : "http://localhost:8080/api/auth/login";

        const body = isSignup
            ? { username, email, password }
            : { email, password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong.");
                setLoading(false);
                return;
            }

            localStorage.setItem("sigmagpt_token", data.token);
            localStorage.setItem("sigmagpt_user", JSON.stringify(data.user));
            showToast(
                isSignup ? "Account created successfully!" : "Logged in successfully!",
                "success"
            );
            onLogin(data.token, data.user);
        } catch (err) {
            setError("Failed to connect to server.");
        }
        setLoading(false);
    };

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setError("");
        setUsername("");
        setEmail("");
        setPassword("");
    };

    return (
        <div className="login-modal-overlay">
            <div className="login-modal-card">
                {/* Close Button */}
                <button className="login-modal-close" onClick={onCancel}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Header message from image */}
                <p className="login-modal-header-text">
                    You'll get smarter responses and can upload files, images, and more.
                </p>

                {/* Social Login placeholders */}
                <div className="login-social-group">
                    <button type="button" className="login-social-btn" onClick={() => handleSocialClick("Google")}>
                        <i className="fa-brands fa-google" style={{ color: "#EA4335" }}></i>
                        <span>Continue with Google</span>
                    </button>
                    <button type="button" className="login-social-btn" onClick={() => handleSocialClick("Apple")}>
                        <i className="fa-brands fa-apple" style={{ color: "#000000" }}></i>
                        <span>Continue with Apple</span>
                    </button>
                    <button type="button" className="login-social-btn" onClick={() => handleSocialClick("phone")}>
                        <i className="fa-solid fa-phone" style={{ color: "#555" }}></i>
                        <span>Continue with phone</span>
                    </button>
                </div>

                {/* OR divider */}
                <div className="login-modal-divider">
                    <span>OR</span>
                </div>

                {/* Main Auth Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {isSignup && (
                        <input
                            type="text"
                            className="login-modal-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    )}

                    <input
                        type="email"
                        className="login-modal-input"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="login-modal-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={3}
                    />

                    {error && <div className="login-error-text">{error}</div>}

                    {/* Black Pill-Shaped Continue Button */}
                    <button type="submit" className="login-continue-btn" disabled={loading}>
                        {loading ? "Please wait..." : "Continue"}
                    </button>
                </form>

                {/* Footer Switch */}
                <div className="login-modal-footer">
                    <span>
                        {isSignup ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <button className="login-modal-toggle" onClick={toggleMode}>
                        {isSignup ? "Log in" : "Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
