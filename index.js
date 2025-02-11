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
            alert("आप सफलतापूर्वक साइनअप हो गए हैं। कृपया 24 घंटे बाद लॉगिन करें।");
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

function checkRedirectPage(user) {
    const userEmail = user.email;

    firebase.database().ref("users/" + userEmail.replace(".", "_") + "/subscriptions")
        .once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const subscriptions = snapshot.val();
                const validPages = [];

                for (const key in subscriptions) {
                    const subscription = subscriptions[key];
                    const expiryDate = new Date(subscription.expiryDate);
                    const currentDate = new Date();

                    if (currentDate <= expiryDate) {
                        validPages.push({
                            page: subscription.redirectPage,
                            expiryDate: subscription.expiryDate
                        });
                    }
                }

                if (validPages.length === 1) {
                    // Directly redirect if only one valid page
                    location.replace(validPages[0].page);
                } else if (validPages.length > 1) {
                    // Show page selection
                    let pageOptions = "Select a page to continue:\n";
                    validPages.forEach((page, index) => {
                        pageOptions += `${index + 1}. ${page.page} (Expiry: ${page.expiryDate})\n`;
                    });

                    const selectedPage = prompt(pageOptions, "Enter number of page");
                    if (selectedPage && validPages[selectedPage - 1]) {
                        location.replace(validPages[selectedPage - 1].page);
                    } else {
                        alert("Invalid selection!");
                        firebase.auth().signOut();
                    }
                } else {
                    alert("No valid subscriptions found.");
                    firebase.auth().signOut();
                }
            } else {
                alert("No subscriptions found for this user.");
                firebase.auth().signOut();
            }
        })
        .catch(error => {
            console.error("Error fetching subscriptions:", error.message);
        });
}

}
