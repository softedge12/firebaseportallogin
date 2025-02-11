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


function checkRedirectPage(user) {
  const userEmail = user.email;

  firebase.database().ref("users").orderByChild("email").equalTo(userEmail).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const pages = [];
        snapshot.forEach(userData => {
          const redirectPage = userData.val().redirectPage;
          const expiryDate = userData.val().expiryDate;
          const currentDate = new Date();

          if (new Date(expiryDate) > currentDate) {
            pages.push({ redirectPage, expiryDate });
          }
        });

        if (pages.length === 1) {
          // Automatically redirect if only one page
          location.replace(pages[0].redirectPage);
        } else if (pages.length > 1) {
          // Show page selection if multiple subscriptions are available
          showPageSelection(pages);
        } else {
          alert("No valid subscription available.");
        }
      }
    })
    .catch(error => {
      document.getElementById("error").innerHTML = error.message;
    });
}

function showPageSelection(pages) {
  const selectionContainer = document.createElement("div");
  selectionContainer.innerHTML = "<h3>Select a Page to Visit</h3>";

  pages.forEach((page, index) => {
    const button = document.createElement("button");
    button.textContent = `Page ${index + 1} (Expiry: ${page.expiryDate})`;
    button.classList.add("btn", "btn-primary", "m-2");
    button.onclick = () => location.replace(page.redirectPage);
    selectionContainer.appendChild(button);
  });

  document.body.innerHTML = ""; // Clear existing content
  document.body.appendChild(selectionContainer);
}



