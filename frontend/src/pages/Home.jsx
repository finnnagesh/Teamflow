import React, { useEffect, useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Target,
  DollarSign,
  Mail,
  GitBranch,
  Clock,
  Star,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import api from "../api/api.js"
import { UserDataContext } from "../context/user";
export default function TeamProjectManagementHomepage() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(UserDataContext);
  const [activeSection, setActiveSection] = useState("intro");

  const navPoints = [
    { id: "features", label: "Features", Icon: Users },
    { id: "how-it-works", label: "How It Works", Icon: Target },
    { id: "pricing", label: "Pricing", Icon: DollarSign },
    { id: "contact", label: "Contact", Icon: Mail },
  ];

  const features = [
    {
      icon: Users,
      title: "Admin & Team Management",
      description:
        "Comprehensive admin dashboard to manage teams and assign tasks to specific team members with clear role definitions.",
    },
    {
      icon: Target,
      title: "Task Assignment",
      description:
        "Assign specific tasks to individual developers with detailed requirements, deadlines, and clear instructions.",
    },
    {
      icon: GitBranch,
      title: "Automatic Branch Creation",
      description:
        "System automatically creates dedicated branches for each task and provides GitHub URLs for seamless development workflow.",
    },
    {
      icon: Clock,
      title: "Time Tracking & Delays",
      description:
        "Monitor task progress and delivery times. Track delays and automatically adjust developer ratings based on performance.",
    },
    {
      icon: Star,
      title: "Developer Rating System",
      description:
        "Dynamic rating system that decreases when developers delay tasks, encouraging timely delivery and accountability.",
    },
    {
      icon: Settings,
      title: "Project Initialization",
      description:
        "Easy project setup with task handlers, branch assignments, and GitHub integration configured automatically.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Initialize Project",
      description: "Admin sets up the project with GitHub repository integration",
    },
    {
      step: "02",
      title: "Create & Assign Tasks",
      description: "Tasks are created and assigned to specific team members",
    },
    {
      step: "03",
      title: "Branch Provisioning",
      description: "System creates dedicated branches and provides GitHub URLs",
    },
    {
      step: "04",
      title: "Development & Tracking",
      description:
        "Developers work on tasks while system tracks time and progress",
    },
    {
      step: "05",
      title: "Rating Updates",
      description:
        "Developer ratings adjust automatically based on delivery performance",
    },
  ];
  if (localStorage.getItem('access')) {
  (async () => {
    try {
      const { data } = await api.get("/user/me/");
      console.log("User data:", data);
      setuserdata(data);
      navigate("/home");
    } catch (error) { 
      console.error("Error fetching user data:", error);

      if (error.response && error.response.status === 401) {
        try {
          const refreshToken = localStorage.getItem("refresh");

          if (!refreshToken) {
            console.error("No refresh token found");
            return;
          }

          const res = await api.post("/user/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccess = res.data.access;

          localStorage.setItem("access", newAccess);

          const { data: newData } = await api.get("/user/me/");
          console.log("Refreshed user data:", newData);
          setuserdata(newData);
          navigate("/home");
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }
  })();
}


  // scroll to a section smoothly
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // update active immediately for visual feedback
      setActiveSection(id);
    }
  };

  // IntersectionObserver to set active section
  useEffect(() => {
    const ids = ["intro", "features", "how-it-works", "pricing", "contact", "rating"];
    const observedElements = [];

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry closest to the center by highest intersectionRatio
        let visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-33% 0px -33% 0px", // focus on the middle portion of viewport
        threshold: [0.01, 0.1, 0.25, 0.5],
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observedElements.push(el);
      }
    });

    return () => {
      observedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white">
      {/* LEFT fixed group that contains the invisible hover zone + sidebar */}
      <div className="group fixed left-0 top-0 h-full z-50 pointer-events-none">
        {/* invisible hover strip (captures hover near left edge) */}
        <div
          className="absolute left-0 top-0 h-full w-6 z-50 pointer-events-auto"
          aria-hidden="true"
        />

        {/* Sidebar (slides in when group (the hover strip) is hovered) */}
        <aside
          className={`absolute top-0 left-0 h-full w-64 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out
            pointer-events-auto bg-black/60 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col justify-between`}
          aria-hidden={false}
        >
          {/* top: logo */}
          <div>
            <div className="flex items-center h-16 px-4 border-b border-white/10">
              <div className="w-9 h-9 bg-blue-600 rounded-md mr-3" />
              <div>
                <div className="text-white font-bold">TeamFlow</div>
                <div className="text-xs text-white/60">Project Manager</div>
              </div>
            </div>

            {/* nav points */}
            <nav className="mt-6 px-2">
              {navPoints.map((p) => {
                const Icon = p.Icon;
                const isActive = activeSection === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => scrollToSection(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors duration-200 text-left
                      ${isActive ? "bg-blue-600/80 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                    aria-current={isActive ? "true" : "false"}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{p.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* bottom: CTA / logout */}
          <div className="px-4 py-6 border-t border-white/10">
            <button
              onClick={() => navigate("/signup")}
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Get Started
            </button>

            
          </div>
        </aside>
      </div>

      {/* MAIN CONTENT - shifts right slightly when sidebar visible */}
      <main className="transition-margin duration-300 ml-0 group-hover:ml-64">
        {/* HERO */}
        <section
          id="intro"
          className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Smart Team Project
              <span className="text-blue-600 block">Management System</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your development workflow with intelligent task assignment,
              automatic GitHub integration, and a performance-based rating system that keeps your team accountable.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started Now
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your development team effectively and maintain high productivity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                      <Icon size={22} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-600">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-600">Simple workflow from project initialization to performance tracking.</p>
            </div>

            <div className="space-y-10">
              {workflowSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {step.step}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden md:block">
                      <ChevronRight className="text-gray-400" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Pricing</h2>
              <p className="text-gray-600">Choose the plan that fits your team's needs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                <h3 className="text-2xl font-semibold mb-2">Free</h3>
                <p className="text-gray-600 mb-4">Basic tools for small teams</p>
                <p className="text-3xl font-bold mb-6">$0</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Get Started</button>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-blue-600 text-center">
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">Advanced tracking & integrations</p>
                <p className="text-3xl font-bold mb-6">$19/mo</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Choose Plan</button>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">For large organizations</p>
                <p className="text-3xl font-bold mb-6">Custom</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Contact Us</button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 mb-8">Have questions? We’d love to hear from you.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg" onClick={() => alert("Contact form placeholder")}>
              Get in Touch
            </button>
          </div>
        </section>

        {/* RATING */}
        <section id="rating" className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Developer Rating System</h2>
            <p className="text-gray-600 mb-8">Automatic rating adjustments based on delivery performance.</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-4xl mb-3">⭐⭐⭐⭐⭐</div>
                <h4 className="font-semibold mb-1">Excellent (5.0)</h4>
                <p className="text-gray-600">Tasks delivered on time consistently</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-4xl mb-3">⭐⭐⭐⭐⚪</div>
                <h4 className="font-semibold mb-1">Good (4.0)</h4>
                <p className="text-gray-600">Minor delays, generally reliable</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-4xl mb-3">⭐⭐⭐⚪⚪</div>
                <h4 className="font-semibold mb-1">Needs Improvement (3.0)</h4>
                <p className="text-gray-600">Frequent delays affecting productivity</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-md mr-3" />
                <div className="font-bold text-lg">TeamFlow</div>
              </div>
              <p className="text-gray-400">Smart project management for development teams.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-white">How it works</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-400">
            © {new Date().getFullYear()} TeamFlow. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
