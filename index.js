document.addEventListener("DOMContentLoaded", function () {
    // DOM elements
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const switchToSignup = document.getElementById("switchToSignup");
    const switchToLogin = document.getElementById("switchToLogin");

    // Default: Show Login Form, Hide Signup Form
    signupForm.style.display = "none";

    // Switch to Signup Form
    switchToSignup.addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    // Switch to Login Form
    switchToLogin.addEventListener("click", function () {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });
});

// Show/Hide Spinner
function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.toggle("d-none", !show);
}

// 🔹 LOGIN FUNCTION
function login() {
    showSpinner(true);
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            checkUserData(user);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// 🔹 SIGNUP FUNCTION
function signUp() {
    showSpinner(true);
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            saveUserData(user.email);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// 🔹 SAVE USER DATA IN FIREBASE (Signup के बाद)
function saveUserData(email) {
    const usersRef = firebase.database().ref("users");
    
    // नया यूज़र डेटा ऐड करें (Expiry और Redirect Page मैन्युअली एडमिन डालेगा)
    usersRef.push({
        email: email,
        expiryDate: "", // एडमिन बाद में डालेगा
        redirectPage: "" // एडमिन बाद में डालेगा
    }).then(() => {
        alert("आप सफलतापूर्वक साइनअप हो गए हैं। कृपया 24 घंटे बाद लॉगिन करें।");
        firebase.auth().signOut();
    }).catch((error) => {
        console.error("Error saving user data:", error);
    });
}

// 🔹 CHECK USER DATA ON LOGIN
function checkUserData(user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(userData => {
                const expiryDate = new Date(userData.val().expiryDate);
                const currentDate = new Date();
                const redirectPage = userData.val().redirectPage;

                if (!expiryDate || !redirectPage) {
                    alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।");
                    firebase.auth().signOut();
                    return;
                }

                if (currentDate > expiryDate) {
                    alert("आपकी सदस्यता समाप्त हो गई है।");
                    firebase.auth().signOut();
                    return;
                }

                window.location.href = redirectPage;
            });
        } else {
            alert("User data not found.");
            firebase.auth().signOut();
        }
    }).catch((error) => {
        document.getElementById("error").innerHTML = error.message;
    });
}

// 🔹 FORGOT PASSWORD FUNCTION
function forgotPass() {
    const email = document.getElementById("login-email").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Reset link sent to your email id");
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}
