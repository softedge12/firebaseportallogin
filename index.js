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

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const redirectOptions = [];
                snapshot.forEach(userData => {
                    const redirectPage = userData.val().redirectPage;
                    const expiryDate = new Date(userData.val().expiryDate);
                    const currentDate = new Date();

                    if (currentDate <= expiryDate) {
                        redirectOptions.push(redirectPage);
                    }
                });

                if (redirectOptions.length > 1) {
                    showRedirectSelection(redirectOptions);
                } else if (redirectOptions.length === 1) {
                    location.replace(redirectOptions[0]);
                } else {
                    alert("कोई भी सक्रिय पेज उपलब्ध नहीं है।");
                }
            } else {
                alert("कोई डेटा उपलब्ध नहीं है।");
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

function showRedirectSelection(redirectOptions) {
    const container = document.createElement('div');
    container.innerHTML = `
        <h2>कृपया अपना वेब पेज चुनें:</h2>
        <select id="redirectPageSelect">
            ${redirectOptions.map(page => `<option value="${page}">${page}</option>`).join('')}
        </select>
        <button onclick="redirectToPage()">Go</button>
    `;
    document.body.innerHTML = '';
    document.body.appendChild(container);
}

function redirectToPage() {
    const selectedPage = document.getElementById('redirectPageSelect').value;
    location.replace(selectedPage);
}
