document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    login();
});

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    signup();
});

document.getElementById("switchToSignup").addEventListener("click", () => {
    document.getElementById("loginForm").classList.add("d-none");
    document.getElementById("signupForm").classList.remove("d-none");
    document.getElementById("formTitle").textContent = "Sign Up Form";
});

document.getElementById("switchToLogin").addEventListener("click", () => {
    document.getElementById("signupForm").classList.add("d-none");
    document.getElementById("loginForm").classList.remove("d-none");
    document.getElementById("formTitle").textContent = "Login Form";
});

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            checkExpiryAndRedirect(userCredential.user);
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            saveUserData(userCredential.user);
        })
        .catch(error => {
            document.getElementById("signupError").innerHTML = error.message;
        });
}

// सिर्फ Email सेव होगी, expiry और redirectPage आपको मैन्युअल भरना होगा
// सिर्फ Email सेव होगी, expiry और redirectPage आपको मैन्युअल भरना होगा
function saveUserData(user) {
    const userRef = firebase.database().ref("users/" + user.uid);
    userRef.set({
        email: user.email
    }).then(() => {
        alert("आपका साइनअप सफलतापूर्वक हो गया है, आपके भुगतान का सत्यापन होने के उपरांत आपकी लॉगिन 24 घंटे के अंदर सक्रिय हो जाएगी।");
        location.replace("index.html");
    }).catch(error => {
        console.error(error);
    });
}


// Expiry और RedirectPage चेक करना
function checkExpiryAndRedirect(user) {
    const userRef = firebase.database().ref("users/" + user.uid);
    userRef.once("value", snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const expiryDate = data.expiry ? new Date(data.expiry) : null;
            const redirectPage = data.redirectPage || "index.html";
            const currentDate = new Date();

            if (expiryDate && currentDate > expiryDate) {
                alert("Your account has expired. Please contact admin.");
                firebase.auth().signOut().then(() => {
                    location.replace("index.html");
                });
            } else {
                location.replace(redirectPage);
            }
        } else {
            alert("User data not found. Please contact admin.");
            firebase.auth().signOut().then(() => {
                location.replace("index.html");
            });
        }
    });
}

// पासवर्ड भूलने की सुविधा
function forgotPass() {
    const email = document.getElementById("email").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Reset link sent to your email id");
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}
