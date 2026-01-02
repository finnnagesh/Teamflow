import React, { useState, useContext, useEffect } from "react";
import {
  Target,
  GitBranch,
  CheckCircle,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { UserDataContext } from "../context/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { ProjectDataContext } from "../context/project";
import { fetchUserDataWithRefresh } from "../api/auth";

export default function TeamProjectDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const { userdata, setuserdata } = useContext(UserDataContext);
  const { setProjectData } = useContext(ProjectDataContext);
  const navigate = useNavigate();

  // we will use join_requests directly from context
  const user = userdata?.user || {};
  const ownedProjects = userdata?.owned_projects || [];
  const contributedProjects = userdata?.contributed_projects || [];
  const assignedTasks = userdata?.assigned_tasks || [];
  const inviteRequestsFromContext = userdata?.join_requests || [];

  // keep auth/user loading logic
  useEffect(() => {
    (async () => {
      if (userdata) {
        return;
      }
      const data = await fetchUserDataWithRefresh();
      if (data) {
        setuserdata(data);
      } else {
        setuserdata(null);
        navigate("/login");
      }
    })();
  }, [userdata, navigate, setuserdata]);

  const handleProjectClick = async (projectId) => {
    try {
      const response = await api.get(`/project/project_setup/?id=${projectId}`);
      console.log("Project data fetched:", response.data);
      setProjectData(response.data);
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error("Error fetching project data:", error);
      alert("Failed to load project data. Please try again later.");
    }
  };

  const handleAccept = async (inviteId) => {
  try {
    await api.post(`/joinrequest/join-requests/${inviteId}/accept/`);
    alert("Invite accepted successfully!");

    // 🔥 Remove from context
    setuserdata((prev) => ({
      ...prev,
      join_requests: prev.join_requests.filter((i) => i.id !== inviteId),
    }));
  } catch (error) {
    console.error("Error accepting invite:", error);
    alert("Failed to accept invite.");
  }
};


  const handleReject = async (inviteId) => {
  try {
    await api.delete(`/joinrequest/join-requests/${inviteId}/`);
    alert("Invite rejected successfully!");

    // 🔥 Remove from context
    setuserdata((prev) => ({
      ...prev,
      join_requests: prev.join_requests.filter((i) => i.id !== inviteId),
    }));
  } catch (error) {
    console.error("Error rejecting invite:", error);
    alert("Failed to reject invite.");
  }
};
  const handleGoToChat = () => {
  navigate("/chats/-1");
};


  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "projects", label: "Projects", icon: GitBranch },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "invites", label: "Invite Requests", icon: Bell },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      case "delayed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">Active Projects</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {ownedProjects.length + contributedProjects.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">Assigned Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {assignedTasks.length}
          </p>
        </div>
      </div>

      {/* Owned Projects */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Owned Projects</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView("projects")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {ownedProjects.length > 0 ? (
            ownedProjects.slice(0, 2).map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                      "low"
                    )}`}
                  >
                    owned
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {project.description}
                </p>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.repo_url}
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Created at:{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                No owned projects yet.
              </p>
              <button
                onClick={() => navigate("/start_project")}
                className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contributed Projects */}
      {contributedProjects.length > 0 && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contributed Projects
          </h3>
          <div className="space-y-4">
            {contributedProjects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                      "medium"
                    )}`}
                  >
                    contributor
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {project.description}
                </p>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.repo_url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Tasks */}
