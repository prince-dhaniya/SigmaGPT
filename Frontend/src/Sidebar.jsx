import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { API_BASE_URL } from "./config.js";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setNewChat, setPrompt, setReply,
        setCurrThreadId, setPrevChats, refreshTrigger,
        setCurrentPage, showToast, user
    } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`);
            const res = await response.json();
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, refreshTrigger]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setCurrentPage("chat");
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        setCurrentPage("chat");
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
                method: "DELETE"
            });
            const res = await response.json();
            console.log(res);
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            showToast("Chat deleted successfully!", "success");
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo"></img>
                </div>
                <button className="toggle-sidebar-btn" title="Close sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 3.75h16.5A1.5 1.5 0 0 1 21.75 5.25v13.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V5.25A1.5 1.5 0 0 1 3.75 3.75Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.75v16.5" />
                    </svg>
                </button>
            </div>

            <div className="sidebar-nav">
                <button className="new-chat-btn" onClick={createNewChat}>
                    <i className="fa-regular fa-pen-to-square"></i>
                    <span>New chat</span>
                </button>
            </div>

            <div className="recents-section">
                <div className="recents-header">Recents</div>
                <ul className="history">
                    {
                        allThreads?.map((thread, idx) => (
                            <li key={idx}
                                onClick={(e) => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted" : ""}
                            >
                                <span className="thread-title">{thread.title}</span>
                                <i className="fa-solid fa-trash"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteThread(thread.threadId);
                                    }}
                                ></i>
                            </li>
                        ))
                    }
                </ul>
            </div>

            <div className="sign">
                {user ? (
                    <div className="sidebar-user-footer">
                        <div className="sidebar-user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-username">{user.username}</span>
                            <span className="sidebar-user-plan">{user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Free"}</span>
                        </div>
                    </div>
                ) : (
                    <p>By Prince Dhaniya &hearts;</p>
                )}
            </div>
        </div>
    );
}

export default Sidebar;