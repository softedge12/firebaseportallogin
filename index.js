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

function checkRedirectPage(email) {
    firebase.database().ref(`users/${email}`).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                let subscriptions = userData.subscriptions;

                if (subscriptions) {
                    // Create a dropdown element
                    let dropdown = document.createElement("select");
                    dropdown.id = "subscriptionDropdown";

                    // Default option
                    let defaultOption = document.createElement("option");
                    defaultOption.text = "Select a Topic";
                    dropdown.appendChild(defaultOption);

                    // Populate dropdown
                    for (let key in subscriptions) {
                        let option = document.createElement("option");
                        option.value = subscriptions[key].redirectPage;
                        option.text = `${key} (Expiry: ${subscriptions[key].expiryDate})`;
                        dropdown.appendChild(option);
                    }

                    document.body.appendChild(dropdown);

                    // Add event listener for selection
                    dropdown.addEventListener("change", function () {
                        if (this.value) {
                            location.replace(this.value); // Redirect to selected page
                        }
                    });
                } else {
                    // Single redirect if no multiple subscriptions
                    location.replace(userData.redirectPage);
                }
            } else {
                alert("User not found or expired.");
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

}

}
