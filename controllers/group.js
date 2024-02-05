const { Group, GroupMembership } = require("../models/Group");
const { User } = require("../models/User");
const { Message } = require("../models/Message");

const getGroupMembers = async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    // Find the group
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          through: { attributes: [] },
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ success: false, msg: "Group not found" });
    }

    // Extract the users from the group
    const groupMembers = group.Users;

    res.status(200).json({
      success: true,
      msg: "Group members fetched",
      groupMembers,
      groupName: group.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const postGroup = async (req, res, next) => {
  const { name, users } = req.body;
  const adminUserId = req.user.id;

  console.log("Admin user id", adminUserId);

  try {
    // Create a new group instance
    const newGroup = await Group.create({
      name,
      adminUserId,
    });

    const adminUser = await User.findByPk(adminUserId);
    adminUser.IsAdmin = 1;
    await adminUser.save();

    console.log("admin user", adminUser);

    // Add users to the newly created group
    if (users && users.length > 0) {
      const groupUsers = await User.findAll({
        where: {
          id: users,
        },
      });

      await newGroup.addUsers(groupUsers);
    }

    res.status(201).json({ group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserGroups = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const userGroups = await Group.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] }, // Exclude extra attributes from the join table
          where: { id: userId },
        },
      ],
    });

    res
      .status(200)
      .json({ success: true, msg: "User groups fetched", userGroups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const updateGroup = async (req, res, next) => {
  const groupId = req.params.groupId;
  const { name, users } = req.body;
  const adminUserId = req.user.id;

  try {
    // Find the group
    const group = await Group.findByPk(groupId, {
      include: [{ model: User }],
    });

    const isAdmin = await Group.findOne({
      where: {
        id: groupId,
        adminUserId: adminUserId,
      },
    });

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized. Only group admins can update the group.",
      });
    }
    if (!group) {
      return res.status(404).json({ success: false, msg: "Group not found" });
    }

    // Update group name
    group.name = name;
    await group.save();

    // Get existing members
    const existingMembers = group.Users.map((user) => user.id);

    // Remove existing members not in the updated list
    const membersToRemove = existingMembers.filter(
      (member) => !users.includes(member)
    );
    await group.removeUsers(membersToRemove);

    // Add new members
    const membersToAdd = users.filter(
      (user) => !existingMembers.includes(user)
    );
    await group.addUsers(membersToAdd);

    res.status(200).json({ success: true, msg: "Group updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteGroup = async (req, res, next) => {
  const groupId = req.params.groupId;
  console.log("came to delete group controller", groupId);

  try {
    // Find the group with messages
    const group = await Group.findByPk(groupId, {
      include: [{ model: Message, where: { groupId: groupId } }],
    });

    if (!group) {
      return res.status(404).json({ success: false, msg: "Group not found" });
    }

    // Remove all group memberships
    await group.setUsers([]);

    // Delete all associated messages
    await Message.destroy({ where: { groupId: groupId } });

    // Destroy the group
    await group.destroy();

    res.status(200).json({ success: true, msg: "Group deleted successfully" });
    console.log("group deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUserGroups,
  postGroup,
  getGroupMembers,
  updateGroup,
  deleteGroup,
};
