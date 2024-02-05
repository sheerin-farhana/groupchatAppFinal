const { GroupMembership } = require("../models/Group");
const { Message } = require("../models/Message");
const { Op } = require("sequelize");
const sharp = require("sharp");

const crypto = require("crypto");

const { uploadToS3 } = require("../services/awsServices");

const postMessage = async (req, res, next) => {
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const message = await Message.create({
      Text: text,
      userId: userId,
      username: req.user.Name,
    });

    res
      .status(200)
      .json({ success: true, msg: "message added", message: message.Text });
  } catch (err) {
    console.log(err);
    res.status(500).json * { success: false, msg: "Internal server error" };
  }
};

const getAllMessages = async (req, res, next) => {
  const userId = req.user.id;
  const lastMessageId = req.query.lastmessageid || 0; // Default to 0 if not provided
  console.log(lastMessageId);

  try {
    // Use Sequelize's where clause to fetch messages after the last message id
    const messages = await Message.findAll({
      where: {
        id: {
          [Op.gt]: lastMessageId, //[op.gt] => sequelize greater than operator
        },
      },
    });

    res.status(200).json({
      success: true,
      msg: "Messages fetched",
      messages: messages,
      userId: userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const getAllGroupMessages = async (req, res, next) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;

  try {
    // Check if the user belongs to the specified group
    const userBelongsToGroup = await GroupMembership.findOne({
      where: { UserId: userId, GroupId: groupId },
    });

    if (!userBelongsToGroup) {
      return res
        .status(403)
        .json({ success: false, msg: "User not authorized for this group" });
    }

    const messages = await Message.findAll({
      where: {
        GroupId: groupId,
      },
    });

    res.status(200).json({
      success: true,
      msg: "Group messages fetched",
      messages,
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const postGroupMessage = async (req, res, next) => {
  const { text } = req.body;
  const userId = req.user.id;
  const groupId = req.params.groupId;

  try {
    const userBelongsToGroup = await GroupMembership.findOne({
      where: { UserId: userId, GroupId: groupId },
    });

    if (!userBelongsToGroup) {
      return res
        .status(403)
        .json({ success: false, msg: "User does not belong to this group" });
    }

    const groupMessage = await Message.create({
      Text: text,
      UserId: userId,
      GroupId: groupId,
      username: req.user.Name,
      imageUrl: "noimage",
    });

    res.status(200).json({
      success: true,
      msg: "Group message added",
      message: groupMessage.Text,
      username: req.user.Name,
      imageUrl: groupMessage.imageUrl,
      isImage: false,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const randomImageName = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

const sendImageController = async (req, res) => {
  try {
    console.log(req.file);
    const groupId = req.params.groupId;
    const fileBuffer = req.file.buffer;
    const fileName = randomImageName();
    const contentType = req.file.mimetype;

    const resizedfileBuffer = await sharp(fileBuffer)
      .resize({ height: 350, width: 350, fit: "contain" })
      .toBuffer();

    const imageUrl = await uploadToS3(resizedfileBuffer, fileName, contentType);

    const groupMessage = await Message.create({
      Text: "notext",
      UserId: req.user.id,
      GroupId: groupId,
      username: req.user.Name,
      imageUrl: imageUrl,
    });

    res.status(200).json({
      success: true,
      msg: "fileuploaded",
      message: "",
      imageUrl: imageUrl,
      username: req.user.Name,
      isImage: true,
    });
  } catch (error) {
    console.error("Error in sendImageController:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  postMessage,
  getAllMessages,
  getAllGroupMessages,
  postGroupMessage,
  sendImageController,
};
