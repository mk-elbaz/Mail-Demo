document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  document.querySelector("form").onsubmit = sendEmail;

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#specific-mail").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#specific-mail").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emails.forEach((email) => viewEmail(email, mailbox));
    });
}

function sendEmail() {
  const to = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  console.log(`{
    recipients : ${to},
    subject: ${subject},
    body: ${body}
  }`);

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: to,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
    })
    .catch((error) => console.log(error));
  load_mailbox("sent");
  return false;
}
//https://getbootstrap.com/docs/5.1/components/card/
function viewEmail(email, mailbox) {
  const specificMail = document.createElement("div");
  specificMail.id = "emailDiv";

  const from = document.createElement("span");
  from.id = "from";

  const subject = document.createElement("span");
  subject.id = "subject";
  subject.innerHTML = email.subject;

  const timestamp = document.createElement("span");
  timestamp.id = "timestamp";
  timestamp.innerHTML = email.timestamp;

  from.style.marginLeft = "5px";
  from.classList.add("font-weight-bold", "mt-2");
  timestamp.classList.add("text-muted", "mt-2", "ml-auto");
  subject.classList.add("ml-2", "mt-2");
  timestamp.style.float = "right";
  timestamp.style.marginRight = "10px";

  if (mailbox === "inbox") {
    from.innerHTML = email.sender;
  } else {
    from.innerHTML = email.recipients[0];
  }

  specificMail.append(from);
  specificMail.append(subject);
  specificMail.append(timestamp);

  if (mailbox !== "sent") {
    const archiveButton = document.createElement("button");
    archiveButton.id = "archive";
    if (email.archived) {
      archiveButton.innerHTML = "Unarchive";
    } else {
      archiveButton.innerHTML = "Archive";
    }

    archiveButton.style.float = "right";
    archiveButton.style.marginRight = "15px";
    archiveButton.classList.add("btn", "btn-outline-warning");


    specificMail.append(archiveButton);
    //specificMail.append(document.createElement('hr'))
    archiveButton.addEventListener("click", () => {
      archiveChange(email.id, email.archived);
    });
  }

  from.addEventListener("click", () => {
    chooseEmail(email.id);
  });

  subject.addEventListener("click", () => {
    chooseEmail(email.id);
  });

  timestamp.addEventListener("click", () => {
    chooseEmail(email.id);
  });

  const emailBox = document.createElement("div");
  if (email.read) {
    emailBox.style.backgroundColor = "#e0dede";
  } else {
    emailBox.style.backgroundColor = "white";
  }


  emailBox.style.marginBottom = "20px";
  specificMail.style.height = "auto";
  emailBox.classList.add("card", "border-dark", "mb-3");
  emailBox.append(specificMail);
  document.querySelector("#emails-view").append(emailBox);
}

function chooseEmail(email_id) {
  document.querySelector("#specific-mail").style.display = "block";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      console.log(email);

      // ... do something else with email ...

      //mark as read
      markAsRead(email_id);

      document.querySelector("#specific-from").innerHTML = email.sender;
      document.querySelector("#specific-to").innerHTML = email.recipients;
      document.querySelector("#specific-subject").innerHTML = email.subject;
      document.querySelector("#specific-time").innerHTML = email.timestamp;
      document.querySelector("#specific-body").innerHTML = email.body;

      //reply
      document
        .querySelector("#specific-reply")
        .addEventListener("click", () => {
          reply(email);
        });
    });

  return false;
}

function archiveChange(email_id, prevArchive) {
  const newArchive = !prevArchive;
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: newArchive,
    }),
  });
  load_mailbox("inbox");
}

function markAsRead(email_id) {
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function reply(email) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#specific-mail").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  document.querySelector("#compose-recipients").value = email.sender;
  document.querySelector("#compose-subject").value = "RE: " + email.subject;
  document.querySelector(
    "#compose-body"
  ).value = `On ${email.timestamp} \n ${email.sender} said: \n ${email.body}`;
}
