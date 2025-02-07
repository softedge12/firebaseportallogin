document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users");

    userRef.orderByChild("email").equalTo(userEmail).once("value", (snapshot) => {
      if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];
        const expiryDate = new Date(userData.expiryDate);
        const currentDate = new Date();

        if (currentDate <= expiryDate) {
          location.replace("welcome.html");
        } else {
          alert("Your account has expired.");
          firebase.auth().signOut();
        }
      } else {
        alert("User data not found in database.");
        firebase.auth().signOut();
      }
    });
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch((error) => {
      document.getElementById("error").innerHTML = error.message;
    });
}
