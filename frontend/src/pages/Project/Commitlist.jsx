// pages/task/CommitRequests.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  GitCommit, User, Calendar, CheckCircle, XCircle,
  RefreshCw, Github, AlertCircle
} from 'lucide-react';
import api from '../../api/api';

const CommitRequests = () => {
  const { projectId } = useParams();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchCommits = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/task_commit/commit_task/?project_id=${projectId}`);
      setCommits(Array.isArray(res.data) ? res.data : []);
      console.log('Fetched commits:', res.data);
    } catch (err) {
      console.error('Failed to fetch commit requests:', err.response?.data || err);
      setError(err.response?.data?.detail || 'Failed to load commit requests');
      setCommits([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCommits();
  }, [fetchCommits]);

  const handleAccept = async (commitId) => {
    try {
      setActionLoading(prev => ({ ...prev, [commitId]: 'accept' }));
      await api.post(`task_commit/task_request/accept/?commit_id=${commitId}`);
      fetchCommits(); // Refresh data
    } catch (err) {
      console.error('Accept failed:', err);
      alert('Failed to accept commit');
    } finally {
      setActionLoading(prev => ({ ...prev, [commitId]: false }));
    }
  };

  const handleDeny = async (commitId) => {
    try {
      setActionLoading(prev => ({ ...prev, [commitId]: 'deny' }));
      await api.post(`/task_commit/task_request/deny/?commit_id=${commitId}`);
      fetchCommits(); // Refresh data
    } catch (err) {
      console.error('Deny failed:', err);
      alert('Failed to deny commit');
    } finally {
      setActionLoading(prev => ({ ...prev, [commitId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl">
              <GitCommit className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent">
                Commit Requests
              </h1>
              <p className="text-gray-600 font-medium">
                {commits.length} commits for Project #{projectId}
              </p>
            </div>
          </div>
          <button
            onClick={fetchCommits}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {commits.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <GitCommit className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No commit requests yet</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
              Team members will appear here when they submit commit requests for this project.
            </p>
          </div>
        )}

        {/* Commits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {commits.map((commit) => (
            <CommitCard 
              key={commit.id} 
              commit={commit} 
              formatDate={formatDate}
              onAccept={handleAccept}
              onDeny={handleDeny}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CommitCard = ({ commit, formatDate, onAccept, onDeny, actionLoading }) => {
  const getStatusColor = () => {
    if (commit.is_successful) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getStatusIcon = () => {
    if (commit.is_successful) return <CheckCircle className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  // Handle nested completed_by object from your data
  const completedByUser = commit.completed_by;
  const userName = completedByUser?.github_username || completedByUser?.email || 'Unknown User';
  const userId = completedByUser?.id || 'N/A';
  const commitMessage = commit.message || commit.commit_message || '';

  const isActionLoading = actionLoading[commit.id]; // ✅ Changed from commit.commit_id

  return (
    <div className="group bg-white/80 backdrop-blur-sm border border-white/50 hover:border-gray-200 hover:shadow-2xl hover:shadow-emerald-500/10 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 pt-1">
            <div className={`w-12 h-12 ${getStatusColor()} rounded-2xl flex items-center justify-center shadow-md border-2 ${commit.is_successful ? 'border-emerald-300' : 'border-orange-300'}`}>
              {getStatusIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate pr-4">
                #{commit.id} {commit.commit_id?.slice(0, 8) || 'Pending'}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()} shadow-sm`}>
                {commit.is_successful ? '✅ Success' : '⚠️ Pending'}
              </span>
            </div>
            
            {/* Task & Step Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                <Github className="h-4 w-4" />
                <span>Task #{commit.github_task || commit.task}</span>
              </span>
              {commit.step && (
                <span className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-lg text-blue-700">
                  <GitCommit className="h-4 w-4" />
                  <span>{commit.step}</span>
                </span>
              )}
            </div>

            {/* User Avatar & Name */}
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                {userName[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-xs text-gray-500">ID: #{userId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commit Message */}
      {commitMessage && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-2xl pl-4 pr-4 py-3 shadow-sm">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
              "{commitMessage}"
            </p>
          </div>
        </div>
      )}

      {/* Metadata Grid */}
      <div className="border-t border-gray-100 pt-6 mb-8">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Project</span>
            <span className="font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded-lg inline-flex items-center">
              P#{commit.project_id}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Created</span>
            <span className="text-gray-900 font-mono text-sm">
              {formatDate(commit.created_at)}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block mb-1">Full Commit ID</span>
            <span 
              className="font-mono bg-gray-50 px-3 py-1.5 rounded-xl text-sm text-gray-700 block truncate hover:overflow-visible hover:whitespace-normal hover:max-w-none hover:bg-gray-100 transition-all cursor-pointer"
              title={commit.commit_id}
            >
              <code>{commit.commit_id}</code>
            </span>
          </div>
        </div>
      </div>

      {/* ✅ ACCEPT/DENY BUTTONS - FIXED */}
      {!commit.is_successful && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-red-50 border-2 border-gray-200 rounded-3xl p-6 shadow-xl">
          <div className="flex gap-4">
            {/* ACCEPT BUTTON - FIXED */}
            <button
              onClick={() => onAccept(commit.id)}  // ✅ CHANGED: commit.id instead of commit.commit_id
              disabled={isActionLoading === 'accept'}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 h-16 border-4 border-emerald-400 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isActionLoading === 'accept' ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>✅ ACCEPT COMMIT</span>
                </>
              )}
            </button>

            {/* DENY BUTTON - FIXED */}
            <button
              onClick={() => onDeny(commit.id)}  // ✅ CHANGED: commit.id instead of commit.commit_id
              disabled={isActionLoading === 'deny'}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-red-600 hover:to-red-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 h-16 border-4 border-red-400 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isActionLoading === 'deny' ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Denying...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  <span>❌ DENY COMMIT</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 animate-pulse shadow-lg h-[600px]">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-16 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 mb-8">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl p-6 h-32"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CommitRequests;
