// Required Modules
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 8081; // Ensure this matches frontend API calls

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blogs",
});

// ✅ Database Connection Check
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
});



app.post("/api/login", (req, res) => {
  const { email, username, password } = req.body;
  const sql =
    "SELECT id, email, username, password, isAdmin, COALESCE(userRole, 'user') AS userRole FROM login WHERE email = ? OR username = ?";

  db.query(sql, [email, username], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database error", timeout: 1000 });

    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid email or username", timeout: 1000 });
    }

    const user = results[0];
    if (user.password === password) {
      return res
        .status(200)
        .json({ message: "Login successful", user, timeout: 1000 });
    } else {
      return res
        .status(401)
        .json({ error: "Incorrect password", timeout: 1000 });
    }
  });
});

// // ✅ Add Category (Prevents Duplicate Entries)
app.post("/api/category", (req, res) => {
  let { category } = req.body;
  if (!category) {
    return res
      .status(400)
      .json({ message: "Category is required", timeout: 1000 });
  }

  category = category.trim().toLowerCase(); // Normalize input (remove spaces and convert to lowercase)

  const checkQuery = "SELECT * FROM category WHERE LOWER(category) = ?";
  db.query(checkQuery, [category], (err, results) => {
    if (err) {
      console.error("Error checking category:", err);
      return res.status(500).json({ message: "Database error", timeout: 1000 });
    }
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Category already exists", timeout: 1000 });
    }

    const insertQuery = "INSERT INTO category (category) VALUES (?)";
    db.query(insertQuery, [category], (err, result) => {
      if (err) {
        console.error("Error inserting category:", err);
        return res
          .status(500)
          .json({ message: "Database error", timeout: 1000 });
      }
      console.log(`Category added: ${category} (ID: ${result.insertId})`);
      res.status(201).json({
        message: "Category added successfully",
        id: result.insertId,
        timeout: 1000,
      });
    });
  });
});

// ✅ Fetch Categories in Alphabetical Order
app.get("/api/category", (req, res) => {
  const query = "SELECT id, category FROM category ORDER BY category ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ message: "Database error", timeout: 1000 });
    }
    res.status(200).json(results);
  });
});

// ✅ Update Category
app.put("/api/category/:id", (req, res) => {
  const { id } = req.params;
  let { category } = req.body;

  if (!category) {
    return res
      .status(400)
      .json({ message: "Category is required", timeout: 1000 });
  }

  category = category.trim().toLowerCase(); // Normalize category name

  const checkQuery = "SELECT * FROM category WHERE LOWER(category) = ?";
  db.query(checkQuery, [category], (err, results) => {
    if (err) {
      console.error("Error checking category:", err);
      return res.status(500).json({ message: "Database error", timeout: 1000 });
    }
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Category already exists", timeout: 1000 });
    }

    const updateQuery = "UPDATE category SET category = ? WHERE id = ?";
    db.query(updateQuery, [category, id], (err, result) => {
      if (err) {
        console.error("Error updating category:", err);
        return res
          .status(500)
          .json({ message: "Database error", timeout: 1000 });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Category not found", timeout: 1000 });
      }
      res
        .status(200)
        .json({ message: "Category updated successfully", timeout: 1000 });
    });
  });
});

// ✅ Delete Category
app.delete("/api/category/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM category WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting category:", err);
      return res.status(500).json({ message: "Database error", timeout: 1000 });
    }
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Category not found", timeout: 1000 });
    }
    console.log(`Category deleted (ID: ${id})`);
    res
      .status(200)
      .json({ message: "Category deleted successfully", timeout: 1000 });
  });
});

// ✅ Fetch Verified Posts
app.get("/api/verifiedPosts", (req, res) => {
  const sql = "SELECT * FROM addpost WHERE isVerified = 1";
  db.query(sql, (err, data) => {
    if (err)
      return res.status(500).json({ error: "Error fetching verified posts" });
    return res.json(data);
  });
});

// ✅ Verify Post

app.put("/api/verifyPost/:id", (req, res) => {
  const postId = req.params.id;
  const sql = "UPDATE addpost SET isVerified = 1 WHERE id = ?";

  db.query(sql, [postId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error verifying post" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "⚠️ Post not found" });

    res.json({ message: "✅ Post verified successfully!" });
  });
});

// ✅ Fetch Non-Deleted & Non-Verified Posts
app.get("/api/posts", (req, res) => {
  res.setHeader("Cache-Control", "no-store"); // Ensure fresh data every time
  const sql =
    "SELECT id, title, description, image FROM addpost WHERE isDeleted = 0 AND isVerified = 0";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "❌ Database query failed" });
    res.json(result);
  });
});

// ✅ Add New Post (Image Upload)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

app.post("/api/addpost", upload.single("image"), (req, res) => {
  const { title, description, category, userId } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !description || !category || !image || !userId) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  // Check if user is admin (userId = 1)
  const isVerified = userId == 1 ? 1 : 0; // Admin posts auto-verified

  const sql =
    "INSERT INTO addpost (title, image, description, category, userId, isVerified) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [title, image, description, category, userId, isVerified],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "❌ Failed to add post" });

      res.json({
        message: "✅ Post added successfully!",
        postId: result.insertId,
        autoVerified: isVerified === 1,
      });
    }
  );
});

