// =========================
// HELPERS
// =========================

// get element by id
function r_e(id) {
  return document.querySelector(`#${id}`);
}

// show / hide message bar
function configure_message_bar(msg) {
  let bar = r_e("message_bar");
  if (!bar) return;

  bar.classList.remove("is-hidden");
  bar.innerHTML = msg;

  setTimeout(() => {
    bar.classList.add("is-hidden");
  }, 3000);
}

// show / hide nav items based on auth
function configure_nav_bar(email) {
  // elements visible only when signed IN
  document.querySelectorAll(".signedin").forEach((el) => {
    if (email) el.classList.remove("is-hidden");
    else el.classList.add("is-hidden");
  });

  // elements visible only when signed OUT
  document.querySelectorAll(".signedout").forEach((el) => {
    if (email) el.classList.add("is-hidden");
    else el.classList.remove("is-hidden");
  });
}

// =========================
// AUTH: SIGN IN / SIGN UP / SIGN OUT
// =========================

// SIGN IN
if (r_e("signin_form")) {
  r_e("signin_form").addEventListener("submit", (e) => {
    e.preventDefault();

    let email = r_e("email_").value;
    let pass = r_e("password_").value;

    auth
      .signInWithEmailAndPassword(email, pass)
      .then(() => {
        r_e("signin_form").reset();

        // close sign-in modal
        let signinModal = document.querySelector("#sign-in-modal");
        if (signinModal) {
          signinModal.classList.remove("is-active");
        }

        configure_message_bar("Signed in successfully.");
      })
      .catch((err) => {
        console.log(err);
        configure_message_bar("Invalid login credentials.");
      });
  });
}

// SIGN UP
if (r_e("signup_form")) {
  r_e("signup_form").addEventListener("submit", (e) => {
    e.preventDefault();

    let name = r_e("name").value;
    let email = r_e("email").value;
    let pass = r_e("password").value;

    auth
      .createUserWithEmailAndPassword(email, pass)
      .then((cred) => {
        // create user profile document
        return db.collection("users").doc(cred.user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        r_e("signup_form").reset();

        // close sign-up modal
        let signupModal = document.querySelector("#sign-up-modal");
        if (signupModal) {
          signupModal.classList.remove("is-active");
        }

        configure_message_bar("Account created. You can now sign in.");
      })
      .catch((err) => {
        console.log(err);
        configure_message_bar("Could not create account. Try again.");
      });
  });
}

// SIGN OUT
if (r_e("signoutbtn")) {
  r_e("signoutbtn").addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      configure_message_bar("Signed out.");
    });
  });
}

// =========================
// AUTH STATE LISTENER
// =========================

auth.onAuthStateChanged((user) => {
  if (user) {
    // show the user email in the navbar
    if (r_e("user_email")) {
      r_e("user_email").innerHTML = user.email;
    }

    configure_nav_bar(user.email);

    // hide placeholders
    if (r_e("leaderboard_placeholder")) {
      r_e("leaderboard_placeholder").classList.add("is-hidden");
    }
    if (r_e("players_placeholder")) {
      r_e("players_placeholder").classList.add("is-hidden");
    }

    // show real content
    if (r_e("leaderboard_table")) {
      r_e("leaderboard_table").classList.remove("is-hidden");
    }
    if (r_e("active_players_list")) {
      r_e("active_players_list").classList.remove("is-hidden");
    }

    // load Firestore data that requires a signed-in user
    load_scores();
    load_players();

    configure_message_bar("Welcome " + user.email);
  } else {
    // clear user email display
    if (r_e("user_email")) {
      r_e("user_email").innerHTML = "";
    }

    configure_nav_bar();
    configure_message_bar("Please sign in to see full content");

    // show placeholders
    if (r_e("leaderboard_placeholder")) {
      r_e("leaderboard_placeholder").classList.remove("is-hidden");
    }
    if (r_e("players_placeholder")) {
      r_e("players_placeholder").classList.remove("is-hidden");
    }

    // hide real content
    if (r_e("leaderboard_table")) {
      r_e("leaderboard_table").classList.add("is-hidden");
    }
    if (r_e("active_players_list")) {
      r_e("active_players_list").classList.add("is-hidden");
    }

    // optional: clear data from DOM when logged out
    if (r_e("leaderboard_body")) {
      r_e("leaderboard_body").innerHTML = "";
    }
    if (r_e("active_players_list")) {
      r_e("active_players_list").innerHTML = "";
    }
  }
});

