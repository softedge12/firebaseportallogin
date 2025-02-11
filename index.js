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
    showSpinner(true); // Spinner दिखाएं
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
        .finally(() => showSpinner(false)); // Spinner छिपाएं
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


function checkRedirectPages(user) {
    const userEmail = user.email;
    const currentDate = new Date();

    firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
        .then(snapshot => {
            const validPages = [];
            if (snapshot.exists()) {
                snapshot.forEach(userData => {
                    const pages = userData.val().pages;

                    for (const pageKey in pages) {
                        const pageData = pages[pageKey];
                        const expiryDate = new Date(pageData.expiryDate);

                        if (expiryDate > currentDate) {
                            validPages.push(pageData.url);
                        }
                    }
                });

                if (validPages.length === 1) {
                    location.replace(validPages[0]);
                } else if (validPages.length > 1) {
                    let pageOptions = "Please select a page:\n";
                    validPages.forEach((page, index) => {
                        pageOptions += `${index + 1}. ${page}\n`;
                    });

                    const choice = prompt(pageOptions);
                    if (choice && validPages[parseInt(choice) - 1]) {
                        location.replace(validPages[parseInt(choice) - 1]);
                    } else {
                        alert("Invalid selection!");
                    }
                } else {
                    alert("All subscriptions have expired.");
                    firebase.auth().signOut().then(() => {
                        location.replace("index.html");
                    });
                }
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

