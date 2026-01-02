import React, { useState , useContext } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Github } from "lucide-react";
import {
  login,
  logout,
  isAuthenticated,
  getAccessToken,
} from "../api/auth";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from '../context/user';

import api from "../api/api";
const TeamFlowSignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    github_username: "",
    github_auth_token: "",
  });
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(UserDataContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  (async () => {
  try {
    if (isAuthenticated()) {
      let accessToken = localStorage.getItem("access");

      if (accessToken) {
        const userData = await api.get("/user/me/");
        if (userData.data) {
          setuserdata(userData.data);
          navigate("/home");
          return;
        }
      }

      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        accessToken = await getAccessToken();
        if (accessToken) {
          const userData = await api.get("/user/me/");
          if (userData.data) {
            setuserdata(userData.data);
            navigate("/home");
            return;
          }
        }
      }
      logout();
    }
  } catch (error) {
    logout();
  }
})();

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Signup Data Submitted:", formData);
    try {
      await api.post("/user/signup/", formData).then((response) => {
        console.log("Signup response:", response.data);
        alert("Signup successful! Please log in.");
        login(formData.email, formData.password).then((res) => {
          console.log("userdata :", res);
          setuserdata(res);
          navigate("/home");
        }
        ).catch((err) => {
          console.log(err);
          alert("Login after signup failed. Please try logging in.");
        });
      });
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Sign up with your GitHub credentials</p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-8 shadow-lg rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* GitHub Username */}
            <div>
              <label htmlFor="github_username" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Github className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="github_username"
                  name="github_username"
                  type="text"
                  required
                  value={formData.github_username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your GitHub username"
                />
              </div>
            </div>

            {/* GitHub Auth Token */}
            <div>
              <label htmlFor="github_auth_token" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Auth Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="github_auth_token"
                  name="github_auth_token"
                  type={showToken ? "text" : "password"}
                  required
                  value={formData.github_auth_token}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your GitHub auth token"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamFlowSignUpPage;
