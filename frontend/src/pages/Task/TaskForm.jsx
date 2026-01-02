// pages/task/file.jsx
import React, { useState, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ProjectDataContext } from "../../context/project";
import api from "../../api/api";

function TaskForm() {
  const { projectData } = useContext(ProjectDataContext);
  const location = useLocation();

  // If you pass { state: { projectId } } from navigation, read it:
  const projectIdFromRoute = location.state?.projectId ?? null;

  // Normalize project: prefer projectData.project, fallback to list + route id
  const project = useMemo(() => {
    if (projectData?.project) return projectData.project;
    if (Array.isArray(projectData?.projects) && projectIdFromRoute) {
      return projectData.projects.find((p) => p.id === projectIdFromRoute) || null;
    }
    return projectData?.project ?? null;
  }, [projectData, projectIdFromRoute]);

  const projectIdFromState = project?.id ?? null;

  // Contributors: use project.contributors if present, otherwise fallback to created_by
  // Contributors + creators merged
const assignees = useMemo(() => {
  const list = [];

  // 1) Project owner / creator
  if (project?.created_by) {
    const c = project.created_by;
    list.push({
      id: c.id,
      name: c.github_username || c.email || `User ${c.id}`,
      email: c.email,
      github: c.github_username,
      role: "Owner",
    });
  }

  // 2) Contributors array if present
  if (Array.isArray(project?.contributors)) {
    project.contributors.forEach((c) => {
      // avoid duplicate ids
      if (!list.find((u) => u.id === c.id)) {
        list.push({
          id: c.id,
          name: c.github_username || c.email || `User ${c.id}`,
          email: c.email,
          github: c.github_username,
          role: "Contributor",
        });
      }
    });
  }

  return list;
}, [project]);


  const [form, setForm] = useState({
    project_id: projectIdFromState,
    title: "",
    description: "",
    status: "pending",
    priority: "high",
    branch_name: "",
    assigned_to: "",
    created_by: project?.created_by?.id ?? 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const next = value === "" ? "" : Number(value);
      setForm((prev) => ({ ...prev, [name]: next }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        project_id: projectIdFromState,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        branch_name: form.branch_name,
        // backend will handle created_by from request.user
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      };

      console.log("Sending payload:", payload);

      const res = await api.post(
        `/tasks/create_task/?project_id=${projectIdFromState}`,
        payload
      );

      console.log("Response received:", res.data);

      setMessage(
        `Task created successfully${
          res.data?.id ? ` (id: ${res.data.id})` : ""
        }.`
      );

      setForm((prev) => ({
        project_id: projectIdFromState,
        title: "",
        description: "",
        status: "pending",
        priority: "high",
        branch_name: "",
        assigned_to: "",
        created_by: prev.created_by,
      }));
    } catch (error) {
      const backendMsg =
        error.response?.data && typeof error.response.data === "object"
          ? JSON.stringify(error.response.data)
          : error.response?.data || error.message;

      console.error("Error while creating task:", backendMsg);
      setMessage(`Failed to create task: ${backendMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isError = message.startsWith("Failed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Task
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a task with status, priority, and branch details for your project.
          </p>
        </div>

        <div className="bg-white rounded-2xl border shadow-lg shadow-slate-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID
                </label>
                <input
                  type="number"
                  name="project_id"
                  value={form.project_id ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  inputMode="numeric"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned to
                </label>
                <select
  name="assigned_to"
  value={form.assigned_to}
  onChange={handleChange}
  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm bg-white"
>
  <option value="">Select user</option>
  {assignees.map((u) => (
    <option key={u.id} value={String(u.id)}>
      {u.name}
      {u.github ? ` (@${u.github})` : ""}
      {u.role ? ` • ${u.role}` : ""}
    </option>
  ))}
</select>

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Setup GitHub Actions for CI/CD"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Create and configure workflow for automated testing and deployment."
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm bg-white"
                >
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm bg-white"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch name
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleChange}
                  placeholder="feature/github-actions"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created by (user id)
                </label>
                <input
                  type="number"
                  name="created_by"
                  value={form.created_by}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  inputMode="numeric"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 px-3 py-2 text-gray-900 shadow-sm"
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <span className="inline-block h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                )}
                {submitting ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    title: "",
                    description: "",
                    branch_name: "",
                    status: "pending",
                    priority: "high",
                    assigned_to: "",
                  }))
                }
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            {message ? (
              <div
                className={`mt-2 rounded-lg px-3 py-2 text-sm ${
                  isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {message}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
