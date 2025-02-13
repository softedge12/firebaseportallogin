document.getElementById("authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const isLogin = document.getElementById("authButton").innerText === "Login";
    isLogin ? login() : signUp();
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
        .then((userCredential) => {
            checkRedirectPage(userCredential.user);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            firebase.database().ref("users/" + user.uid).set({
                email: user.email,
                expiryDate: "", 
                redirectPage: "" 
            }).then(() => {
                alert("Sign-up successful! Admin approval needed to login.");
                firebase.auth().signOut();
            });
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function forgotPass() {
    const email = document.getElementById("email").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("Reset link sent to your email"))
        .catch((error) => document.getElementById("error").innerHTML = error.message);
}

function checkExpiry(user) {
    firebase.database().ref("users/" + user.uid).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (!userData.expiryDate) {
                    alert("Admin approval required.");
                    firebase.auth().signOut();
                } else {
                    const expiryDate = new Date(userData.expiryDate);
                    if (new Date() > expiryDate) {
                        alert("Your account has expired.");
                        firebase.auth().signOut();
                    }
                }
            } else {
                alert("No record found.");
                firebase.auth().signOut();
            }
        });
}

function checkRedirectPage(user) {
    firebase.database().ref("users/" + user.uid).once("value")
        .then(snapshot => {
            if (snapshot.exists() && snapshot.val().redirectPage) {
                window.location.href = snapshot.val().redirectPage;
            } else {
                alert("No active pages available.");
                firebase.auth().signOut();
            }
        });
}

function toggleForm() {
    const formTitle = document.getElementById("formTitle");
    const authButton = document.getElementById("authButton");
    const toggleButton = document.querySelector("button[onclick='toggleForm()']");

    if (authButton.innerText === "Login") {
        formTitle.innerText = "Sign Up Form";
        authButton.innerText = "Sign Up";
        toggleButton.innerText = "Already have an account? Login";
    } else {
        formTitle.innerText = "Login Form";
        authButton.innerText = "Login";
        toggleButton.innerText = "Create an account";
    }
}
