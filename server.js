import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";

// Custom event handlers
import onCall from "./src-server/events/on-call.js";
import onWebrtcSignal from "./src-server/events/on-webrtcsignal.js";
import onHangup from "./src-server/events/on-hangup.js";

// Information about the environment
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

/**
 * Create a custom server for next.js
 * - when using middleware `hostname` and `port` must be provided below
 */
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Declare the io server, to be used in different modules
export let io;

app.prepare().then(() => {
  // Create the http server
  const httpServer = createServer(handler);
  // The websocket server
  io = new Server(httpServer);

  // All the online users
  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("Client is connected");

    // Add a user
    socket.on("addNewUser", (clerkUser) => {
      if (
        clerkUser &&
        !onlineUsers.some((user) => user?.userId === clerkUser.id)
      ) {
        onlineUsers.push({
          userId: clerkUser.id,
          socketId: socket.id,
          profile: clerkUser,
        });
      }
      // Show the connect users
      console.log("online-users: ".onlineUsers);
      // Send active users
      io.emit("getUsers", onlineUsers);
    });

    // Disconnect a user
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      // Show the connect users
      console.log("online-users: ", onlineUsers);
      // Send active users
      io.emit("getUsers", onlineUsers);
    });

    // Call Events
    socket.on("call", onCall);
    socket.on("webrtcSignal", onWebrtcSignal);
    socket.on('hangup', onHangup)
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
