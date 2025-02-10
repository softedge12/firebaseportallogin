// Firebase Auth state listener
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("email-id").textContent = user.email;
    checkExpiry(user);
    monitorExpiry(user);
  } else {
    location.replace("index.html");
  }
});

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    location.replace("index.html");
  });
}

// Check for account expiry
function checkExpiry(user) {
  const userEmail = user.email;

  firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        snapshot.forEach(userData => {
          const expiryDate = new Date(userData.val().expiryDate);
          const currentDate = new Date();

          if (currentDate > expiryDate) {
            alert("Your account has expired. Logging out.");
            firebase.auth().signOut().then(() => {
              location.replace("index.html");
            });
          }
        });
      } else {
        alert("User not found in the database.");
        firebase.auth().signOut().then(() => {
          location.replace("index.html");
        });
      }
    })
    .catch(error => {
      console.error("Error checking expiry:", error.message);
    });
}

// Periodic expiry check
function monitorExpiry(user) {
  setInterval(() => {
    checkExpiry(user);
  }, 60000); // Check every 60 seconds
}
