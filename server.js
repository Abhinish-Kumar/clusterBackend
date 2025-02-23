require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3300;

app.use(cookieParser()); // Use cookie-parser middleware

// CORS configuration
app.use(
  cors({
    origin: "https://cluster-rlf5.onrender.com", // Frontend origin
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());

let users = [
  // Your users data...
];

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Route to get user list, but only if user is authenticated (cookie exists)
app.get("/userList", (req, res) => {
  const username = req.cookies.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No username cookie" });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Invalid user" });
  }

  res.json(users);
});

app.post("/register", (req, res) => {
  let { username, password, email } = req.body;
  let createObj = {
    username: username,
    password: password,
    email: email,
    profile: {
      name: username,
      email: email,
      image:
        "https://th.bing.com/th/id/R.fe0ae5077c992bc53e2686dca4ef1b0a?rik=%2fg28oQHnOFwEQw&riu=http%3a%2f%2fthumbs.dreamstime.com%2fz%2fportrait-adorable-young-happy-boy-27903659.jpg&ehk=qiHd5tTy5htdv3hoCfYSXnx5FsqneE02n1aNAgAKHF4%3d&risl=&pid=ImgRaw&r=0",
    },
    notes: [],
  };
  users.push(createObj);
  console.log(users);

  // Set the username as a cookie
  res.cookie("username", createObj.username, {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Set to true if you're using HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour)
    sameSite: "None", // For cross-origin requests
  });

  res.json(createObj.profile); // Send user profile info as the response
});

// Route to get profile data based on cookie
app.get("/profile", (req, res) => {
  const username = req.cookies.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No username cookie" });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.profile);
});

// Route to delete the cookie (log out)
app.get("/deleteCookie", (req, res) => {
  console.log("Deleting the cookie...");

  res.cookie("username", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true for HTTPS in production
    maxAge: 0,
    sameSite: "None",
  });

  res.send({ message: "Logged out successfully" });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.cookie("username", user.username, {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Set to true for HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour)
    sameSite: "None", // For cross-origin requests
  });

  res.json(user.profile);
});

// Route to get notes for a specific user by email
app.get("/userList/:email", (req, res) => {
  const { email } = req.params;
  const username = req.cookies.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No username cookie" });
  }

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.notes); // Send user notes if authenticated
});

app.listen(PORT, () => {
  console.log("Your server is running at port 3300");
});
