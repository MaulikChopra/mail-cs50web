// removed DOMcontentloaded checker and moved script tag to the bottom of layout.html

// definging the inbox, archive, and sent urls.
const inbox = "inbox";
const sent = "sent";
const archive = "archive";

document
  .querySelector("#inbox")
  .addEventListener("click", () => load_mailbox(inbox));
document
  .querySelector("#sent")
  .addEventListener("click", () => load_mailbox(sent));
document
  .querySelector("#archived")
  .addEventListener("click", () => load_mailbox(archive));
document.querySelector("#compose").addEventListener("click", compose_email);

// By default, load the inbox
load_mailbox(inbox);

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document
    .querySelector("#compose-submit")
    .addEventListener("click", send_email);

  function send_email() {
    let body = JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-subject").value,
    });
    fetch("/emails", {
      method: "POST",
      body: body,
    }).then(function (response) {
      console.log(response.status);
      if (response.status === 201) {
        console.log("success sent email");
        document.querySelector("#message-box").innerHTML = `
      <div class="alert alert-success" role="alert">
        Email sent successfully!
      </div>
      `;
        setTimeout(() => {
          window.location.replace("/");
        }, 1000);

        // redirect to main page
        // and show success on main page like google mail itself
      } else {
        response.json().then(function (result) {
          // add html for error and clear fields
          document.querySelector("#message-box").innerHTML = `
          <div class="alert alert-danger" role="alert">
            ${result["error"]}
          </div>
          `;
        });
      }
    });
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // FETCH DATA FORM OUR OWN SERVER USING THE PREDEFINED API
  fetch("/emails/" + mailbox)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        document.querySelector("#emails-view").innerHTML += `
        <div class="mailfield-all">
          <div style="font-weight: 600; margin-right: 1rem">
            ${email.sender} 
          </div>
          <div>
            ${email.subject} 
          </div>
          <div style="font-size:0.75rem; color: grey; margin-left:auto">
            ${email.timestamp}
          </div>
        </div>`;
      });
    });
}