app.post("/api/addpost", upload.single("image"), (req, res) => {
  const { title, description, category } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !description || !category || !image) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  const sql =
    "INSERT INTO addpost (title, image, description, category,userId ) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [title, image, description, category, userId],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "❌ Failed to add post" });
      res.json({
        message: "✅ Post added successfully!",
        postId: result.insertId,
      });
    }
  );
});

app.get("/api/posts", async (req, res) => {
  const userId = req.query.userId; // Get userId from request query
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const query = "SELECT * FROM addpost WHERE userId = ? OR isVerified = 1";
    const [posts] = await db.execute(query, [userId]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/editpost/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, category, userId } = req.body;

  // Check if post belongs to the user & is not verified
  const [post] = await db.execute("SELECT * FROM addpost WHERE id = ?", [id]);
  if (!post || post.userId !== userId || post.isVerified) {
    return res
      .status(403)
      .json({ error: "Unauthorized or post already verified" });
  }

  // Update post
  await db.execute(
    "UPDATE addpost SET title = ?, description = ?, category = ? WHERE id = ?",
    [title, description, category, id]
  );

  res.json({ message: "Post updated successfully" });
});



app.get("/api/categories", (req, res) => {
  const query = "SELECT * FROM category";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching categories:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
    res.status(200).json(results);
  });
});

// ✅ Update Post
app.put("/api/updatepost/:id", upload.single("image"), (req, res) => {
  const { title, description, category } = req.body;
  const postId = req.params.id;
  let image = req.file ? req.file.filename : null;

  // Get existing post image if no new image is uploaded
  const getImageQuery = "SELECT image FROM addpost WHERE id = ?";
  db.query(getImageQuery, [postId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: "Post not found" });
    }

    if (!image) {
      image = results[0].image; // Keep the existing image
    }

    const sql =
      "UPDATE addpost SET title = ?, description = ?, category = ?, image = ? WHERE id = ?";
    db.query(
      sql,
      [title, description, category, image, postId],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Failed to update post" });
        res.json({ message: "Post updated successfully" });
      }
    );
  });
});

// **Fetch All Posts (With Optional Filtering)**
app.get("/api/post", (req, res) => {
  let sql = "SELECT * FROM addpost"; // Base query
  let conditions = []; // Use an array to store conditions safely
  const { userId, role, status } = req.query; // Get user info from query params

  // 🟢 Filter based on verification status
  if (status) {
    if (status === "verified")
      conditions.push("isDeleted = 0 AND isVerified = 1");
    if (status === "pending")
      conditions.push("isDeleted = 0 AND isVerified = 0");
    if (status === "deleted") conditions.push("isDeleted = 1");
  }

  // 🟢 If user is NOT admin, filter by userId
  if (role !== "admin" && userId) {
    conditions.push(`userId = ${userId}`);
    // conditions.push(`  isDeleted = 0`);

  }

  // 🟢 Combine conditions correctly
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  

  // 🟢 Execute query
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(data);
  });
});

app.put("/api/updatepost/:id", (req, res) => {
  const { title, description, category, image } = req.body;
  const postId = req.params.id;

  db.query(
    "SELECT isVerified FROM addpost WHERE id = ?",
    [postId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result[0].isVerified === 1) {
        return res.status(403).json({ message: "Cannot edit a verified post" });
      }

      const sql =
        "UPDATE addpost SET title=?, description=?, category=?, image=? WHERE id=?";
      db.query(
        sql,
        [title, description, category, image, postId],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Post updated successfully" });
        }
      );
    }
  );
});

app.put("/api/updatepostdelete/:id", (req, res) => {
  const postId = req.params.id;

  const sql = "UPDATE addpost SET isDeleted=? WHERE id=?";
  db.query(sql, ["1", postId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Post Deleted shree successfully" });
  });
});



app.get("/api/post/delete/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await db.query(
      "UPDATE addpost SET isDeleted = 1 WHERE id = ?",
      [postId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Post deleted successfully!" });
    } else {
      res.status(404).json({ error: "Post not found!" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/post/verify/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("UPDATE addpost SET isVerified = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/post", (req, res) => {
  // return 'hello';
  const userId = req.query.userId; // Get userId from query params

  console.log("Received userId:", userId); // Debugging

  let sql;
  let params = [];

  if (userId) {
    sql = "SELECT * FROM addpost WHERE userId = " + userId + "AND isDeleted=0"  ;
    params.push(userId);
    // console.log('here')
  } else {
    // sql = "SELECT * FROM addpost";
  }
  console.log(sql.length);
  db.query(sql, params, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(data);
  });
});

app.put("/api/post/verify/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const sql = "UPDATE addpost SET isVerified = 1 WHERE id = ?";

    await db.query(sql, [postId]);
    res.status(200).json({ message: "Post verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying post", error });
  }
});







//UserPanel Server code

// API Route to Get Categories
app.get("/api/categories", (req, res) => {
  const sql = "SELECT * FROM category"; // Fetch all categories
  db.query(sql, (err, result) => {
    if (err) return res.json({ error: err });
    res.json(result);
  });
});




  app.get("/api/postz", (req, res) => {
    const categoryId = req.query.categoryId;
  
    let sql = `
      SELECT addpost.*, category.category 
      FROM addpost 
      JOIN category ON addpost.category = category.id
      WHERE addpost.isDeleted = 0 AND isVerified = 1
    `;
  
    let values = [];
  
    if (categoryId) {
      sql += " AND addpost.category = ?";
      values.push(categoryId);
    }
  
    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(result);
    });
  });
  




    






// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});
