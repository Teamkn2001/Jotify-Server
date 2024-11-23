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
const { instrument } = require('@socket.io/admin-ui')

const app = express();

// initilal socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // accept port
    origin: ['http://localhost:5173','https://admin.socket.io'],
    credentials : true
   // absolutely suss
  },
});

instrument( io , { auth : false})

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);

app.use("/user", authenticate, userRoute);

app.use(notFound);
app.use(errorMiddleware);

io.on("connection", (socket) => {
  // user enter the page get socket id for each user
  // console.log("user connect with id =", socket.id);

  socket.on("get-docId", docId => {
    // const data = ['']

    socket.join('join room' ,( docId) => { console.log('user join room ', docId)})

    // socket.emit("load-document", data)

    socket.on("update Content", (content) => {
      // console.log(content)
      // send content in quill to other
      socket.broadcast.to(docId).emit("document Updated", content);
    });
  })

  socket.on('disconnect', () => {
    // console.log('user disconnected :', socket.id)
  })
});

const port = process.env.PORT || 8200
// app.listen(port, console.log(`running on port ${port}`));

// using server.listen, Socket.IO can attach itself to the same server instance that Express is using, allowing both to function togetherusing server.listen, Socket.IO can attach itself to the same server instance that Express is using, allowing both to function together
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
