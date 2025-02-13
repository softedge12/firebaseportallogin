// Initialize Firebase
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  login();
});

document.getElementById("switchToSignup").addEventListener("click", () => {
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("signupForm").classList.remove("d-none");
  document.getElementById("formTitle").textContent = "Sign Up Form";
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      checkExpiry(userCredential.user);
    })
    .catch(error => {
      document.getElementById("error").innerHTML = error.message;
    });
}

function checkExpiry(user) {
  const userEmail = user.email;
  const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

  userRef.once("value", snapshot => {
    if (snapshot.exists()) {
      snapshot.forEach(userData => {
        const expiryDate = new Date(userData.val().expiryDate);
        const currentDate = new Date();

        if (currentDate > expiryDate) {
          alert("Your account has expired. You will be logged out.");
          firebase.auth().signOut().then(() => {
            location.replace("index.html");
          });
        }
      });
    } else {
      alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।");
      firebase.auth().signOut().then(() => {
        location.replace("index.html");
      });
    }
  });
}

function forgotPass() {
  const email = document.getElementById("email").value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Reset link sent to your email id");
    })
    .catch(error => {
      document.getElementById("error").innerHTML = error.message;
    });
}
