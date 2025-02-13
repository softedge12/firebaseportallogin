document.getElementById("loginForm").addEventListener("submit", (event) => event.preventDefault());
document.getElementById("signupForm").addEventListener("submit", (event) => event.preventDefault());

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});

function showSpinner(show) {
    document.getElementById("loadingSpinner")?.classList.toggle("d-none", !show);
}

function toggleForm() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const formTitle = document.getElementById("formTitle");

    if (loginForm.classList.contains("d-none")) {
        loginForm.classList.remove("d-none");
        signupForm.classList.add("d-none");
        formTitle.innerText = "Login Form";
    } else {
        loginForm.classList.add("d-none");
        signupForm.classList.remove("d-none");
        formTitle.innerText = "Sign Up Form";
    }
}

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
            document.getElementById("error").innerText = error.message;
        })
        .finally(() => showSpinner(false));
}

function signUp() {
    showSpinner(true);
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userRef = firebase.database().ref("users").push();

            userRef.set({
                email: email,
                expiry: "", // Admin द्वारा सेट किया जाएगा
                redirectPage: "" // Admin द्वारा सेट किया जाएगा
            }).then(() => {
                alert("आपका अकाउंट सफलतापूर्वक बनाया गया! लॉगिन की अनुमति बाद में दी जाएगी।");
            });

        })
        .catch((error) => {
            document.getElementById("signupError").innerText = error.message;
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
            document.getElementById("error").innerText = error.message;
        });
}
