
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Dropdown } from "react-bootstrap";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]); // ✅ Define state for deleted posts
  const [categories, setCategories] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updatedData, setUpdatedData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  console.log("User ID:", userId);
  console.log("User Role:", userRole);

  const fetchPosts = async () => {
    if (!userId) return;

    try {
        
        let url = `http://localhost:8081/api/post`;

        if (userRole !== "admin") {
            url += `?userId=${userId}`;
        }

        console.log("Fetching from URL:", url); // Debugging

        const response = await axios.get(url, { headers: { "Cache-Control": "no-cache" } });
        console.log("Fetched Posts Data:", response.data); // Debugging
        setPosts(response.data);
    } catch (err) {
        console.error("Error fetching posts:", err);
    }
};


  // ✅ Fetch deleted posts
  const fetchDeletedPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/post?isDeleted=1`);
      setDeletedPosts(response.data);
    } catch (error) {
      console.error("Error fetching deleted posts:", error);
    }
  };

  // ✅ Call fetchPosts on component mount
  useEffect(() => {
    fetchPosts();
    fetchDeletedPosts();
  }, );

  console.log(deletedPosts);

  // ✅ Fetch categories when modal opens
  useEffect(() => {
    if (showModal) {
      axios
        .get("http://localhost:8081/api/categories")
        .then((response) => setCategories(response.data))
        .catch((error) => console.error("Error fetching categories:", error));
    }
  }, [showModal]);

  // ✅ Filter posts properly
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return post;
    if (filter === "verified") return post.isVerified === 1 && post.isDeleted !== 1;
    if (filter === "pending") return post.isVerified === 0 && post.isDeleted === 0;
    if (filter === "deleted") return post.isDeleted === 1;
    return false;
  });

  const handleDelete = async (postId) => {
    alert(postId)
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.put(`http://localhost:8081/api/updatepostdelete/${postId}`);

      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  
  

  const handleEditClick = (post) => {
        if (post.isVerified === 1) return alert("Cannot edit a verified post!");
        setSelectedPost(post);
        setUpdatedData({
          title: post.title,
          description: post.description,
          category: post.category_id || post.category || "",
          image: null,
        });
        setImagePreview(post.image ? `http://localhost:8081/uploads/${post.image}` : null);
        setShowModal(true);
      };

  const verifyPost = async (postId) => {
    if (!window.confirm("Are you sure you want to verify this post?")) return;
    try {
      await axios.put(`http://localhost:8081/api/verifypost/${postId}`);
      alert("Post verified successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error verifying post:", error);
      alert("An error occurred while verifying the post.");
    }
  };

  const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setUpdatedData((prevData) => ({ ...prevData, image: file }));
          setImagePreview(URL.createObjectURL(file));
        }
      };
    
      const handleUpdate = async () => {
        if (!selectedPost) return;
        const { id } = selectedPost;
        const postData = new FormData();
        postData.append("title", updatedData.title);
        postData.append("description", updatedData.description);
        postData.append("category", updatedData.category || "");
        if (updatedData.image) postData.append("image", updatedData.image);
    
        try {
          await axios.put(`http://localhost:8081/api/updatepost/${id}`, postData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          alert("Post updated successfully!");
          setShowModal(false);
          fetchPosts();
        } catch (error) {
          console.error("Error updating post:", error);
          alert("Failed to update post.");
        }
      };
    

  return (
        <div className="main-content">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Manage Posts</h2>
              <Dropdown>
                <Dropdown.Toggle variant="primary">
                  Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilter("all")}>All Posts</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilter("verified")}>Verified Posts</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilter("pending")}>Pending Verification</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilter("deleted")}>Deleted Posts</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
    
            <div className="row d-flex justify-content-start">
              {filteredPosts.map((post) => (
                <div className="card m-2 p-3" style={{ maxWidth: "335px" }} key={post.id}>
                  <img src={`http://localhost:8081/uploads/${post.image}`} className="card-img-top" alt={post.title} />
                  <div className="card-body">
                    <h5 className="card-title">{post.title}</h5>
                    <p className="card-text">{post.description}</p>
                    {post.isVerified === 1 && <span className="badge bg-success mb-2">Verified</span>}
                    {post.isDeleted === 1 && <span className="badge bg-danger mb-2">Deleted</span>}
                    {post.isVerified === 0 && post.isDeleted === 0 && <span className="badge bg-warning text-dark mb-2">Pending</span>}
                  </div>
                  <div>
                    {post.isVerified === 0 && post.isDeleted === 0 && (
                      <>
                        <button className="btn btn-info me-2" onClick={() => handleEditClick(post)}>Edit</button>
                        {userId  === "1" && (
                          <button onClick={() => verifyPost(post.id)} className="btn btn-success me-2">Verify</button>
                        )}
                        <button className="btn btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
    
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Post</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <input type="text" className="form-control mb-3" value={updatedData.title} onChange={(e) => setUpdatedData({ ...updatedData, title: e.target.value })} />
                <textarea className="form-control mb-3" rows="3" value={updatedData.description} onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })} />
                <select
        className="form-control mb-3"
        value={updatedData.category}
        onChange={(e) => setUpdatedData({ ...updatedData, category: e.target.value })}
    >
        <option value="">Select Category</option>
        {categories.map((category) => (
            <option key={category.id} value={category.id}>
                {category.category}
            </option>
        ))}
    </select>
    
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="img-fluid rounded mt-3" style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }} />}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                <Button variant="primary" onClick={handleUpdate}>Update Post</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      );
    };
    

export default Post;