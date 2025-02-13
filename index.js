document.getElementById("loginForm").addEventListener("submit", (event) => event.preventDefault());
document.getElementById("signupForm").addEventListener("submit", (event) => event.preventDefault());

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});

// फॉर्म टॉगल करने का फ़ंक्शन
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

// स्पिनर दिखाने का फ़ंक्शन
function showSpinner(show) {
    document.getElementById("loadingSpinner").classList.toggle("d-none", !show);
}

// **लॉगिन फ़ंक्शन**
function login(event) {
    event.preventDefault();
    showSpinner(true);

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            checkRedirectPage(userCredential.user);
        })
        .catch((error) => {
            document.getElementById("error").innerText = error.message;
        })
        .finally(() => showSpinner(false));
}

// **साइनअप फ़ंक्शन**
function signUp(event) {
    event.preventDefault();
    showSpinner(true);

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            firebase.database().ref("users/" + user.uid).set({
                email: email,
                expiry: "",  // एडमिन द्वारा सेट किया जाएगा
                redirectPage: "" // एडमिन द्वारा सेट किया जाएगा
            });

            alert("आप सफलतापूर्वक साइनअप हो गए हैं। कृपया 24 घंटे बाद लॉगिन करें।");
        })
        .catch((error) => {
            document.getElementById("signupError").innerText = error.message;
        })
        .finally(() => showSpinner(false));
}

// **पासवर्ड भूलने पर ईमेल भेजने का फ़ंक्शन**
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

// **एक्सपायरी डेट और रीडायरेक्शन चेक करने का फ़ंक्शन**
function checkExpiry(user) {
    firebase.database().ref("users/" + user.uid).once("value")
        .then(snapshot => {
            if (snapshot.exists() && snapshot.val().expiry && snapshot.val().redirectPage) {
                const expiryDate = new Date(snapshot.val().expiry);
                const currentDate = new Date();

                if (currentDate > expiryDate) {
                    alert("Your account has expired. You will be logged out.");
                    firebase.auth().signOut().then(() => location.replace("index.html"));
                } else {
                    window.location.href = snapshot.val().redirectPage;
                }
            } else {
                alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।");
                firebase.auth().signOut().then(() => location.replace("index.html"));
            }
        });
}
