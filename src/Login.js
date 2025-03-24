import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Prevent going back to the dashboard after logout
  useEffect(() => {
    const handleBackButton = () => {
      navigate("/login", { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  useEffect(() => {
    setUsername(sessionStorage.getItem("username") || "");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("username", username);
  }, [username]);

  useEffect(() => {
    const storedUserRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");
    console.log("Current userRole from storage:", storedUserRole);
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost:8081/api/login", {
            email,
            username,
            password,
        });

        console.log("Login Response:", response.data); // Debugging line

        if (response.status === 200) {
            const { id, isAdmin, userRole } = response.data.user;

            console.log("User Role:", userRole); // Debugging line

            sessionStorage.setItem("userId", id);
            sessionStorage.setItem("isAdmin", isAdmin);
            sessionStorage.setItem("userRole", userRole);

            localStorage.setItem("userId", id);
            localStorage.setItem("isAdmin", isAdmin);
            localStorage.setItem("userRole", userRole);

            navigate("/dashboard", { replace: true });
        }
    } catch (err) {
        console.error("Login Error:", err.response?.data); // Debugging line
        setError(err.response?.data?.error || "Login failed. Please try again.");
    }
};


  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h2 className="text-center mb-4">Login</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
