document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user.email); // Expiry डेट चेक करें
    }
});

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            checkExpiry(email);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function checkExpiry(email) {
    const dbRef = firebase.database().ref("users");
    dbRef.orderByChild("email").equalTo(email).once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const expiryDate = new Date(userData.expiryDate);
                const currentDate = new Date();

                if (currentDate <= expiryDate) {
                    alert("Login सफल!");
                    location.replace("welcome.html");
                } else {
                    alert("आपकी एक्सपायरी डेट समाप्त हो चुकी है।");
                    firebase.auth().signOut(); // Logout करें
                }
            });
        } else {
            alert("यूज़र डेटा नहीं मिला!");
        }
    });
}

function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function forgotPass() {
    const email = document.getElementById("email").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Reset link sent to your email id");
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}
