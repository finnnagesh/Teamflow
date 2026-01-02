// src/pages/AgentHeroSetupPage.jsx
import React from "react";

const AGENT_DOWNLOAD_URL = import.meta.env.VITE_AGENT_DOWNLOAD_URL;

const steps = [
  {
    title: "Download the Agent",
    description:
      "Grab the agent binary for your OS using the button above. This file is your local command runner.",
  },
  {
    title: "Place it in your Workspace",
    description:
      "Move the agent into the folder where your project is forked/cloned or into a top-level workspace that contains all your projects.",
  },
  {
    title: "Run the Agent",
    description:
      "Open a terminal in that folder and run the agent so it can listen on port 3000 for backend requests.",
  },
  {
    title: "Connect from Backend",
    description:
      "Configure your backend to send JSON commands to http://localhost:3000/run-commands.",
  },
];

const AgentHeroSetupPage = () => {
  const handleDownload = () => {
    window.location.href = AGENT_DOWNLOAD_URL;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Soft gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 right-0 w-[32rem] h-[32rem] rounded-full bg-indigo-200/60 blur-3xl animate-[ping_5s_linear_infinite]" />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Hero */}
        <section className="max-w-5xl w-full text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 shadow-sm animate-bounce mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-medium text-slate-700">
              Local agent · Listens on port 3000
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-[fadeIn_0.8s_ease-out]">
            Set up your <span className="text-sky-600">Work Agent</span> in a
            few steps
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-sm md:text-base animate-[fadeIn_1.1s_ease-out]">
            The Work Agent runs on your machine, inside the same folder as your
            projects, and executes commands requested by your backend over HTTP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeIn_1.3s_ease-out]">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-300/60 transition transform hover:-translate-y-0.5"
            >
              <span className="animate-pulse">⬇</span>
              Download Agent
            </button>
            <a
              href={AGENT_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sky-700 text-sm underline underline-offset-4 decoration-sky-400 hover:text-sky-800"
            >
              Direct link: {AGENT_DOWNLOAD_URL}
            </a>
          </div>
        </section>

        {/* Layout: left explanation + right stepper */}
        <section className="max-w-5xl w-full grid md:grid-cols-[1.2fr,1fr] gap-10 items-start">
          {/* Left: detailed explanation */}
          <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-md animate-[fadeIn_1.4s_ease-out]">
            <h2 className="text-xl font-semibold mb-3">
              Where should I keep the agent?
            </h2>
            <p className="text-sm text-slate-700 mb-4">
              To make the commands behave exactly like you working in that
              project, keep the agent binary in the same directory where your
              repo is cloned or in a parent workspace folder.
            </p>
            <ul className="list-disc ml-5 text-sm text-slate-700 space-y-2">
              <li>
                <span className="font-semibold">Single project:</span> place the
                agent directly inside that project root (same level as{" "}
                <code className="text-xs bg-slate-100 px-1 rounded border border-slate-200">
                  package.json
                </code>{" "}
                or{" "}
                <code className="text-xs bg-slate-100 px-1 rounded border border-slate-200">
                  manage.py
                </code>
                ).
              </li>
              <li>
                <span className="font-semibold">Multiple projects:</span> create
                a workspace folder (for example{" "}
                <code className="text-xs bg-slate-100 px-1 rounded border border-slate-200">
                  ~/Dev
                </code>
                ) that contains all repos, and keep the agent there so it can be
                used for any project under that directory.
              </li>
              <li>
                The key idea: the folder where you start the agent is considered
                the “base path” for any commands the backend sends.
              </li>
            </ul>

            <div className="mt-6 text-sm text-slate-800">
              <h3 className="font-semibold mb-2">Example layout</h3>
              <pre className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-left overflow-x-auto">
{`~/Dev/                 # workspace folder
  agent-linux           # <--- keep agent here
  my-django-project/
  my-react-app/
  another-service/`}
              </pre>
            </div>
          </div>

          {/* Right: animated stepper */}
          <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-md animate-[fadeIn_1.6s_ease-out]">
            <h2 className="text-lg font-semibold mb-4">Setup steps</h2>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition">
                      {index + 1}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-sky-400/70 to-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-700">
                      {step.description}
                    </p>
                    {index === 2 && (
                      <div className="mt-2 text-[11px] text-slate-600">
                        <p>Linux/macOS:</p>
                        <pre className="bg-slate-100 border border-slate-200 rounded px-2 py-1 mt-1">
{`chmod +x ./agent-linux
./agent-linux`}
                        </pre>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="mt-2 text-[11px] text-slate-600">
                        <p>Example backend call:</p>
                        <pre className="bg-slate-100 border border-slate-200 rounded px-2 py-1 mt-1 overflow-x-auto">
{`POST http://localhost:3000/run-commands
Content-Type: application/json

{
  "commands": [
    ["echo", "hello from agent"],
    ["ls"]
  ]
}`}
                        </pre>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AgentHeroSetupPage;
