firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    location.replace("index.html");
  } else {
    document.getElementById("user").innerHTML = "Hello, " + user.email;

    // एक्सपायरी चेक हर 5 सेकंड में
    const checkExpiryInterval = setInterval(() => {
      checkExpiry(user, checkExpiryInterval);
    }, 5000); // 5 सेकंड चेक इंटरवल
  }
});

function checkExpiry(user, interval) {
  const userEmail = user.email.replace(/\./g, "_"); // Firebase key issue fix

  firebase.database().ref("users/" + userEmail).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const expiryDate = new Date(userData.expiryDate);
        const currentDate = new Date();

        if (currentDate > expiryDate) {
          alert("Your account has expired. You will be logged out now.");
          clearInterval(interval); // इंटरवल बंद करें
          firebase.auth().signOut().then(() => {
            location.replace("index.html");
          });
        }
      } else {
        console.error("User not found in the database.");
      }
    })
    .catch(error => {
      console.error("Error checking expiry date:", error.message);
    });
}

function logout() {
  firebase.auth().signOut();
}
