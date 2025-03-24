import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Menubar = () => {
  const [userId, setuserId] = useState(null);
  const navigate = useNavigate();

  // Get session ID from sessionStorage when component loads
  useEffect(() => {
    const id = sessionStorage.getItem("id");
    setuserId(id);
  }, []);



  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();
  
    // Navigate to login page
    navigate("/", { replace: true });
  
    // Completely remove history entries
    setTimeout(() => {
      window.location.replace("/");
    }, 100);
  };
  

  return (
    <div className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-dark text-white vh-100">
      <div className="text-decoration-none text-white text-center mb-3">
        <h4>
          <i className="bi bi-journal-text"></i> My Blog
        </h4>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link text-white">
            <i className="bi bi-house-door"></i> Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/post" className="nav-link text-white">
            <i className="bi bi-file-earmark-text"></i> Posts
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/addpost" className="nav-link text-white">
            <i className="bi bi-file-earmark-text"></i> Add Post
          </Link>
        </li>

        {/* Conditionally Render "Add Categories" */}
        {sessionStorage.userId === "1" && (
          <li className="nav-item">
            <Link to="/category" className="nav-link text-white">
              <i className="bi bi-tags"></i> Add Categories
            </Link>
          </li>
        )}

       

        <li className="nav-item">
          <Link to="/users" className="nav-link text-white">
            <i className="bi bi-people"></i> Users
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/settings" className="nav-link text-white">
            <i className="bi bi-gear"></i> Settings
          </Link>
        </li>
      </ul>
      <hr />
      <div className="text-center">
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default Menubar;