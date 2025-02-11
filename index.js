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
                const userDataList = [];
                snapshot.forEach(userData => {
                    userDataList.push({
                        redirectPage: userData.val().redirectPage,
                        expiryDate: userData.val().expiryDate
                    });
                });

                if (userDataList.length > 1) {
                    showPageSelection(userDataList);
                } else if (userDataList.length === 1) {
                    location.replace(userDataList[0].redirectPage);
                } else {
                    alert("No page assigned for this user.");
                }
            }
        })
        .catch(error => {
            document.getElementById("error").innerHTML = error.message;
        });
}

// यूजर को पेज चयन के लिए ड्रॉपडाउन दिखाएं
function showPageSelection(userDataList) {
    let pageOptions = "<h3>Select Your Page:</h3><select id='pageSelect'>";
    
    userDataList.forEach((data, index) => {
        const expiryDate = new Date(data.expiryDate).toLocaleDateString();
        pageOptions += `<option value="${data.redirectPage}">Page ${index + 1} (Expiry: ${expiryDate})</option>`;
    });

    pageOptions += "</select><button onclick='redirectToPage()'>Go</button>";
    
    document.body.innerHTML = pageOptions;
}

function redirectToPage() {
    const selectedPage = document.getElementById("pageSelect").value;
    if (selectedPage) {
        location.replace(selectedPage);
    } else {
        alert("Please select a page.");
    }
}

}

