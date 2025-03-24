


import React, { useEffect, useState } from "react";
import axios from "axios";

const AddPost = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    description: "",
    category: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const userId = localStorage.getItem("userId"); // ✅ Fetch user ID

  // ✅ Fetch Categories
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/category")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // ✅ Fetch Admin Status
    const userRole = localStorage.getItem("role"); 
    if (userRole === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    // ✅ Validate form
    if (!formData.title || !formData.image || !formData.description || !formData.category) {
      setError("All fields are required");
      return;
    }

    const postData = new FormData();
    postData.append("title", formData.title);
    postData.append("image", formData.image);
    postData.append("description", formData.description);
    postData.append("category", formData.category);
    postData.append("userId", userId);
    postData.append("verified", isAdmin ? "true" : "false");

    try {
      const response = await axios.post("http://localhost:8081/api/addpost", postData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Server Response:", response); // Debugging

      if (response.status === 200 || response.status === 201) {
        alert(`✅ Post added successfully! ${isAdmin ? "Verified automatically ✅" : "Awaiting verification ⏳"}`);

        setFormData({
          title: "",
          image: null,
          category: "",
          description: "",
        });

        setImagePreview(null);
        document.getElementById("imageInput").value = null;
      }
    } catch (error) {
      console.error("Error adding post:", error);

      if (error.response) {
        console.log("Server Error Response:", error.response);
      } else {
        console.log("Unexpected Error:", error.message);
      }

      alert("❌ Failed to add post.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-4">
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center">Add Post</h3>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="d-flex flex-column">
          {/* Title */}
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter Title"
              className="form-control"
              value={formData.title}
              onChange={(e) => {
                const value = e.target.value;
                const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                setFormData({ ...formData, title: capitalizedValue });
              }}
            />
          </div>

          {/* Image Upload */}
          <div className="mb-3">
            <label className="form-label">Image</label>
            <input
              type="file"
              id="imageInput"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="img-fluid rounded"
                style={{ maxHeight: "200px", objectFit: "cover", width: "300px" }}
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </option>
                ))
              ) : (
                <option disabled>No Categories Available</option>
              )}
            </select>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label" htmlFor="description">Description:</label>
            <textarea
              className="form-control"
              rows="3"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPost;



