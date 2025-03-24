import React, { useState, useEffect } from "react";

const Category = () => {
  const [category, setCategory] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAddMessage("");
      setEditMessage("");
    }, 1000);

    return () => clearTimeout(timer);
  }, [addMessage, editMessage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/category");
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        setEditMessage("Failed to load categories.");
      }
    } catch (error) {
      setEditMessage("Error fetching categories.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.trim()) {
      setAddMessage("Category cannot be empty or spaces.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        setAddMessage("Category added successfully!");
        setCategory("");
        fetchCategories();
      } else {
        setAddMessage(data.message || "Failed to add category.");
      }
    } catch (error) {
      setAddMessage("Failed to connect to the server.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8081/api/category/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
        setEditMessage("Category deleted successfully!");
      } else {
        setEditMessage("Failed to delete category.");
      }
    } catch (error) {
      setEditMessage("Error deleting category.");
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditCategory(name.charAt(0).toUpperCase() + name.slice(1));
    setEditMessage("");
  };

  const handleUpdate = async () => {
    if (!editCategory.trim()) {
      setEditMessage("Category cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/category/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editCategory.trim() })
      });

      if (response.ok) {
        setEditMessage("Category updated successfully!");
        setEditingId(null);
        setEditCategory("");
        fetchCategories();
      } else {
        setEditMessage("Failed to update category.");
      }
    } catch (error) {
      setEditMessage("Error updating category.");
    }
  };

  return (
    <div className="container mt-3" style={{ position: "static" }}>
      <div className="d-flex flex-column align-items-center">
        <div className="card p-4 shadow" style={{ width: "400px" }}>
          <h3 className="mb-3">Add Category</h3>
          {addMessage && <p style={{ color: "red" }}>{addMessage}</p>}
          <form className="d-flex flex-column" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Category"
              className="form-control mb-3"
              value={category}
              onChange={(e) => setCategory(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            />
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>

        <div className="card p-4 mt-4 mb-4 shadow" style={{ width: "600px" }}>
          <h3 className="mb-3">Category List</h3>
          {editMessage && <p style={{ color: "green" }}>{editMessage}</p>}
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                        />
                      ) : (
                        cat.category.charAt(0).toUpperCase() + cat.category.slice(1)
                      )}
                    </td>
                    <td>
                      {editingId === cat.id ? (
                        <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Save</button>
                      ) : (
                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(cat.id, cat.category)}>Edit</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category;





