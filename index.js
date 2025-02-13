document.getElementById("loginForm").addEventListener("submit", (event) => {
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

function signUp() {
    showSpinner(true);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userId = user.uid; // Firebase Auth से यूजर ID प्राप्त करें

            // डेटाबेस में यूजर की ईमेल सेव करें (expiry और redirectPage एडमिन द्वारा मैन्युअल रूप से भरी जाएगी)
            firebase.database().ref("users/" + userId).set({
                email: email
            }).then(() => {
                alert("आप सफलतापूर्वक साइनअप हो गए हैं। आपके भुगतान का सत्यापन होने के बाद, आपकी लॉगिन 24 घंटे के अंदर सक्रिय हो जाएगी।");

                // साइनअप के तुरंत बाद लॉगआउट करें
                firebase.auth().signOut().then(() => {
                    console.log("User logged out after signup.");
                }).catch((error) => {
                    console.error("Error logging out:", error);
                });
            }).catch((error) => {
                console.error("Error saving user data:", error);
            });
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
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

function checkExpiry(user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(userData => {
                const expiryDate = new Date(userData.val().expiry);
                const currentDate = new Date();

                if (currentDate > expiryDate) {
                    alert("आपकी लॉगिन वैधता समाप्त हो चुकी है। कृपया व्यवस्थापक से संपर्क करें।");
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

function checkRedirectPage(user) {
    const userEmail = user.email;

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const expiryDate = new Date(userData.val().expiry);
                    const currentDate = new Date();

                    if (currentDate <= expiryDate) {
                        const redirectPage = userData.val().redirectPage;
                        window.location.href = redirectPage;
                    } else {
                        alert("आपका अकाउंट एक्सपायर हो चुका है।");
                        firebase.auth().signOut();
                    }
                });
            } else {
                alert("User not found.");
                firebase.auth().signOut();
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}
