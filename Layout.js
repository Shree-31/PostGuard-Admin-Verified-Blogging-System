import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; 

const Layout = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Default: Show all posts
  const [posts, setPosts] = useState([]);

  // Fetch Categories
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch Posts by Category
  useEffect(() => {
    let url = "http://localhost:8081/api/postz";
    if (selectedCategory) {
      url = `http://localhost:8081/api/postz?categoryId=${selectedCategory}`;
    }

    axios
      .get(url)
      .then((response) => {
        console.log("Filtered Posts:", response.data);
        setPosts(response.data);
      })
      .catch((error) => console.error("Error fetching posts:", error));
  }, [selectedCategory]);

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">My Blog</header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="text-white text-center mt-3">Categories</h2>
          <ul>
            {/* "All" Category to Show All Posts */}
            <li
              onClick={() => setSelectedCategory(null)} // Reset category filter
              style={{
                cursor: "pointer",
                fontWeight: selectedCategory === null ? "bold" : "normal",
              }}
            >
              All
            </li>

            {/* Other Categories */}
            {categories.map((item) => (
              <li
                key={item.id}
                onClick={() => setSelectedCategory(item.id)}
                style={{
                  cursor: "pointer",
                  fontWeight: selectedCategory === item.id ? "bold" : "normal",
                }}
              >
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </li>
            ))}
          </ul>
        </aside>

        {/* Posts Section */}
        <main className="content">
          <h2>Latest Posts</h2>
          <div className="posts-container ">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="post-card" >
                  <h3>{post.title}</h3>
                  <img
                    src={`http://localhost:8081/uploads/${post.image}`}
                    alt={post.title}
                    style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
                  />

                  <div style={{ marginTop: "15px" }}>
                  <p>{post.description}</p>
                  </div>
                  <div style={{ marginTop: "15px" }}>
                  <button className="read-more mb-3">Read More</button>
                  </div>
                  {/* </Link> */}
                </div>
              ))
            ) : (
              <p>No posts available for this category.</p>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">© 2025 My Blog. All Rights Reserved.</footer>
    </div>
  );
};

export default Layout;