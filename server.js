require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoute = require("./routes/auth-route");
const notFound = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error-middleware");
const authenticate = require("./middlewares/authenticate");
const userRoute = require("./routes/user-route");
const http = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const { time } = require("console");
const createError = require("./utils/createError");
const prisma = require("./configs/prisma");

const app = express();

// initilal socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // accept port
    origin: ["http://localhost:5173", "https://admin.socket.io"],
    credentials: true,
    // absolutely suss
  },
});

instrument(io, { auth: false });
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);

app.use("/user", authenticate, userRoute);

app.use(notFound);
app.use(errorMiddleware);

const activeDocuments = new Map(); // track active document

io.on("connection", (socket) => {
  // user enter the page get socket id for each user
  console.log("user connect with id =", socket.id);

  // manage user join each document
  socket.on("join-document", ({ docId, userId }) => {
    console.log("docId and userId ===", docId, userId);
    socket.join(docId);

    // Check and initialize the Set if it doesn't exist
    if (!activeDocuments.has(+docId)) {
      activeDocuments.set(+docId, new Set());
    }
    // Now we can safely add the userId
    activeDocuments.get(+docId).add(+userId);

    console.log(`User ${userId} joined document ${docId}`);
  });

  // save to mysql 
  socket.on("save-document", async ({ docId, content, title, userId }) => {
    try {
      console.log("save-document prepare", docId, content, title, userId);
      const arrayContent = JSON.stringify(content);

      const idDocExist = await prisma.document.findUnique({
        where: {
          id: +docId,
        },
      });
      if (!idDocExist) {
        createError(400, "document  not found");
        socket.emit("save-error", { error: "document not found" });
      }

      const updateContent = await prisma.document.update({
        where: {
          id: +docId,
        },
        data: {
          title: title,
          content: arrayContent,
          updatedAt: new Date(),
        },
      });

      const timestamp = Date.now();
      // send success response
      socket.emit("document-saved", {
        timestamp: updateContent.updatedAt,
      });

    } catch (error) {
      createError(500, error.message);
      socket.emit("save-error", { error: error.message });
    }
  });

  socket.on("content-changed", ({ docId, updatedPages, title, userId }) => {
    // broadcast changes to all user
    socket.to(docId).emit("document-updated", {
      updatedPages,
      updatedTitle: title,
      updatedBy: userId,
    });
  });

  socket.on("disconnect", () => {
    activeDocuments.forEach((users, docId) => {
      users.forEach((userId) => {
        if (socket.rooms.has(docId)) {
          users.delete(userId);
          if (users.size === 0) {
            activeDocuments.delete(docId);
          }
        }
      });
    });

    console.log("user disconnect with id ❗=", socket.id);
  });
});

const port = process.env.PORT || 8200;
// app.listen(port, console.log(`running on port ${port}`));

// using server.listen, Socket.IO can attach itself to the same server instance that Express is using, allowing both to function togetherusing server.listen, Socket.IO can attach itself to the same server instance that Express is using, allowing both to function together
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
