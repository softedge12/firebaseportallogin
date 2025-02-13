document.getElementById("authForm").addEventListener("submit", handleAuth);
let isLogin = true; 

// 🔄 लॉगिन और साइनअप टॉगल करने की सुविधा
function toggleForm() {
    isLogin = !isLogin;
    document.getElementById("formTitle").innerText = isLogin ? "Login Form" : "Sign Up Form";
    document.getElementById("toggleText").innerText = isLogin ? "Sign Up" : "Login";
}

// ⏳ स्पिनर दिखाने और छिपाने की सुविधा
function showSpinner(show) {
    document.getElementById("loadingSpinner").classList.toggle("d-none", !show);
}

// 🟢 लॉगिन या साइनअप हैंडल करने की प्रक्रिया
function handleAuth(event) {
    event.preventDefault();
    showSpinner(true);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (password.length < 6) {
        document.getElementById("error").innerText = "Password must be at least 6 characters long.";
        showSpinner(false);
        return;
    }

    if (isLogin) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => checkRedirectPage(userCredential.user))
            .catch((error) => document.getElementById("error").innerText = error.message)
            .finally(() => showSpinner(false));
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => alert("सफलतापूर्वक साइनअप हो गया, कृपया लॉगिन करें।"))
            .catch((error) => document.getElementById("error").innerText = error.message)
            .finally(() => showSpinner(false));
    }
}

// 🔵 पासवर्ड भूल जाने पर रिसेट लिंक भेजना
function forgotPass() {
    const email = document.getElementById("email").value;

    if (!email) {
        alert("कृपया पहले अपना ईमेल दर्ज करें।");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("Reset link sent to your email id"))
        .catch((error) => document.getElementById("error").innerText = error.message);
}

// 🛑 एक्सपायरी चेक करना
function checkExpiry(user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(userData => {
                const expiryDate = new Date(userData.val().expiryDate);
                const currentDate = new Date();

                if (currentDate > expiryDate) {
                    alert("Your account has expired. You will be logged out.");
                    firebase.auth().signOut().then(() => {
                        location.replace("index.html");
                    });
                }
            });
        } else {
            alert("आपकी लॉगिन सुविधा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।");
            firebase.auth().signOut().then(() => {
                location.replace("index.html");
            });
        }
    });
}

// 🔄 यूजर को सही वेब पेज पर रीडायरेक्ट करना
function checkRedirectPage(user) {
    const userEmail = user.email;

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                let redirectPage = "";
                snapshot.forEach(userData => {
                    redirectPage = userData.val().redirectPage;
                });

                if (redirectPage) {
                    window.location.href = redirectPage;
                } else {
                    alert("No valid redirect page found.");
                }
            } else {
                alert("User not found.");
            }
        })
        .catch(error => {
            document.getElementById("error").innerText = error.message;
        });
}
