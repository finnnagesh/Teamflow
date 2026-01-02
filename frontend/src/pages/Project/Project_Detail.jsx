import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  GitBranch,
  Calendar,
  User,
  ExternalLink,
  CheckCircle,
  Users,
  FileText,
  Activity,
  Star,
  GitCommit,
  Plus, // added
} from "lucide-react";
import { ProjectDataContext } from "../../context/project";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import {UserDataContext} from "../../context/user";
export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const {projectData, setProjectData} = useContext(ProjectDataContext);
  const {userdata , setuserdata} = useContext(UserDataContext);
  
  // Helpers
  const toName = (u) =>
    u?.github_username || (u?.email ? u.email.split("@")[0] : "Unknown");
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");
  console.log("USER:", userdata?.user?.id);
  console.log("CREATED_BY:", projectData?.project?.created_by?.id
);

  const isProjectOwner =
  userdata?.user?.id &&
  projectData?.project?.created_by?.id &&
  userdata.user.id === projectData?.project?.created_by?.id;


  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "delayed":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };


  // Normalize data from context: supports {project, tasks} or lists
  const currentProject = useMemo(() => {
    const pid = Number(projectId);
    const p =
      projectData?.project?.id
        ? projectData.project
        : Array.isArray(projectData?.projects)
        ? projectData.projects.find((x) => x?.id === pid)
        : null;
    return p
      ? {
          id: p.id,
          name: p.name || "Untitled Project",
          description: p.description || "No description provided",
          repo_url: p.repo_url || "#",
          created_at: p.created_at,
          updated_at: p.updated_at,
          // Simple ownership hint if created_by exists
          isOwned: !!p.created_by,
          raw: p,
        }
      : null;
  }, [projectData, projectId]);


  const contributors = useMemo(() => {
    const list = currentProject?.raw?.contributors || [];
    // Sanitize: only keep safe fields
    return list.map((c, idx) => ({
      id: c?.id ?? idx + 1,
      name: toName(c),
      email: c?.email || "unknown",
      github: c?.github_username || "unknown",
    }));
  }, [currentProject]);


  const tasks = useMemo(() => {
    const pid = currentProject?.id;
    let list = [];
    // If context has top-level tasks array from API shape { project, tasks }
    if (Array.isArray(projectData?.tasks)) {
      list = projectData.tasks.filter(
        (t) => !pid || t?.project_id === pid || t?.project === pid
      );
    }
    // If projects may carry nested tasks in some shapes, merge them in
    if (Array.isArray(currentProject?.raw?.tasks)) {
      list = [...list, ...currentProject.raw.tasks];
    }
    // Deduplicate by id if both sources contributed
    const map = new Map();
    list.forEach((t) => map.set(t?.id ?? crypto.randomUUID(), t));
    const uniq = Array.from(map.values());


    return uniq.map((t, idx) => ({
      id: t?.id ?? idx + 1,
      title: t?.title || "Untitled task",
      description: t?.description || "—",
      status: t?.status || "pending",
      priority: t?.priority || "medium",
      assignee: toName(t?.assigned_to),
      createdAt: t?.created_at,
      updatedAt: t?.updated_at,
      branch: t?.branch_name || "—",
    }));
  }, [projectData, currentProject]);


  const activity = useMemo(() => {
    // Simple derived feed from tasks; replace with real activity later
    return tasks.map((t, idx) => ({
      id: idx + 1,
      type: "task",
      user: t.assignee || "Unknown",
      message: `${t.title} [${t.status}]`,
      time: fmtDateTime(t.updatedAt || t.createdAt),
      icon: CheckCircle,
    }));
  }, [tasks]);


  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "contributors", label: "Contributors", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
  ];


  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tasks.length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {tasks.filter((t) => t.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contributors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {contributors.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {fmtDateTime(currentProject?.updated_at)}
              </p>
            </div>
            <GitCommit className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>


      {/* Project Details */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Project Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Description
            </label>
            <p className="text-gray-900 mt-1">
              {currentProject?.description || "No description provided"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created Date
              </label>
              <p className="text-gray-900 mt-1">
                {fmtDate(currentProject?.created_at)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Your Role
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full font-medium mt-1 border ${
                  currentProject?.isOwned
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                {currentProject?.isOwned ? "Project Owner" : "Contributor"}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium mt-1 bg-blue-50 text-blue-600 border border-blue-200">
                Active Development
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Repository
            </label>
            <a
              href={currentProject?.repo_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 mt-1 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {currentProject?.repo_url || "—"}
            </a>
          </div>
        </div>
      </div>


      {/* Recent Tasks */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
          <button
            onClick={() => setActiveTab("tasks")}
            className="text-blue-600 text-sm font-medium hover:text-blue-800"
          >
            View All Tasks
          </button>
        </div>
        <div className="space-y-3">
          {tasks.slice(0, 4).map((task) => (
            <div
    key={task.id}
    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
    onClick={() => navigate(`/taskpage/${task.id}`)}  // Navigate to task profile
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">
          {task.title}
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {task.description}
        </p>
      </div>
      {/* Add hover effect for badges */}
      <div className="flex space-x-2 ml-4 opacity-100 group-hover:opacity-100">
        <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(task.status)}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>
    </div>
    {/* ... rest remains same */}
  </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );

//   const tasknavi = async (task) => {
//   // console.log("Navigating to task:", task);
//   await setTaskData(task.raw || task);  // Pass full raw data
//   await setCurrentProject(projectData.project);
//   // console.log("Set task data:", task.raw || task);
//   console.log("Set current project:", currentProject.raw || currentProject);
//   navigate(`/taskpage/${task.id}`);
// };

  const renderTasks = () => (
    <div className="space-y-6">
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter((t) => t.status === "completed").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter((t) => t.status === "in_progress").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Delayed</div>
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter((t) => t.status === "delayed").length}
          </div>
        </div>
      </div>


      {/* Tasks List */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h3>
        <div className="space-y-4">
{tasks.map((task) => (
  <div
    key={task.id}
    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
    onClick={() => navigate(`/taskpage/${task.id}`)}  // Navigate to task profile
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">
          {task.title}
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {task.description}
        </p>
      </div>
      {/* Add hover effect for badges */}
      <div className="flex space-x-2 ml-4 opacity-100 group-hover:opacity-100">
        <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(task.status)}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>
    </div>
    {/* ... rest remains same */}
  </div>
))}
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks to display.</p>
          )}
        </div>
      </div>
    </div>
  );

  // add beside your existing contributors state
const [isContributorsOpen, setIsContributorsOpen] = useState(false);
const [contributorForm, setContributorForm] = useState({ name: "", github: "", email: "" });
// beside your existing contributors state
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);

// inject a fetcher from parent or wire to your API
// must return: [{ id, email, github_username }, ...]
const fetchUsers = async (q) => {
  // mock example; replace with your API call
  const sample = [
    { id: 2, email: "nagesh@example.com", github_username: "nagesh-coder" },
    { id: 9, email: "0201cs231056@gmail.com", github_username: "nageswqeh" },
  ];
  await new Promise(r => setTimeout(r, 400));
  return sample.filter(
    u =>
      u.github_username.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
  );
};

const handleUserSearch = async () => {
  setIsSearching(true);
  try {
    const results = await fetchUsers(searchQuery);
    setSearchResults(Array.isArray(results) ? results : []);
  } finally {
    setIsSearching(false);
  }
};

const handleSelectUser = async(u) => {
  console.log("Selected user to add:", userdata);
  const joinrequest = {
    "project": projectData.project.id,
    "receiver": u.id,
    "content": "Thanks for the invite! I'm in. When can we start collaborating?"
  }
  const res = await api.post('/joinrequest/join-requests/',joinrequest)
  
};

const DEBOUNCE_MS = 400;
const lastRequestIdRef = React.useRef(0);

React.useEffect(() => {
  const q = searchQuery.trim();

  if (!q) {
    setSearchResults([]);
    setIsSearching(false);
    return;
  }

  const requestId = ++lastRequestIdRef.current;

  

  const handle = setTimeout(() => {
    // Define async function inside setTimeout
    (async () => {
      setIsSearching(true);
      try {
        const res = await api.get(
          `/user/users/search/?q=${q}`,
          
        );
        if (requestId === lastRequestIdRef.current) {
          setSearchResults(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (requestId === lastRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    })(); 
  }, DEBOUNCE_MS);

  return () => clearTimeout(handle);
}, [searchQuery]);

const handleAddContributor = (e) => {
  e.preventDefault();
  const newContributor = {
    id: Date.now(),
    name: contributorForm.name || "Unnamed",
    github: (contributorForm.github || "").replace(/^@/, ""),
    email: contributorForm.email || "",
  };
  setContributors((prev) => [newContributor, ...prev]);
  setContributorForm({ name: "", github: "", email: "" });
  setIsContributorsOpen(false);
};

 const renderContributors = () => (
  <div className="bg-white p-6 rounded-xl border shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Project Contributors</h3>
      <button
        onClick={() => setIsContributorsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-800 active:translate-y-[1px] transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Contributor
      </button>
    </div>

    <div className="space-y-4">
      {contributors.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            {/* Initials Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {(c.name || "").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{c.name}</h4>
              <p className="text-sm text-gray-500">@{(c.github || "").replace(/^@/, "")}</p>
              <p className="text-xs text-gray-400">{c.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-900">—</p>
                <p className="text-xs text-gray-500">Commits</p>
              </div>
              <GitCommit className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
      {contributors.length === 0 && (
        <p className="text-sm text-gray-500">No contributors listed.</p>
      )}
    </div>

    {/* Overlay */}
    <div
      onClick={() => setIsContributorsOpen(false)}
      className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${isContributorsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    />

    {/* Left Slide Drawer */}
    <div
      className={`fixed inset-y-0 left-0 z-50 w-96 max-w-[90vw] bg-white border-r shadow-xl transform transition-transform duration-300 ${isContributorsOpen ? "translate-x-0" : "-translate-x-full"}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h4 className="text-base font-semibold text-gray-900">Add Contributor</h4>
        <button
          onClick={() => setIsContributorsOpen(false)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Close"
        >
          <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* User Search instead of form */}
<div className="p-4 space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Search users</label>
    <div className="flex items-center gap-2">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/50"
    placeholder="Type GitHub...."
  />
</div>

  </div>

  {/* Results */}
  <div className="space-y-2">
    {searchResults.length === 0 && (
      <p className="text-sm text-gray-500">No users yet. Try a search.</p>
    )}

    {searchResults.map((u) => (
      <div
        key={u.id}
        className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            @{u.github_username}
          </p>
          <p className="text-xs text-gray-500 truncate">{u.email}</p>
        </div>
        <button
          type="button"
          onClick={() => handleSelectUser(u)}
          className="shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Add
        </button>
      </div>
    ))}
  </div>

  <div className="flex items-center gap-2 pt-2">
    <button
      type="button"
      onClick={() => setIsContributorsOpen(false)}
      className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
    >
      Close
    </button>
  </div>
</div>

    </div>
  </div>
);

  const renderActivity = () => (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activity.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{a.user}</span> {a.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{a.time}</p>
              </div>
            </div>
          );
        })}
        {activity.length === 0 && (
          <p className="text-sm text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "tasks":
        return renderTasks();
      case "contributors":
        return renderContributors();
      case "activity":
        return renderActivity();
      default:
        return renderOverview();
    }
  };


  // Guard if project not found
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="bg-white border rounded-xl p-6">
            <p className="text-gray-700">Project not found.</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-3">
                <GitBranch className="h-6 w-6 text-gray-400" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {currentProject.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentProject.isOwned ? "Your Project" : "Contributing"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
            {/* Commit Request Button (ONLY FOR PROJECT OWNER) */}
            {isProjectOwner && (
              <button
                onClick={() => navigate(`/takecommit/${currentProject.id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition"
              >
                <GitCommit className="h-4 w-4" />
                Commit Request
              </button>
            )}

          </div>

          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Floating Create Task FAB */}
      <button
        type="button"
        title="Create Task"
        onClick={() => {
          navigate(`/project/create_task`, { state: { projectId: currentProject.id } });
        }}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 px-5 py-3 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Create Task</span>
      </button>
    </div>
  );
}
