const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const loginBtn = document.querySelector("#login-btn");
const forgotPasswordBtn = document.getElementById("forgot-password-button");

function successalert(msg) {
  const alertDiv = document.getElementById("success-alert");
  alertDiv.classList.remove("d-none");
  alertDiv.innerText = msg;
  setTimeout(() => {
    alertDiv.classList.add("d-none");
  }, 4000);
}

function failurealert(msg) {
  const errorAlertDiv = document.getElementById("failure-alert");
  errorAlertDiv.classList.remove("d-none");
  errorAlertDiv.innerText = msg;
  setTimeout(() => {
    errorAlertDiv.classList.add("d-none");
  }, 2000);
}

forgotPasswordBtn.addEventListener("click", async () => {
  const forgotPasswordModal = new bootstrap.Modal(
    document.getElementById("forgot-password-modal")
  );
  forgotPasswordModal.show();

  const emailId = document.getElementById("forgot_pass_email");
  const saveChangesBtn = document.getElementById("save-changes");

  saveChangesBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // modal.hide();
    try {
      const emailData = await axios.post(
        "http://localhost:3000/password/forgotPassword",
        { email: emailId.value }
      );
      console.log(emailData); //
      successalert("Reset password email sent");

      // alert("reset password email Sent");
    } catch (error) {
      if (error.response) {
        failurealert(error.response.data.msg);
        console.log(error);
      }
    }
  });
});

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  const loginData = {
    email: email,
    password: password,
  };

  if (email === "" || password === "") {
    failurealert("Enter all fields");
    // alert("Enter all fields");
  } else {
    try {
      const userDetails = await axios.post(
        "http://localhost:3000/users/login",
        loginData
      );

      const userId = userDetails.data.userId;
      localStorage.setItem("userId", userId);

      if (userDetails.data.success) {
        successalert(userDetails.data.message);
        localStorage.setItem("token", userDetails.data.token);
        window.location.href = "../ChatHomepage/home.html";
      } else {
        failurealert(userDetails.data.message);
        // alert();
      }
    } catch (err) {
      if (err.response) {
        failurealert(err.response.data.msg);
        console.log(err);
      }
    }
  }
});
