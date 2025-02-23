const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser()); // Use cookie-parser middleware

app.use(
  cors({
    origin: "https://cluster-rlf5.onrender.com/", // Frontend origin
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());

let users = [
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
  {
    username: "michael brown",
    password: "password123",
    email: "michaelbrown@gmail.com",
    profile: {
      name: "Michael Brown",
      email: "michaelbrown@gmail.com",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "emily davis",
    password: "password123",
    email: "emilydavis@gmail.com",
    profile: {
      name: "Emily Davis",
      email: "emilydavis@gmail.com",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "robert johnson",
    password: "password123",
    email: "robertjohnson@gmail.com",
    profile: {
      name: "Robert Johnson",
      email: "robertjohnson@gmail.com",
      image: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "susan wilson",
    password: "password123",
    email: "susanwilson@gmail.com",
    profile: {
      name: "Susan Wilson",
      email: "susanwilson@gmail.com",
      image: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "william moore",
    password: "password123",
    email: "williammoore@gmail.com",
    profile: {
      name: "William Moore",
      email: "williammoore@gmail.com",
      image: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "olivia taylor",
    password: "password123",
    email: "oliviataylor@gmail.com",
    profile: {
      name: "Olivia Taylor",
      email: "oliviataylor@gmail.com",
      image: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "david martinez",
    password: "password123",
    email: "davidmartinez@gmail.com",
    profile: {
      name: "David Martinez",
      email: "davidmartinez@gmail.com",
      image: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
  {
    username: "mary garcia",
    password: "password123",
    email: "marygarcia@gmail.com",
    profile: {
      name: "Mary Garcia",
      email: "marygarcia@gmail.com",
      image: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    notes: [{ 1: "This is a dummy note" }, { 2: "This is another dummy note" }],
  },
];

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Route to get user list, but only if user is authenticated (cookie exists)
app.get("/userList", (req, res) => {
  // Get username from cookie
  const username = req.cookies.username;

  // Check if username exists in the cookie
  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Check if the username exists in the users list
  const user = users.find((user) => user.username === username);

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

  // Set the username as a cookie
  res.cookie("username", createObj.username, {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: false, // Set to true if you're using HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour in this case)
    sameSite: "Strict", // Makes sure the cookie is sent only for same-site requests
  });

  res.json(createObj.profile); // Send user profile info as the response
});

// Route to get profile data based on cookie
app.get("/profile", (req, res) => {
  // Get username from cookie
  const username = req.cookies.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }

  // Find user by username
  const user = users.find((user) => user.username === username);

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

  // Set the username as a cookie for authentication
  res.cookie("username", user.username, {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: false, // Set to true if you're using HTTPS
    maxAge: 3600000, // Cookie expiry time (1 hour in this case)
    sameSite: "Strict", // Makes sure the cookie is sent only for same-site requests
  });

  res.json(user.profile); // Send user profile info as the response
});

// Route to get notes for a specific user by email
app.get("/userList/:email", (req, res) => {
  const { email } = req.params;
  console.log(email);
  const username = req.cookies.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No username cookie" });
  }
  //jiska email hoga usi ka data denge

  //ye obj hi jiska email hi uska
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // console.log(user.username, username);
  // let authUser = users.find((user) => user.username === username);
  // if (!authUser) {
  //   return res.status(403).json({ message: "Unauthorized: Access denied" });
  // }

  res.json(user.notes); // Send user notes if authenticated
});

app.listen(3300, () => {
  console.log("Your server is running at port 3300");
});
