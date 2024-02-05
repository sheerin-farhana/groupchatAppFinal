const token = localStorage.getItem("token");
const groupId = localStorage.getItem("selectedGroupId");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const sendImageBtn = document.getElementById("send-image-btn");
const imageInput = document.getElementById("fileInput");

const messageListContainer = document.getElementById("message-list");
new SimpleBar(messageListContainer);

const socket = io(window.location.origin);

socket.on(
  "new-group-message",
  ({ message, groupId, imageUrl, username, isImage }) => {
    console.log("from socket.on message", message);
    console.log("from socket.on imageUrl", imageUrl);
    console.log("from socket.on username", username);

    addMemberMessageToUi(message, username, imageUrl, isImage);
  }
);

async function sendMessages() {
  const message = messageInput.value;
  const imageUrl = imageInput.files[0];

  let sentMessage;

  if (message) {
    console.log(message);
    sentMessage = await axios.post(
      `http://localhost:3000/users/groups/${groupId}/messages`,
      {
        text: message,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
  } else {
    const formData = new FormData();
    formData.append("fileInput", imageInput.files[0]);

    sentMessage = await axios.post(
      `http://localhost:3000/users/image/${groupId}`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data", // Set content type for file upload
        },
      }
    );
  }

  socket.emit("new-group-message", {
    message: sentMessage.data.message,
    groupId: groupId,
    imageUrl: sentMessage.data.imageUrl,
    username: sentMessage.data.username,
    isImage: sentMessage.data.isImage,
  });

  addMemberMessageToUi(
    sentMessage.data.message,
    sentMessage.data.username,
    sentMessage.data.imageUrl,
    sentMessage.data.isImage
  );
}

sendMessageBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  sendMessages();
  messageInput.value = "";
});

// Add an event listener for the sendImage button
sendImageBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  sendMessages();
  imageInput.value = null;
});

document.addEventListener("DOMContentLoaded", async () => {
  var navbarToggler = document.querySelector(".navbar-toggler");
  var navbarCollapse = document.querySelector("#navbarSupportedContent");

  navbarToggler.addEventListener("click", function () {
    navbarCollapse.classList.toggle("show");
  });
  showGroupmessages(groupId);
});

async function showGroupmessages(groupid) {
  try {
    const groupUsers = await axios.get(
      `http://localhost:3000/users/groups/${groupId}/members`
    );

    const groupUsersArray = groupUsers.data.groupMembers;

    groupUsersArray.forEach((user) => {
      adduserstoUi(user.Name, user.Phone);
      console.log(user);
    });

    const groupMessages = await axios.get(
      `http://localhost:3000/users/groups/${groupId}/messages`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const groupMessagesArray = groupMessages.data.messages;

    // Update the UI with all messages in a batch
    const messageList = document.getElementById("message-list");
    const fragment = document.createDocumentFragment();

    groupMessagesArray.forEach((message) => {
      const { Text, username, imageUrl } = message;
      const newListItem = document.createElement("li");
      newListItem.classList.add("d-flex", "justify-content-between", "mb-4");

      // Create the inner content structure
      if (Text === "notext") {
        // Image message
        newListItem.innerHTML = `
          <div class="card w-100">
              <div class="card-header d-flex justify-content-between p-3">
                  <p class="fw-bold mb-0">${username}</p>
              </div>
              <div class="card-body">
                  <img src="${imageUrl}" alt="Image" class="img-fluid" />
              </div>
          </div>
        `;
      } else {
        // Text message
        newListItem.innerHTML = `
          <div class="card w-100">
              <div class="card-header d-flex justify-content-between p-3">
                  <p class="fw-bold mb-0">${username}</p>
              </div>
              <div class="card-body">
                  <p class="mb-0">
                      ${Text}
                  </p>
              </div>
          </div>
        `;
      }

      fragment.appendChild(newListItem);
    });

    messageList.appendChild(fragment);
  } catch (err) {
    console.log(err);
  }
}

function addMemberMessageToUi(message, name, imageUrl, isImage) {
  // Assuming you have a reference to the ul element with id 'message-list'
  const messageList = document.getElementById("message-list");

  // Create a new li element
  const newListItem = document.createElement("li");
  newListItem.classList.add("d-flex", "justify-content-between", "mb-4");

  console.log("from addmember message", message);
  console.log("from addmember name", name);
  console.log("from addmember imageUrl", imageUrl);
  console.log("from addmember isImage", isImage);

  // Create the inner content structure
  if (isImage) {
    // Image message
    newListItem.innerHTML = `
      <div class="card w-100">
          <div class="card-header d-flex justify-content-between p-3">
              <p class="fw-bold mb-0">${name}</p>
          </div>
          <div class="card-body">
              <img src="${imageUrl}" alt="Image" class="img-fluid" />
          </div>
      </div>
    `;
  } else {
    // Text message
    newListItem.innerHTML = `
      <div class="card w-100">
          <div class="card-header d-flex justify-content-between p-3">
              <p class="fw-bold mb-0">${name}</p>
          </div>
          <div class="card-body">
              <p class="mb-0">
                  ${message}
              </p>
          </div>
      </div>
    `;
  }

  // Append the new li element to the ul
  messageList.appendChild(newListItem);
}

function adduserstoUi(name, number) {
  // Assuming you have a reference to the ul element with id 'user-list'
  const userList = document.getElementById("user-list");

  // Create a new li element
  const newListItem = document.createElement("li");
  newListItem.classList.add("p-2", "border-bottom");
  newListItem.style.backgroundColor = "#eee";

  // Create the inner content structure
  newListItem.innerHTML = `
    <a href="#!" class="d-flex justify-content-between">
        <div class="d-flex flex-row">
            <img src="https://www.pngkey.com/png/full/115-1150152_default-profile-picture-avatar-png-green.png"
                alt="avatar"
                class="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                width="60">
            <div class="pt-1">
                <p class="fw-bold mb-0">${name}</p>
                <p>${number}</p>
            </div>
        </div>
        
    </a>
`;

  // Append the new li element to the ul
  userList.appendChild(newListItem);
}
