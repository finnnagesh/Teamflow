import api from "./api";

const login = async (email, password) => {
  try {
    const response = await api.post("/token/", { email, password });
    console.log("Login response:", response.data);
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    const data = await api.get("/user/me/");
    console.log("User data:", data.data);
    
    alert("Login successful");
    return data.data;
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed. Please check your credentials.");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    return null;
  }
};

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  alert("Logout successful");
  window.location.href = "/login";
};

const isAuthenticated = () => {
  const accessToken = localStorage.getItem("access");
  return accessToken !== null;
};

const getAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh");
  if (!refreshToken) {
    window.location.href = "/login";
    return null;
  }

  try {
    const response = await api.post("/token/refresh/", { refresh: refreshToken });
    localStorage.setItem("access", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    return null;
  }
};
const fetchUserDataWithRefresh = async () => {
  try {
    // Attempt to fetch user data with current access token
    const accessToken = localStorage.getItem("access");
    if (!accessToken) throw new Error("No access token");

    const userResponse = await api.get("/user/me/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return userResponse.data;
  } catch (error) {
    console.warn("Access token failed, trying to refresh:", error);
    
    // Try to refresh access token using refresh token
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) throw new Error("No refresh token");

      const tokenResponse = await api.post("/token/refresh/", {
        refresh: refreshToken,
      });
      const newAccessToken = tokenResponse.data.access;

      // Save new access token
      localStorage.setItem("access", newAccessToken);

      // Retry fetching user data with new access token
      const retryUserResponse = await api.get("/user/me/", {
        headers: { Authorization: `Bearer ${newAccessToken}` },
      });
      return retryUserResponse.data;
    } catch (refreshError) {
      console.error("Refresh failed:", refreshError);

      // If refresh also fails, clear tokens, redirect to login
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return null;
    }
  }
};
  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}auth/github/`;
  };

export  {
          login,
          handleGithubLogin,
          logout,
          isAuthenticated,
          getAccessToken,fetchUserDataWithRefresh,
        };