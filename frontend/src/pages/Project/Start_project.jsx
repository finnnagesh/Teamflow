import React, { useState } from 'react';
import api from "../../api/api";
const StartProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repo_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Replace with your actual API endpoint
      const apiResponse = await api.post('/project/project_setup/', formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      alert('Project created successfully!');
      setResponse(apiResponse.data);
      console.log('Project created successfully:', apiResponse.data);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        repo_url: ''
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      repo_url: ''
    });
    setError(null);
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Start New Project</h2>
          <p className="mt-2 text-gray-600">Create a project with auto owner assignment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project description"
            />
          </div>

          {/* Repository URL */}
          <div>
            <label htmlFor="repo_url" className="block text-sm font-medium text-gray-700 mb-2">
              Repository URL *
            </label>
            <input
              type="url"
              id="repo_url"
              name="repo_url"
              value={formData.repo_url}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/repo"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Reset
            </button>
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default StartProject;