<div className="bg-white p-6 rounded-xl border shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold text-gray-900">
      Assigned Tasks
    </h3>
    <button
      onClick={() => setActiveView("tasks")}
      className="text-blue-600 text-sm font-medium"
    >
      View All
    </button>
  </div>

  {assignedTasks.length > 0 ? (
    <div className="space-y-3">
      {assignedTasks.slice(0, 3).map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {task.title}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.description || "No description provided"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  Project ID: {task.project_id}
                </span>
                {task.branch_name && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 flex items-center gap-1">
                    <GitBranch size={12} />
                    {task.branch_name}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  Priority: {task.priority}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Assigned on{" "}
                {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status || "in_progress"
              )}`}
            >
              {(task.status || "in_progress").replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No tasks assigned.</p>
  )}
</div>

    </div>
  );

  function InviteRequests({
    inviteRequests,
    onAccept,
    onReject,
    onProjectClick,
  }) {
    return (
      <div className="bg-white p-6 rounded-xl text-gray-600">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Invite Requests
        </h2>

        {inviteRequests.length === 0 ? (
          <p>No invite requests found.</p>
        ) : (
          <ul className="space-y-4">
            {inviteRequests.map((invite) => (
              <li
                key={invite.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onProjectClick(invite.project.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-900">
                    From:{" "}
                    <strong>
                      {invite.sender.github_username || invite.sender.email}
                    </strong>
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(invite.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-1 italic">
                  "{invite.content}"
                </p>

                <div className="text-sm text-gray-600 mb-3">
                  <p>
                    Project:{" "}
                    <button
                      className="text-blue-600 hover:underline font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectClick(invite.project.id);
                      }}
                    >
                      {invite.project.name}
                    </button>
                  </p>
                  <p>
                    Receiver:{" "}
                    <strong>
                      {invite.receiver.github_username ||
                        invite.receiver.email}
                    </strong>
                  </p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(invite.id);
                    }}
                    className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(invite.id);
                    }}
                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return renderOverview();
      case "projects":
        return (
          <div className="bg-white p-6 rounded-xl text-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                All Projects
              </h2>
              <button
                onClick={() => navigate("/start_project")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Project
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Owned Projects
                </h3>
                {ownedProjects.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No owned projects yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ownedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleProjectClick(p.id)}
                      >
                        <div className="font-medium text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.description}
                        </div>
                        <a
                          href={p.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 text-xs hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.repo_url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {contributedProjects.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 mt-6">
                    Contributed Projects
                  </h3>
                  <div className="space-y-3">
                    {contributedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleProjectClick(p.id)}
                      >
                        <div className="font-medium text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.description}
                        </div>
                        <a
                          href={p.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 text-xs hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.repo_url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "tasks":
  return (
    <div className="bg-white p-6 rounded-xl text-gray-600">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        All Assigned Tasks
      </h2>

      {assignedTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left py-2 px-3">Title</th>
                <th className="text-left py-2 px-3">Project ID</th>
                <th className="text-left py-2 px-3">Branch</th>
                <th className="text-left py-2 px-3">Priority</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Created</th>
                <th className="text-left py-2 px-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((task) => (
                <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50"
                onClick={() => navigate(`/workontask/${task.id}`)}>
                  <td className="py-2 px-3">
                    <div className="font-medium text-gray-900">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {task.description || "No description"}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700">
                    {task.project_id}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700">
                    {task.branch_name || "-"}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        task.status || "in_progress"
                      )}`}
                    >
                      {(task.status || "in_progress").replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

      case "invites":
        return (
          <InviteRequests
            inviteRequests={inviteRequestsFromContext}
            onAccept={handleAccept}
            onReject={handleReject}
            onProjectClick={handleProjectClick}
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40">
          <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 z-50">
            <div className="px-4 py-5 font-bold text-gray-900 text-lg border-b flex justify-between items-center">
              TeamFlow
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
                      activeView === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-gray-200">
        <div className="px-4 py-5 font-bold text-gray-900 text-lg border-b">
          TeamFlow
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === item.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between bg-white border-b px-4 h-14">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative w-64 hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoToChat}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              💬 Go to Chat
            </button>

            <button className="text-gray-500 hover:text-blue-600">
              <Bell size={20} />
            </button>

            <div className="flex items-center space-x-2">
              <img
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${
                  user.github_username || "User"
                }`}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome, {user.github_username || "User"}!
          </h1>
          <p className="text-gray-600 mb-6">
            Email: {user.email || "No email provided"}
          </p>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
