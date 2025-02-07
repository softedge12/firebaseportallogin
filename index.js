// Prevent default form submission
document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();  // फॉर्म सबमिट रोकें
    login();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user.email);  // डेटाबेस से एक्सपायरी चेक करें
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

// Expiry डेट चेक करें
function checkExpiry(email) {
    const dbRef = firebase.database().ref("users");
    dbRef.orderByChild("email").equalTo(email).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = Object.values(snapshot.val())[0];
                const expiryDate = new Date(userData.expiryDate);
                const currentDate = new Date();

                if (currentDate > expiryDate) {
                    firebase.auth().signOut(); // एक्सपायरी के बाद लॉगआउट
                    alert("Your account has expired.");
                    location.reload();
                } else {
                    location.replace("welcome.html");
                }
            } else {
                alert("User not found in database.");
            }
        })
        .catch((error) => {
            console.error(error);
        });
}
