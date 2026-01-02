import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { UserDataContext } from "../../context/user";
import api from "../../api/api";

const CommitPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userdata } = useContext(UserDataContext);

  const [task, setTask] = useState(null);

  const [commitId, setCommitId] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- FETCH TASK (to get project_id) ---------------- */
  useEffect(() => {
    if (!userdata || !taskId) return;

    const assignedTasks = userdata.assigned_tasks || [];
    const foundTask = assignedTasks.find(
      (t) => String(t.id) === String(taskId)
    );

    if (!foundTask) return;

    const allProjects = [
      ...(userdata.contributed_projects || []),
      ...(userdata.owned_projects || []),
    ];

    const foundProject = allProjects.find(
      (p) => String(p.id) === String(foundTask.project_id)
    );

    setTask({
      ...foundTask,
      project: foundProject,
    });
  }, [taskId, userdata]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task?.project) {
      setError("Project not found for this task");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
      const payload = {
        github_task: taskId,
        project_id: task.project.id,
        completed_by: userdata.user.id,
        commit_id: commitId,
        message,
        step,
        is_successful: false,
      };

      console.log("Commit created successfully", payload);
    try {
      const res= await api.post("/task_commit/commit_task/?project_id=" + task.project.id, payload);
      setSuccess("Commit created successfully");
      alert("Commit created successfully");
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError("Failed to create commit");
    } finally {
      setLoading(false);
    }
    
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-bold mb-4">Create Task Commit</h1>

        {task && (
          <p className="text-sm text-gray-500 mb-4">
            Task: <b>{task.title}</b> — Project:{" "}
            <b>{task.project?.name}</b>
          </p>
        )}

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Commit ID
            </label>
            <input
              value={commitId}
              onChange={(e) => setCommitId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Commit Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Step (optional)
            </label>
            <input
              value={step}
              onChange={(e) => setStep(e.target.value)}
              placeholder="clone / build / test / push"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Commit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommitPage;
