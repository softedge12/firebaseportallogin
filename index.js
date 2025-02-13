document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});

function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.toggle("d-none", !show);
}

// 🔹 LOGIN FUNCTION
function login() {
    showSpinner(true);
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            checkRedirectPage(user);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// 🔹 SIGNUP FUNCTION
function signUp() {
    showSpinner(true);
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;

    if (password.length < 6) {
        document.getElementById("signUpError").innerHTML = "पासवर्ड कम से कम 6 अंकों का होना चाहिए।";
        showSpinner(false);
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            firebase.database().ref("users/" + user.uid).set({
                email: email,
                pages: []
            });
            alert("साइनअप सफल! कृपया लॉगिन करें।");
            toggleForms();
        })
        .catch((error) => {
            document.getElementById("signUpError").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

function forgotPass() {
    const email = document.getElementById("loginEmail").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Reset link sent to your email id");
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

// 🔹 FORM TOGGLE FUNCTION
function toggleForms() {
    document.getElementById("loginForm").classList.toggle("d-none");
    document.getElementById("signupForm").classList.toggle("d-none");
    document.getElementById("formTitle").innerText =
        document.getElementById("loginForm").classList.contains("d-none") ? "Sign Up Form" : "Login Form";
}
