const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", function () {
  // Add an event listener to the "Create Group" button
  document
    .getElementById("createGroupBtn")
    .addEventListener("click", function () {
      // Show the modal
      var myModal = new bootstrap.Modal(
        document.getElementById("createGroupModal"),
        {
          keyboard: false,
        }
      );
      myModal.show();
    });
});

const createGroupBtn = document.getElementById("create-grp-btn");

createGroupBtn.addEventListener("click", async () => {
  try {
    const groupNameInput = document.getElementById("groupName");
    const groupName = groupNameInput.value;

    // Collect the selected users
    const selectedUsers = Array.from(
      document.querySelectorAll(".form-check-input:checked")
    ).map((checkbox) => checkbox.value);

    // Send a POST request to create a new group
    const response = await axios.post(
      "http://localhost:3000/users/groups",
      {
        name: groupName,
        users: selectedUsers,
      },
      {
        headers: {
          Authorization: "Bearer " + token, // Assuming you have a token for authorization
        },
      }
    );

    // Assuming the response contains the newly created group data
    const newGroup = response.data.group;

    // Add the new group to the UI
    addGroupToUi(newGroup.name, newGroup.id);

    // Clear the textbox
    groupNameInput.value = "";

    // Uncheck all checkboxes
    document
      .querySelectorAll(".form-check-input:checked")
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    // Manually close the modal
    const createGroupModal = document.getElementById("createGroupModal");
    createGroupModal.classList.remove("show");
    createGroupModal.style.display = "none";
    document.body.classList.remove("modal-open");
    const modalBackdrop = document.querySelector(".modal-backdrop");
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
  } catch (error) {
    console.error(error);
    alert("Error creating the group");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const users = await axios.get("http://localhost:3000/users");
    const usersArray = users.data.users;

    usersArray.forEach((user) => {
      // adduserstoUi(user.Name, user.Phone);
      adduserstogroupmodal(user);
      console.log(user);
    });

    const userId = localStorage.getItem("userid");

    const groups = await axios.get("http://localhost:3000/users/groups", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    groups.data.userGroups.forEach((group) => {
      addGroupToUi(group.name, group.id);
    });
  } catch (error) {
    console.error(error);
    alert("ERROR");
  }
});

// Function to add groups to UI
function addGroupToUi(name, groupId) {
  // Assuming you have a reference to the ul element with id 'group-list'
  const groupList = document.getElementById("group-list");

  // Create a new li element
  const newListItem = document.createElement("li");
  newListItem.classList.add("p-2", "border-bottom");
  newListItem.style.backgroundColor = "#eee";
  newListItem.dataset.groupId = groupId; // Store groupId in dataset

  // Create the inner content structure
  newListItem.innerHTML = `
    <a href="#!" class="d-flex justify-content-between">
        <div class="d-flex flex-row">
            <div class="pt-1">
                <p class="fw-bold mb-0">${name}</p>
            </div>
        </div>
        <button class="btn btn-primary btn-sm update-btn">Update Group</button>
    </a>
  `;

  // Add an event listener to the list item
  newListItem.addEventListener("click", function (event) {
    // Check if the click target is the button
    if (event.target.classList.contains("update-btn")) {
      // If the button is clicked, prevent further execution
      event.stopPropagation();
      // Handle the button click (e.g., open update modal)
      handleUpdateButtonClick(groupId);
    } else {
      // Retrieve the groupId from the dataset
      const groupId = this.dataset.groupId;
      // Store the groupId in localStorage
      localStorage.setItem("selectedGroupId", groupId);
      // Redirect the user to the Group Details Page
      window.location.href = "../Chatpage/chat.html";
    }
  });

  // Append the new li element to the ul
  groupList.appendChild(newListItem);
}

function addUsersToUpdateGroupModal(user, isGroupMember) {
  const inviteUsersList = document.getElementById("invite-users-list-update");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = user.id; // Assuming user has an 'id' property
  checkbox.id = "user-update" + user.id; // Assuming user.id is a unique identifier
  checkbox.classList.add("form-check-input");
  checkbox.checked = isGroupMember; // Check the checkbox if the user is a group member

  // Create a label element for the checkbox
  const label = document.createElement("label");
  label.classList.add("form-check-label");
  label.htmlFor = "user-update" + user.id;
  label.textContent = user.Name; // Assuming user has a 'name' property

  // Create a div to hold the checkbox and label
  const checkboxDiv = document.createElement("div");
  checkboxDiv.classList.add("form-check");

  // Append the checkbox and label to the div
  checkboxDiv.appendChild(checkbox);
  checkboxDiv.appendChild(label);

  // Append the div to the inviteUsersList
  inviteUsersList.appendChild(checkboxDiv);
}

async function updateGroupInDatabase(groupId, updatedGroupName, updatedUsers) {
  try {
    await axios.put(
      `http://localhost:3000/users/groups/${groupId}`,
      {
        name: updatedGroupName,
        users: updatedUsers,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    alert("Group updated");
  } catch (error) {
    if (error.response) {
      alert(error.response.data.msg);
      console.log(error);
    }
  }
}

async function handleUpdateButtonClick(groupId) {
  const groupNameInput = document.getElementById("updategroupName");
  const inviteUsersList = document.getElementById("invite-users-list-update");
  inviteUsersList.innerHTML = "";

  try {
    // Fetch group details including members
    const response = await axios.get(
      `http://localhost:3000/users/groups/${groupId}/members`
    );
    const groupDetails = response.data;

    // Populate group name
    groupNameInput.value = groupDetails.groupName; // Assuming the API returns groupName

    // Fetch all users
    const allUsersResponse = await axios.get("http://localhost:3000/users");
    const allUsersArray = allUsersResponse.data.users;

    // Populate users in the update group modal
    allUsersArray.forEach((user) => {
      const isGroupMember = groupDetails.groupMembers.some(
        (groupMember) => groupMember.id === user.id
      );
      addUsersToUpdateGroupModal(user, isGroupMember);
    });

    // Show the modal
    var myModal = new bootstrap.Modal(
      document.getElementById("updateGroupModal"),
      {
        keyboard: false,
      }
    );
    myModal.show();

    const updateGroupBtn = document.getElementById("update-grp-btn");
    updateGroupBtn.addEventListener("click", async () => {
      // Get the updated group name and selected users
      const updatedGroupName = groupNameInput.value;
      const updatedUsers = Array.from(
        document.querySelectorAll(".form-check-input:checked")
      ).map((checkbox) => checkbox.value);

      // Call the updateGroupInDatabase function
      await updateGroupInDatabase(groupId, updatedGroupName, updatedUsers);

      // Close the modal after updating
      myModal.hide();
      location.reload();
    });
  } catch (err) {
    console.log(err);

    alert("Error fetching group details");
  }
}

function adduserstogroupmodal(user) {
  const inviteUsersList = document.getElementById("invite-users-list");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = user.id; // Assuming user has an 'id' property
  checkbox.id = "user" + user.id; // Assuming user.id is a unique identifier
  checkbox.classList.add("form-check-input");

  // Create a label element for the checkbox
  const label = document.createElement("label");
  label.classList.add("form-check-label");
  label.htmlFor = "user" + user.id;
  label.textContent = user.Name; // Assuming user has a 'name' property

  // Create a div to hold the checkbox and label
  const checkboxDiv = document.createElement("div");
  checkboxDiv.classList.add("form-check");

  // Append the checkbox and label to the div
  checkboxDiv.appendChild(checkbox);
  checkboxDiv.appendChild(label);

  // Append the div to the inviteUsersList
  inviteUsersList.appendChild(checkboxDiv);
}
