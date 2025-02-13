document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
});

// लॉगिन और साइनअप फॉर्म टॉगल करने का फ़ंक्शन
function toggleForm() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const formTitle = document.getElementById("formTitle");

    if (loginForm.classList.contains("d-none")) {
        loginForm.classList.remove("d-none");
        signupForm.classList.add("d-none");
        formTitle.innerText = "Login Form";
    } else {
        signupForm.classList.remove("d-none");
        loginForm.classList.add("d-none");
        formTitle.innerText = "Sign Up Form";
    }
}

// Firebase ऑथेंटिकेशन स्टेटस चेक करना
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});

// स्पिनर दिखाने का फ़ंक्शन
function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.toggle("d-none", !show);
}

// लॉगिन फ़ंक्शन
function login() {
    showSpinner(true);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            checkRedirectPage(userCredential.user);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// साइनअप फ़ंक्शन
function signUp() {
    showSpinner(true);
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            saveUserToDatabase(user);
        })
        .catch((error) => {
            document.getElementById("signupError").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// साइनअप के बाद यूजर का ईमेल डेटाबेस में सेव करना
function saveUserToDatabase(user) {
    const userRef = firebase.database().ref("users").push();
    userRef.set({
        email: user.email,
        expiryDate: null,  // एक्सपायरी एडमिन सेट करेगा
        redirectPage: null // एडमिन द्वारा सेट किया जाएगा
    }).then(() => {
        alert("आप सफलतापूर्वक साइनअप हो गए हैं। कृपया 24 घंटे बाद लॉगिन करें।");
        firebase.auth().signOut();
        toggleForm();
    }).catch((error) => {
        console.error("Error saving user to database:", error);
    });
}

// एक्सपायरी डेट चेक करने का फ़ंक्शन
function checkExpiry(user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(userData => {
                if (!userData.val().expiryDate) {
                    alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।");
                    firebase.auth().signOut();
                }
            });
        } else {
            alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है।");
            firebase.auth().signOut();
        }
    });
}

// रीडायरेक्शन चेक करने का फ़ंक्शन
function checkRedirectPage(user) {
    firebase.database().ref("users").orderByChild("email").equalTo(user.email).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    if (userData.val().redirectPage) {
                        window.location.href = userData.val().redirectPage;
                    } else {
                        alert("आपके लिए कोई पेज निर्धारित नहीं है।");
                    }
                });
            } else {
                alert("User not found.");
            }
        });
}
