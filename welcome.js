firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        location.replace("index.html");
    } else {
        document.getElementById("user").innerHTML = "Hello, " + user.email;
        monitorExpiry(user);
    }
});

function logout() {
    firebase.auth().signOut();
}

function monitorExpiry(user) {
    const userEmail = user.email;

    // Real-time listener for expiry date
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.on("value", (snapshot) => {
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
    }, (error) => {
        console.error("Error monitoring expiry:", error.message);
    });
}
