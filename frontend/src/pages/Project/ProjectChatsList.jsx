// src/pages/ProjectChatsList.jsx
import React, { useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../../context/user";
import { ProjectDataContext } from "../../context/project";
import api from "../../api/api";
import { fetchUserDataWithRefresh } from "../../api/auth";

export default function ProjectChatsList({ onProjectSelect, selectedProjectId }) {
  const { userdata, setuserdata } = useContext(UserDataContext);
  const { setProjectData } = useContext(ProjectDataContext);
  const navigate = useNavigate();

  const user = userdata?.user || {};
  const ownedProjects = userdata?.owned_projects || [];
  const contributedProjects = userdata?.contributed_projects || [];

  useEffect(() => {
    (async () => {
      if (userdata) return;
      const data = await fetchUserDataWithRefresh();
      if (data) setuserdata(data);
      else {
        setuserdata(null);
        navigate("/login");
      }
    })();
  }, [userdata, navigate, setuserdata]);

  const handleOpenChat = useCallback(async (projectId) => {
    try {
      const res = await api.get(`/project/project_setup/?id=${projectId}`);
      setProjectData(res.data);
      onProjectSelect?.(projectId, res.data);
    } catch (err) {
      console.error("Error fetching project data:", err);
      onProjectSelect?.(projectId, { name: "Project", id: projectId });
    }
  }, [onProjectSelect, setProjectData]);

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString() : "";
  const allProjects = [
    ...ownedProjects.map((p) => ({ ...p, role: "owned" })),
    ...contributedProjects.map((p) => ({ ...p, role: "contributor" })),
  ];

  return (
    <div className="w-80 h-full flex flex-col bg-white border-r border-gray-200 shadow-xl overflow-hidden">
      {/* ✅ HEADER FROZEN */}
      <div className="h-20 flex-shrink-0 flex items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-white/50 backdrop-blur-sm border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Project Chats</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[160px]">
              {user.github_username || user.email || "You"}
            </p>
          </div>
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">●</span>
          </div>
        </div>
      </div>

      {/* ✅ PROJECTS SCROLL ONLY */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-50 hover:scrollbar-thumb-gray-500">
        {allProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12 px-4">
            <div className="text-4xl mb-4 opacity-50">📂</div>
            <p className="text-sm font-medium text-center">No projects yet</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Create or join projects to start chatting</p>
          </div>
        ) : (
          allProjects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => handleOpenChat(proj.id)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 hover:bg-gray-50 border-b border-gray-100/50 last:border-b-0 transition-all duration-200 group ${
                selectedProjectId === proj.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 shadow-sm' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shadow-md flex-shrink-0 transition-all ${
                selectedProjectId === proj.id 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:scale-105'
              }`}>
                {proj.name?.[0]?.toUpperCase() || "P"}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`text-sm font-semibold truncate pr-2 ${
                    selectedProjectId === proj.id ? 'text-blue-700' : 'text-gray-900 group-hover:text-gray-800'
                  }`}>
                    {proj.name}
                  </h3>
                  <span className={`text-xs text-gray-400 ml-2 whitespace-nowrap flex-shrink-0 ${
                    selectedProjectId === proj.id ? 'text-blue-500 font-medium' : ''
                  }`}>
                    {formatDate(proj.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate leading-tight">{proj.description || "No description"}</p>
                <div className={`mt-1.5 text-xs ${
                  proj.role === 'owned' 
                    ? 'text-yellow-600 font-semibold bg-yellow-100/50 px-2 py-0.5 rounded-full' 
                    : 'text-green-600 font-semibold bg-green-100/50 px-2 py-0.5 rounded-full'
                }`}>
                  {proj.role === 'owned' ? '👑 Owner' : '🤝 Member'}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
