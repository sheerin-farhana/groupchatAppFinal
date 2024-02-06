const socketService = (socket) => {
  console.log(`${socket.id} connected`);

  socket.on(
    "new-group-message",
    ({ message, groupId, imageUrl, username, isImage }) => {
      console.log(message, groupId, imageUrl, username);

      // Check if it's an image message
      if (isImage) {
        socket.broadcast.emit("new-group-message", {
          message: "",
          groupId,
          imageUrl,
          username,
          isImage: true,
        });
      } else {
        // Handle text messages as before
        socket.broadcast.emit("new-group-message", {
          message,
          groupId,
          imageUrl,
          username,
        });
      }
    }
  );
};

module.exports = socketService;
