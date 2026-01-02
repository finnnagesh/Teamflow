import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitBranch, 
  Calendar, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { ProjectDataContext } from '../../context/project';

const TaskProfilePage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { projectData} = useContext(ProjectDataContext);
  const [taskdata, setTaskData] = useState({});

  useEffect(() => {

  // if (!taskId || !taskdata || !currentProject) return;
  for(const t of projectData.tasks || []) {
    if (String(t.id) === String(taskId)) {
      setTaskData(t);
      break;
    }
  }

  const fullTask = {
    ...taskdata,          // already raw
    project: projectData.project, // already raw project
  };

  setTask(fullTask);
  setLoading(false);

  console.log("Loaded task data:", fullTask);
  console.log("Current project:", projectData.project);
}, [taskId, taskdata, projectData]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task || !task.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Task not found</h1>
          <p className="text-gray-600 mb-8">The task you're looking for doesn't exist or hasn't loaded yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      delayed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'UN';
    const name = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    return user.github_username || 
           (user.email ? user.email.split('@')[0] : 'Unknown User');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Project
            </button>
            <div className="text-sm text-gray-500">
              Task #{task.id} • {task.status?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Task #{task.id}
                </span>
                {task.project_id && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Project ID: {task.project_id}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <span className={`px-4 py-2 rounded-xl border font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
              <span className={`px-4 py-2 rounded-xl border font-medium ${getStatusColor(task.status)}`}>
                {task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Info */}
          {task.project && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border p-8 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM19 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                  Project
                </h3>
                <div className="space-y-4">
                  <a 
                    href={task.project.repo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                  >
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">
                      {task.project.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{task.project.description}</p>
                  </a>
                  <a 
                    href={task.project.repo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Repository
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Task Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Details
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{task.description || 'No description'}</p>
                </div>
                {task.branch_name && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Branch</h3>
                    <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-900 inline-flex items-center">
                      <GitBranch className="w-3 h-3 inline mr-1" />
                      {task.branch_name}
                    </code>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Created</h3>
                    <p className="text-gray-600">{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Updated</h3>
                    <p className="text-gray-600">{formatDate(task.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {task.assigned_to && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Assigned To
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(task.assigned_to.github_username || task.assigned_to.email)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getUserName(task.assigned_to)}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">
                        {task.assigned_to.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      GitHub: {task.assigned_to.github_username || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Created By */}
          {task.created_by && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Created By
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(task.created_by.github_username || task.created_by.email)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getUserName(task.created_by)}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">
                        {task.created_by.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      GitHub: {task.created_by.github_username || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskProfilePage;
