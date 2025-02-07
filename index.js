document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
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

function checkExpiry(user) {
    const userEmail = user.email;
    
    // डेटाबेस से यूजर डेटा निकालने के लिए क्वेरी
    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const expiryDate = new Date(userData.val().expiryDate);
                    const currentDate = new Date();

                    if (currentDate > expiryDate) {
                        alert("Your account has expired. Please contact support.");
                        firebase.auth().signOut();
                    } else {
                        location.replace("welcome.html");
                    }
                });
            } else {
                alert("User not found in the database.");
                firebase.auth().signOut();
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}
