firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        location.replace("index.html");
    } else {
        document.getElementById("user").innerHTML = "Hello, " + user.email;
        checkExpiry(user); // पहली बार चेक
        startExpiryCheckInterval(user); // नियमित अंतराल पर चेक
    }
});

function logout() {
    firebase.auth().signOut();
}

// पहला चेक जब पेज लोड होता है
function checkExpiry(user) {
    const userEmail = user.email;

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const expiryDate = new Date(userData.val().expiryDate);
                    const currentDate = new Date();

                    if (currentDate > expiryDate) {
                        alert("Your account has expired. Please contact support.");
                        firebase.auth().signOut().then(() => {
                            location.replace("index.html");
                        });
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error checking expiry:", error.message);
        });
}

// नियमित रूप से expiry डेट चेक करना
function startExpiryCheckInterval(user) {
    setInterval(() => {
        checkExpiry(user);
    }, 60000); // हर 1 मिनट पर चेक करेगा (60000ms)
}
