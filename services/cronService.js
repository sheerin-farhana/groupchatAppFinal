const cron = require("node-cron");
const { Op } = require("sequelize");
const { Message, ArchivedChat } = require("../models/Message");

const archiveOldMessages = async () => {
  try {
    // Move 1 day old messages to ArchivedChat
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const messagesToArchive = await Message.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    await ArchivedChat.bulkCreate(messagesToArchive);

    // Delete 1 day old messages from Message
    await Message.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    console.log("Archiving completed successfully.");
  } catch (error) {
    console.error("Error during archiving:", error);
  }
};

cron.schedule("0 0 * * *", archiveOldMessages);

module.exports = { archiveOldMessages };
