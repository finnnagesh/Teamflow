import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}auth/github/callback${window.location.search}`)
      .then(res => res.json())
      .then(data => {
        if (data.access && data.refresh) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          navigate("/home");
        } else {
          navigate("/login");
        }
      });
  }, [navigate]);

  return <p>Logging you in...</p>;
}
