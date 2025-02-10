firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    checkExpiry(user);
    monitorExpiry(user);
  } else {
    // अगर यूज़र लॉगिन नहीं है तो लॉगिन पेज पर भेजें
    location.replace("index.html");
  }
});

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

function monitorExpiry(user) {
  setInterval(() => {
    checkExpiry(user);
  }, 60000); // हर 60 सेकंड में चेक करें
}
