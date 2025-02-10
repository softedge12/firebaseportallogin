// पहले से लॉगिन यूजर की निगरानी करें
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    location.replace("index.html");
  } else {
    document.getElementById("user").innerHTML = "Hello, " + user.email;

    // हर 10 सेकंड पर एक्सपायरी डेट चेक करें
    setInterval(() => {
      checkExpiry(user);
    }, 10000); // 10 सेकंड के बाद दोबारा चेक
  }
});

function checkExpiry(user) {
  const userEmail = user.email;

  // Firebase Realtime Database से एक्सपायरी डेट चेक करें
  firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        snapshot.forEach(userData => {
          const expiryDate = new Date(userData.val().expiryDate);
          const currentDate = new Date();

          if (currentDate > expiryDate) {
            alert("Your account has expired. You will be logged out now.");
            firebase.auth().signOut().then(() => {
              location.replace("index.html");
            });
          }
        });
      } else {
        alert("User data not found in the database.");
      }
    })
    .catch(error => {
      console.error("Error checking expiry date:", error.message);
    });
}

function logout() {
  firebase.auth().signOut();
}
