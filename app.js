require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

// Config environment
const express = require("express"); // Import express
const fs = require("fs");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const fileUpload = require("express-fileupload");

const app = express(); // Make express app

app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(cors());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attact
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1000,
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Use helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/* istanbul ignore next */
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  app.use(morgan("dev"));
} else {
  // create a write stream (in append mode)
  let accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    {
      flags: "a",
    }
  );

  // setup the logger
  app.use(morgan("combined", { stream: accessLogStream }));
}

/* Import routes */
const google = require("./routes/auth/google");
const facebook = require("./routes/auth/facebook");
const auth = require("./routes/auth/local");
const playlists = require("./routes/playlists");
const songs = require("./routes/songs");
const users = require("./routes/users");
const albums = require("./routes/albums");
const ratings = require("./routes/ratings");
const artists = require("./routes/artists");

/* Import errorHander */
const errorHandler = require("./middlewares/errorHandler");

/* Enables req.body */
app.use(express.json()); // Enables req.body (JSON)
// Enables req.body (url-encoded)
app.use(
  express.urlencoded({
    extended: true,
  })
);

/* Enable req.body and req.files (form-data) */
app.use(fileUpload());

/* Make public folder for static file */
app.use(express.static("public"));

/* Use the routes */
app.use("/auth/google", google);
app.use("/auth/facebook", facebook);
app.use("/auth", auth);
app.use("/playlists/:playlistId/rating", ratings);
app.use("/playlists", playlists);
app.use("/artists", artists);
app.use("/songs", songs);
app.use("/users", users);
app.use("/albums", albums);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world, from musicon" });
});

/* If route not found */
app.all("*", (req, res, next) => {
  try {
    /* istanbul ignore next */
    next({ message: "Endpoint not found", statusCode: 404 });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
});

/* Use error handler */
app.use(errorHandler);

/* Run the server */
/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(3002, () => console.log(`Server running on 3002`));

  // Enable socket.io
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      method: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("new client connected");

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });

  // app.set("socketio", io);
  app.locals.io = io;
}

// Export app for testing
module.exports = app;
