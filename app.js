const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
dotenv.config();
const cronService = require("./services/cronService");

const { Server } = require("socket.io");

const { User } = require("./models/User");
const { Message } = require("./models/Message");
const { Group, GroupMembership } = require("./models/Group");
const { ForgotPassword } = require("./models/ForgotPassword");

const sequelize = require("./Utils/database");
const userRoutes = require("./routes/user");
const passwordroutes = require("./routes/password");

const websocketService = require("./services/websocket");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", websocketService);

module.exports = server;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", userRoutes);
app.use("/password", passwordroutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

// Schema relationships
User.belongsToMany(Group, { through: GroupMembership });
Group.belongsToMany(User, { through: GroupMembership });

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsTo(User, { foreignKey: "adminUserId" });

cronService.archiveOldMessages();

sequelize
  .sync()
  .then((result) => {
    server.listen(3000, () => {
      console.log("app is running");
    });
  })
  .catch((err) => console.log(err));
