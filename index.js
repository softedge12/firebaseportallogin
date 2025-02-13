document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    login();
});

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    signUp();
});

// 🔄 Form टॉगल करने की सुविधा
function toggleForms() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const formTitle = document.getElementById("formTitle");

    loginForm.classList.toggle("d-none");
    signupForm.classList.toggle("d-none");

    formTitle.innerText = loginForm.classList.contains("d-none") ? "Sign Up Form" : "Login Form";
}

function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.toggle("d-none", !show);
}

// 🔐 Login Function
function login() {
    showSpinner(true);
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (password.length < 6) {
        document.getElementById("error").innerHTML = "Password must be at least 6 characters long.";
        showSpinner(false);
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            checkExpiry(userCredential.user);
        })
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// 🆕 SignUp Function (सिर्फ email स्टोर होगी)
function signUp() {
    showSpinner(true);
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (password.length < 6) {
        document.getElementById("errorSignup").innerHTML = "Password must be at least 6 characters long.";
        showSpinner(false);
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const userId = userCredential.user.uid;
            firebase.database().ref("users/" + userId).set({
                email: email  // सिर्फ email स्टोर होगी, बाकी आप खुद डाल सकते हैं।
            });
            alert("Signup successful! Please log in.");
            toggleForms();
        })
        .catch((error) => {
            document.getElementById("errorSignup").innerHTML = error.message;
        })
        .finally(() => showSpinner(false));
}

// 🔍 Forgot Password
function forgotPass() {
    const email = document.getElementById("loginEmail").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => alert("Reset link sent to your email id"))
        .catch((error) => {
            document.getElementById("error").innerHTML = error.message;
        });
}

// 🔄 Expiry Check और Redirect Page सिस्टम
function checkExpiry(user) {
    const userEmail = user.email;
    const userRef = firebase.database().ref("users").orderByChild("email").equalTo(userEmail);

    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(userData => {
                if (userData.val().expiryDate) {
                    const expiryDate = new Date(userData.val().expiryDate);
                    const currentDate = new Date();

                    if (currentDate > expiryDate) {
                        alert("Your account has expired. You will be logged out.");
                        firebase.auth().signOut().then(() => {
                            location.replace("index.html");
                        });
                        return;
                    }
                }
                checkRedirectPage(user);
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
                const pages = [];
                snapshot.forEach(userData => {
                    if (userData.val().pages) {
                        userData.val().pages.forEach(page => {
                            if (page.expiryDate) {
                                const expiryDate = new Date(page.expiryDate);
                                const currentDate = new Date();

                                if (currentDate <= expiryDate) {
                                    pages.push(page.redirectPage);
                                }
                            } else {
                                pages.push(page.redirectPage);
                            }
                        });
                    }
                });

                if (pages.length > 0) {
                    showPageSelection(pages);
                } else {
                    alert("No active pages available.");
                }
            } else {
                alert("User not found.");
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

// ✅ Redirect Page Selection Modal
function showPageSelection(pages) {
    const pageList = document.getElementById("pageList");
    pageList.innerHTML = "";

    pages.forEach(page => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        listItem.innerHTML = `
          <span>${page}</span>
          <button class="btn btn-primary btn-sm" onclick="window.location.href='${page}'">Go</button>
        `;
        pageList.appendChild(listItem);
    });

    const modal = new mdb.Modal(document.getElementById('pageSelectionModal'));
    modal.show();
}

// 🔄 ऑथ स्टेट चेक करें
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        checkExpiry(user);
    }
});
