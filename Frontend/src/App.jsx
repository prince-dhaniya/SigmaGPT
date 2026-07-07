import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import Settings from './Settings.jsx';
import UpgradePlan from './UpgradePlan.jsx';
import Login from './Login.jsx';
import { MyContext } from './MyContext.jsx';
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);
  const [theme, setTheme] = useState("light");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      showToast(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`, "info");
      return nextTheme;
    });
  };

  // Auth state
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Page: "chat" | "settings" | "upgrade" | "login"
  const [currentPage, setCurrentPage] = useState("chat");

  // Check saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("sigmagpt_token");
    const savedUser = localStorage.getItem("sigmagpt_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setCurrentPage("chat");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("sigmagpt_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sigmagpt_token");
    localStorage.removeItem("sigmagpt_user");
    setCurrentPage("chat");
    showToast("Logged out successfully!", "info");
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setAllThreads([]);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    refreshTrigger, triggerRefresh,
    theme, toggleTheme,
    token, user, updateUser,
    handleLogin, handleLogout,
    currentPage, setCurrentPage,
    showToast
  };

  const renderPage = () => {
    switch (currentPage) {
      case "settings":
        return <Settings />;
      case "upgrade":
        return <UpgradePlan />;
      default:
        return <ChatWindow />;
    }
  };

  return (
    <div className={`app ${theme}`}>
      <MyContext.Provider value={providerValues}>
        <Sidebar></Sidebar>
        {renderPage()}
        {(currentPage === "login" || currentPage === "signup") && (
          <Login 
            onLogin={handleLogin} 
            onCancel={() => setCurrentPage("chat")} 
            initialIsSignup={currentPage === "signup"} 
          />
        )}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </MyContext.Provider>
    </div>
  );
}

export default App;
