import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  GitBranch, 
  ExternalLink, 
  Play, 
  ChevronRight,
  HardDrive,
  Package,
  RefreshCw,
  FileText,
  Upload,
  Download
} from "lucide-react";
import { UserDataContext } from "../../context/user";

const InitializeTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userdata } = useContext(UserDataContext);
  const terminalRef = useRef(null);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AGENT STATE ---------------- */
  const [agent, setAgent] = useState({
    connected: false,
    path: "",
  });
  
  /* ---------------- TERMINAL STATE ---------------- */
  const [terminalLines, setTerminalLines] = useState([
    { text: "Task environment ready. Type commands or use quick actions below.", isCommand: false, timestamp: new Date() }
  ]);
  const [running, setRunning] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");

  /* ---------------- FETCH TASK ---------------- */
  useEffect(() => {
    if (!taskId || !userdata) return;

    const assignedTasks = userdata.assigned_tasks || [];
    const foundTask = assignedTasks.find(
      (t) => String(t.id) === String(taskId)
    );

    if (!foundTask) {
      setTask(null);
      setLoading(false);
      return;
    }

    const allProjects = [
      ...(userdata.contributed_projects || []),
      ...(userdata.owned_projects || []),
    ];

    const foundProject = allProjects.find(
      (p) => String(p.id) === String(foundTask.project_id)
    );

    setTask({
      ...foundTask,
      project: foundProject || null,
    });
    setLoading(false);
  }, [taskId, userdata]);

  /* ---------------- AGENT CHECK ---------------- */
  useEffect(() => {
    const checkAgent = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/run-commands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commands: [["pwd"]] }),
        });
        const data = await res.json();
        if (data.results && data.results[0] && data.results[0].stdout) {
          const path = data.results[0].stdout.trim();
          setAgent({ connected: true, path });
          addTerminalLine(`$ pwd\n${path}`, true);
        } else {
          setAgent({ connected: false, path: "" });
          addTerminalLine("Agent not connected. Please start the backend server.", false);
        }
      } catch (err) {
        setAgent({ connected: false, path: "" });
        addTerminalLine("❌ Agent connection failed. Check if backend is running on port 3000.", false);
      }
    };
    checkAgent();
    
    const interval = setInterval(checkAgent, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  /* ---------------- TERMINAL HELPERS ---------------- */
  const addTerminalLine = useCallback((text, isCommand = false) => {
    setTerminalLines(prev => [
      ...prev,
      { text, isCommand, timestamp: new Date() }
    ]);
  }, []);

  const scrollToBottom = () => {
    terminalRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- RUN COMMANDS ---------------- */
  const runCommands = async (commands, commandLabel = "") => {
    setRunning(true);
    setCurrentCommand(commandLabel || commands.map(cmd => cmd[0]).join(' | '));
    
    addTerminalLine(`> ${commandLabel || commands.map(cmd => cmd.slice(0,2).join(' ')).join(' | ')}`, true);
    
    try {
      const res = await fetch("http://127.0.0.1:3000/run-commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commands }),
      });
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const outputText = data.results
          .map((r) => {
            let output = "";
            if (r.stdout) output += r.stdout;
            if (r.stderr) output += `\n${r.stderr}`;
            return output;
          })
          .join("\n")
          .trim();
        addTerminalLine(outputText || "Command completed successfully.", false);
      } else {
        addTerminalLine("No output received from agent.", false);
      }
    } catch (err) {
      addTerminalLine(`❌ Error: ${err.message}`, false);
    } finally {
      setRunning(false);
      setCurrentCommand("");
      scrollToBottom();
    }
  };

  /* ---------------- COMMANDS ---------------- */
  const commands = {
    clone: () => runCommands([["git", "clone", task.project.repo_url]], "git clone"),
    init: () => runCommands([["git", "init"]], "git init"),
    status: () => runCommands([["git", "status"]], "git status"),
    add: () => runCommands([["git", "add", "."]], "git add ."),
    commit: () => runCommands([
      ["git", "add", "."],
      ["git", "commit", "-m", "Initial commit"]
    ], "git add . && git commit"),
    push: () => runCommands([["git", "push", "origin", task.branch_name || "main"]], "git push"),
    pull: () => runCommands([["git", "pull", "origin", task.branch_name || "main"]], "git pull"),
    branch: () => runCommands([["git", "branch", "-a"]], "git branch -a"),
    log: () => runCommands([["git", "log", "--oneline", "-10"]], "git log"),
    pwd: () => runCommands([["pwd"]], "pwd"),
    ls: () => runCommands([["ls", "-la"]], "ls -la"),
    install: () => runCommands([["npm", "install"]], "npm install"),
    refresh: () => runCommands([["pwd"]], "refresh")
  };

  /* ---------------- HELPERS ---------------- */
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Task not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-4">
          <button
            onClick={() => navigate(`/taskpage/${task.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Task
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* TASK INFO */}
        <div className="bg-white p-8 rounded-3xl border shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{task.description}</p>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PROJECT */}
          {task.project && (
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border shadow-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Project
              </h3>
              <a
                href={task.project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4 transition-colors"
              >
                <ExternalLink size={16} />
                {task.project.name}
              </a>

              {task.branch_name && (
                <code className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 border border-purple-200 rounded-xl font-mono">
                  <GitBranch size={16} />
                  {task.branch_name}
                </code>
              )}
            </div>
          )}

          {/* AGENT STATUS */}
          <div className="bg-white p-6 rounded-3xl border shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Agent Status
            </h3>
            <div className="space-y-2">
              {agent.connected ? (
                <>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    Connected
                  </div>
                  <code className="block text-xs bg-green-50 p-2 rounded-xl font-mono text-green-800">
                    {agent.path}
                  </code>
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  Not connected
                </div>
              )}
              <button 
                onClick={commands.refresh}
                disabled={!agent.connected || running}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 mt-3 disabled:opacity-50"
              >
                <RefreshCw size={14} className="animate-spin" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        {agent.connected && task.project && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-3xl border border-indigo-200">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-800">
              <Play className="w-6 h-6 text-indigo-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: "Clone", icon: GitBranch, onClick: commands.clone, color: "blue" },
                { label: "Init", icon: RefreshCw, onClick: commands.init, color: "gray" },
                { label: "Status", icon: FileText, onClick: commands.status, color: "green" },
                { label: "Add", icon: Upload, onClick: commands.add, color: "orange" },
                { label: "Commit", icon: ChevronRight, onClick: commands.commit, color: "purple" },
                { label: "Push", icon: Upload, onClick: commands.push, color: "indigo" },
                { label: "Pull", icon: Download, onClick: commands.pull, color: "teal" },
                { label: "Branches", icon: GitBranch, onClick: commands.branch, color: "pink" },
                { label: "Logs", icon: FileText, onClick: commands.log, color: "yellow" },
                { label: "Dir", icon: HardDrive, onClick: commands.pwd, color: "slate" },
                { label: "List", icon: FileText, onClick: commands.ls, color: "cyan" },
                { label: "Install", icon: Package, onClick: commands.install, color: "emerald" }
              ].map(({ label, icon: Icon, onClick, color }, i) => (
                <button
                  key={i}
                  onClick={onClick}
                  disabled={running}
                  className={`
                    group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    ${color === 'blue' ? 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-800' :
                      color === 'gray' ? 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:bg-gray-100 text-gray-800' :
                      color === 'green' ? 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100 text-green-800' :
                      color === 'orange' ? 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100 text-orange-800' :
                      color === 'purple' ? 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 text-purple-800' :
                      color === 'indigo' ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 text-indigo-800' :
                      color === 'teal' ? 'bg-teal-50 border-teal-200 hover:border-teal-400 hover:bg-teal-100 text-teal-800' :
                      color === 'pink' ? 'bg-pink-50 border-pink-200 hover:border-pink-400 hover:bg-pink-100 text-pink-800' :
                      color === 'yellow' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100 text-yellow-800' :
                      color === 'slate' ? 'bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-800' :
                      'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 text-emerald-800'
                    }
                  `}
                >
                  <Icon size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">{label}</span>
                  {running && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TERMINAL */}
        <div className="bg-black rounded-3xl border-4 border-gray-900 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 border-b border-gray-800 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="flex-1">
              {agent.connected && (
                <code className="text-green-400 text-xs font-mono bg-black/30 px-3 py-1 rounded-full">
                  {agent.path}
                </code>
              )}
              {running && (
                <div className="ml-auto flex items-center gap-2 text-yellow-400 text-xs font-mono bg-black/50 px-3 py-1 rounded-full">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Running: {currentCommand}
                </div>
              )}
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-6 font-mono text-sm bg-[linear-gradient(180deg,#000_0%,#1a1a1a_50%,#000_100%)] relative">
            {terminalLines.map((line, i) => (
              <div key={i} className={`mb-2 ${line.isCommand ? 'text-blue-400' : 'text-green-400'}`}>
                {line.text.split('\n').map((l, j) => (
                  <div key={j}>{l}</div>
                ))}
              </div>
            ))}
            <div ref={terminalRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitializeTask;
