import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Top from "./pages/Top";
import ProjectDetail from "./pages/Project/Project_Detail";
import StartPage from "./pages/Project/Start_project";
import TaskForm from "./pages/Task/TaskForm";
import ChatPage from "./pages/Project/ChatPage";
import { UserDataProvider, UserDataContext } from "./context/user";
import { ProjectDataProvider } from "./context/project";
import ProjectChatsList from "./pages/Project/ProjectChatsList";
import AgentHeroSetupPage from "./pages/agent /Agentsetup";
import TaskProfilePage from "./pages/Task/Taskview.jsx";
import Worktask from "./pages/Task/Workontask.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import InitializeTask from "./pages/Task/Workpage.jsx";
import CommitPage from "./pages/Task/Createcommit.jsx";
import CommitRequests from "./pages/Project/Commitlist.jsx";
function Header() {
  const { userdata, setuserdata } = useContext(UserDataContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setuserdata(null);
    navigate("/login");
  };
  const checkAgentConnection = async () => {
    const payload = {
      commands: [
        ["pwd"]
      ]
    };

    try {
      const response = await fetch("http://127.0.0.1:3000/run-commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // If pwd returns a path → agent is connected
      if (result?.output || result?.stdout) {
        return {
          connected: true,
          path: result.output || result.stdout,
        };
      }

      return { connected: false };
    } catch (error) {
      return { connected: false, error };
    }
  };

  const cloneRepository = async () => {
    if (!task?.project?.repo_url) {
      console.error("Repository URL not found");
      return;
    }

    const payload = {
      commands: [
        ["git", "clone", task.project.repo_url]
      ]
    };

    try {
      const response = await fetch("http://127.0.0.1:3000/run-commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Clone result:", result);
    } catch (error) {
      console.error("Clone failed:", error);
    }
  };
        

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
            <span className="text-2xl font-bold text-gray-900">TeamFlow</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {userdata ? (
              <>
                <span className="text-gray-700 font-medium">
                  Hello, {userdata.username}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <UserDataProvider>
      <ProjectDataProvider>
        <Router>
          <div className="bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<Top />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/start_project" element={<StartPage />} />
              <Route path="/project/create_task" element={<TaskForm />} />
              <Route path="/agent-setup" element={<AgentHeroSetupPage />} />
              <Route path="/chats/:projectId" element={<ChatPage />} />
              <Route path="/taskpage/:taskId" element={<TaskProfilePage />} />
              <Route path="/workontask/:taskId" element={<Worktask />} />
              <Route path="/tasks/:taskId" element={<InitializeTask />} />
              <Route path="/commit/:taskId" element={<CommitPage />} />
              <Route path="/takecommit/:projectId" element={<CommitRequests />} />
            </Routes>
          </div>
        </Router>
      </ProjectDataProvider>
    </UserDataProvider>
  );
}