// =========================
// LEADERBOARD FUNCTIONS
// =========================

// READ SCORES
function load_scores() {
  let tbody = r_e("leaderboard_body");
  if (!tbody) return;

  db.collection("scores")
    .orderBy("score", "asc") // lowest score is best
    .limit(10)
    .get()
    .then((snap) => {
      let html = "";
      let rank = 1;

      snap.forEach((doc) => {
        let s = doc.data();
        html += `
          <tr>
            <td class="has-text-black">${rank}</td>
            <td class="has-text-black">${s.player}</td>
            <td class="has-text-black">${s.course}</td>
            <td class="has-text-black">${s.score}</td>
          </tr>
        `;
        rank++;
      });

      tbody.innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
      configure_message_bar("Could not load scores.");
    });
}

// SUBMIT SCORE (CREATE)
let scoreForm = r_e("submitScoreForm");

if (scoreForm) {
  scoreForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      configure_message_bar("You must be signed in to submit a score.");
      return;
    }

    let player = r_e("score_player").value.trim();
    let course = r_e("score_course").value.trim();
    let score = Number(r_e("score_value").value);

    if (!player || !course || !score) {
      configure_message_bar("Please fill in all score fields.");
      return;
    }

    let newScore = {
      player: player,
      course: course,
      score: score,
      user: auth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    db.collection("scores")
      .add(newScore)
      .then(() => {
        configure_message_bar("Score submitted!");
        scoreForm.reset();
        load_scores(); // refresh the table
      })
      .catch((err) => {
        console.log(err);
        configure_message_bar("Error submitting score.");
      });
  });
}

// =========================
// PLAYERS FUNCTIONS
// =========================

// READ ACTIVE PLAYERS
function load_players() {
  let list = r_e("active_players_list");
  if (!list) return;

  db.collection("players")
    .orderBy("createdAt", "desc")
    .get()
    .then((snap) => {
      let html = "";
      snap.forEach((doc) => {
        let p = doc.data();
        html += `
          <li>
            ${p.name} — Handicap ${p.handicap} —
            <a href="mailto:${p.email}">Contact</a>
          </li>
        `;
      });
      list.innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
      configure_message_bar("Could not load active players.");
    });
}

// POST YOUR INFO (CREATE)
let postInfoForm = r_e("postinfo_form");

if (postInfoForm) {
  postInfoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      configure_message_bar("You must be signed in to post your info.");
      return;
    }

    let name = r_e("pi_name").value.trim();
    let email = r_e("pi_email").value.trim();
    // handicap numericals + sign
    let sign = r_e("pi_handicap_sign").value;
    let handicapValueRaw = r_e("pi_handicap_value").value;
    let handicapValue = Number(handicapValueRaw);

    if (!name || !email || !handicapValueRaw) {
      configure_message_bar("Please fill in name, email, and handicap.");
      return;
    }

    // handicap numerical error
    if (isNaN(handicapValue)) {
      configure_message_bar("Handicap must be a number.");
      return;
    }

    // display congregated string
    let handicap = sign === "+" ? `+${handicapValue}` : `${handicapValue}`;

    let playerObj = {
      name,
      email,
      handicap,
      user: auth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    db.collection("players")
      .add(playerObj)
      .then(() => {
        configure_message_bar("Your info has been posted!");
        postInfoForm.reset();
        load_players(); // refresh the list
      })
      .catch((err) => {
        console.log(err);
        configure_message_bar("Error posting your info.");
      });
  });
}
