firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        location.replace("index.html");
    } else {
        document.getElementById("user").innerHTML = "Hello, " + user.email;
        startExpiryCheck(user);
    }
});

function logout() {
    firebase.auth().signOut();
}

function startExpiryCheck(user) {
    const userEmail = user.email;

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const expiryDate = new Date(userData.val().expiryDate);

                    // Periodically check expiry every minute
                    setInterval(() => {
                        const currentDate = new Date();
                        if (currentDate > expiryDate) {
                            alert("Your account has expired. Please contact support.");
                            firebase.auth().signOut().then(() => {
                                location.replace("index.html");
                            });
                        }
                    }, 60000); // 60000 ms = 1 minute
                });
            }
        })
        .catch(error => {
            console.error("Error checking expiry:", error.message);
        });
}
