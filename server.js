require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3300;

app.use(cookieParser()); // Use cookie-parser middleware

app.use(
  cors({
    origin: "https://cluster-rlf5.onrender.com/", // Frontend origin
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());

let users = [
  // Same dummy users as before
  {
    username: "john doe",
    password: "password123",
    email: "johndoe@gmail.com",
    profile: {
      name: "John Doe",
      email: "johndoe@gmail.com",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "jane smith",
    password: "password123",
    email: "janesmith@gmail.com",
    profile: {
      name: "Jane Smith",
      email: "janesmith@gmail.com",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  // Other users remain the same
];

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Route to get user list, but only if user is authenticated (cookie exists)
app.get("/userList", (req, res) => {
  // Get user data from cookie
  const userCookieData = req.cookies.username
    ? JSON.parse(req.cookies.username)
    : null;

  if (!userCookieData || !userCookieData.username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Check if the username exists in the users list
  const user = users.find((user) => user.username === userCookieData.username);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Invalid user" });
  }

  // If the user is valid, return the list of users
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

  const userCookieData = {
    username: createObj.username,
    email: createObj.email,
  };

  // Set the username and email as a cookie
  res.cookie("username", JSON.stringify(userCookieData), {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: false, // Set to true if you're using HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour in this case)
    sameSite: "Strict", // Makes sure the cookie is sent only for same-site requests
  });

  res.json(createObj.profile); // Send user profile info as the response
});

// Route to get profile data based on cookie
app.get("/profile", (req, res) => {
  const userCookieData = req.cookies.username
    ? JSON.parse(req.cookies.username)
    : null;

  if (!userCookieData || !userCookieData.username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Find user by username
  const user = users.find((user) => user.username === userCookieData.username);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Send user profile data as the response
  res.json(user.profile);
});

// Route to delete the cookie (log out)
app.get("/deleteCookie", (req, res) => {
  console.log("Deleting the cookie...");

  // Setting the cookie with maxAge 0 to delete it
  res.cookie("username", "", {
    httpOnly: true, // To prevent JavaScript from accessing the cookie
    secure: false, // Use true if using HTTPS in production
    maxAge: 0, // Set cookie expiration to 0 to delete it
    sameSite: "Strict", // Prevent cookie from being sent cross-site
  });

  res.send({ message: "Logged out successfully" });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user based on email
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if password matches
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Set the username and email as a cookie for authentication
  const userCookieData = {
    username: user.username,
    email: user.email,
  };

  res.cookie("username", JSON.stringify(userCookieData), {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: false, // Set to true if you're using HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour in this case)
    sameSite: "Strict", // Makes sure the cookie is sent only for same-site requests
  });

  res.json(user.profile); // Send user profile info as the response
});

// Route to get notes for a specific user by email
app.get("/:email", (req, res) => {
  const { email } = req.params;

  const userCookieData = req.cookies.username
    ? JSON.parse(req.cookies.username)
    : null;

  if (!userCookieData || !userCookieData.username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Find the user with the matching email
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.notes); // Send user notes if authenticated
});

// Backend route to add notes
app.post("/:email", (req, res) => {
  const { email } = req.params;
  const { note } = req.body; // Note to be added comes from the request body
  const userCookieData = JSON.parse(req.cookies.username);
  console.log(userCookieData);
  const userCookieDataGmail = req.cookies.email
    ? JSON.parse(req.cookies.email)
    : null;

  if (!userCookieData || (!userCookieData.username && !userCookieData.email)) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Find the user with the matching email
  const user = users.find(
    (user) => user.email == userCookieData.email && user.email == email
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Add the new note to the user's notes
  user.notes.push({ [user.notes.length]: note });

  // Respond with the updated notes
  res.json(user.notes);
});

// Backend route to delete a note
app.delete("/:email/:noteId", (req, res) => {
  const { email, noteId } = req.params;
  const userCookieData = JSON.parse(req.cookies.username);

  if (!userCookieData || (!userCookieData.username && !userCookieData.email)) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Find the user with the matching email
  const user = users.find(
    (user) => user.email === userCookieData.email && user.email === email
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Ensure the noteId is a valid index
  const noteIndex = parseInt(noteId, 10);
  if (isNaN(noteIndex) || noteIndex < 0 || noteIndex >= user.notes.length) {
    return res.status(400).json({ message: "Invalid note ID" });
  }

  // Remove the note from the user's notes array
  user.notes.splice(noteIndex, 1);

  // Respond with the updated notes
  res.json(user.notes);
});

app.listen(PORT, () => {
  console.log("Your server is running at port 3300");
});
