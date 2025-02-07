document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
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
    
    // डेटाबेस से मेल आईडी के आधार पर यूजर डेटा लाना
    dbRef.orderByChild("email").equalTo(email).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    const expiryDate = new Date(userData.expiryDate);
                    const currentDate = new Date();

                    if (currentDate <= expiryDate) {
                        // एक्सपायरी डेट सही है, लॉगिन सफल
                        alert("Login सफल!");
                        location.replace("welcome.html");
                    } else {
                        // एक्सपायरी डेट समाप्त हो चुकी है
                        alert("आपकी एक्सपायरी डेट समाप्त हो चुकी है।");
                        firebase.auth().signOut(); // Logout करें
                    }
                });
            } else {
                alert("यूज़र डेटा नहीं मिला!");
                firebase.auth().signOut();
            }
        })
        .catch((error) => {
            console.error("डेटाबेस पढ़ने में समस्या: ", error);
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
