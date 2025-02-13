document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

// Toggle Login & Signup Forms
function toggleForm() {
    document.getElementById("loginForm").classList.toggle("d-none");
    document.getElementById("signupForm").classList.toggle("d-none");

    let title = document.getElementById("formTitle");
    title.innerText = title.innerText === "Login Form" ? "Signup Form" : "Login Form";
}

// Show spinner
function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.toggle("d-none", !show);
}

// Login Function
function login() {
    showSpinner(true);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

// Signup Function
function signUp() {
    showSpinner(true);
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (password.length < 6) {
        document.getElementById("signupError").innerText = "Password must be at least 6 characters!";
        showSpinner(false);
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("आप सफलतापूर्वक साइनअप हो गए हैं। कृपया 24 घंटे बाद लॉगिन करें।");
        })
        .catch((error) => {
            document.getElementById("signupError").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// Forgot Password
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
