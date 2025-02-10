firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        location.replace("index.html");
    } else {
        document.getElementById("user").innerHTML = "Hello, " + user.email;
        checkExpiryAndMonitor(user);
    }
});

function logout() {
    firebase.auth().signOut();
}

function checkExpiryAndMonitor(user) {
    const userEmail = user.email;

    // Fetch expiry date from the database
    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const expiryDate = new Date(userData.val().expiryDate);

                    // Immediate check in case already expired
                    checkAndLogoutIfExpired(expiryDate);

                    // Set interval to check expiry every 30 seconds
                    setInterval(() => {
                        checkAndLogoutIfExpired(expiryDate);
                    }, 30000); // 30 seconds
                });
            }
        })
        .catch(error => {
            console.error("Error checking expiry:", error.message);
        });
}

function checkAndLogoutIfExpired(expiryDate) {
    const currentDate = new Date();
    if (currentDate > expiryDate) {
        alert("Your account has expired. Please contact support.");
        firebase.auth().signOut().then(() => {
            location.replace("index.html");
        });
    }
}
