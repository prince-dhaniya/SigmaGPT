import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";

function ChatWindow() {
    const {
        prompt, setPrompt, reply, setReply,
        currThreadId, prevChats, setPrevChats,
        setNewChat, triggerRefresh,
        theme, toggleTheme,
        token, user, handleLogout,
        setCurrentPage
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
        if (!prompt.trim()) return;
        const currentPrompt = prompt;
        setLoading(true);
        setNewChat(false);
        setPrompt("");

        setPrevChats(prev => [...prev, { role: "user", content: currentPrompt }]);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: currentPrompt,
                threadId: currThreadId
            })
        };
        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            if (res.reply) {
                setReply(res.reply);
                setPrevChats(prev => [...prev, { role: "assistant", content: res.reply }]);
                triggerRefresh();
            } else {
                setPrevChats(prev => [...prev, { role: "assistant", content: res.error || "Something went wrong. Please try again." }]);
            }
        } catch (err) {
            console.log(err);
            setPrevChats(prev => [...prev, { role: "assistant", content: "Failed to connect to server." }]);
        }
        setLoading(false);
    };

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>SigmaGPT<i className="fa-solid fa-chevron-down"></i></span>
                {token ? (
                    <div className="userIconDiv" onClick={handleProfileClick}>
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    </div>
                ) : (
                    <div className="nav-auth-buttons">
                        <button className="nav-login-btn" onClick={() => setCurrentPage("login")}>Log in</button>
                        <button className="nav-signup-btn" onClick={() => setCurrentPage("signup")}>Sign up for free</button>
                    </div>
                )}
            </div>
            {
                isOpen &&
                <div className="dropDown">
                    <div className="dropDownItems" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                        <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </div>
                    <div className="dropDownItems" onClick={() => { setCurrentPage("settings"); setIsOpen(false); }}>
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItems" onClick={() => { setCurrentPage("upgrade"); setIsOpen(false); }}>
                        <i className="fa-solid fa-crown"></i> Upgrade Plan
                    </div>
                    {token ? (
                        <div className="dropDownItems" onClick={() => { handleLogout(); setIsOpen(false); }}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </div>
                    ) : (
                        <div className="dropDownItems" onClick={() => { setCurrentPage("login"); setIsOpen(false); }}>
                            <i className="fa-solid fa-right-to-bracket"></i> Login
                        </div>
                    )}
                </div>
            }
            <Chat></Chat>
            <div className="loaderWrapper">
                <BeatLoader color="#fff" loading={loading} size={8}>
                </BeatLoader>
            </div>
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    >
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;