import {
  convert_from_django_to_JS_datetime,
  formatAMPM,
} from "./convert_time.js";
document.addEventListener("DOMContentLoaded", function () {
  const inbox = "inbox";
  const sent = "sent";
  const archive = "archive";
  const grey_color = "#EFEFEF";

  // defining onclicks for the header buttons
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

  document
    .querySelector("#home")
    .addEventListener("click", () => load_mailbox(inbox));

  // multiple emails bug solved by putting event listener outside of function.
  document
    .querySelector("#compose-submit")
    .addEventListener("click", send_email);

  // By default, load the inbox
  load_mailbox(inbox);

  function compose_email(subject_val = "", body_val = "", recipients_val = "") {
    // Show compose view and hide other views
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "block";
    document.querySelector("#particular-email-view").style.display = "none";
    // Clear out composition fields
    document.querySelector("#compose-recipients").value = recipients_val;
    document.querySelector("#compose-subject").value = subject_val;
    document.querySelector("#compose-body").value = body_val;
  }
  function send_email() {
    let email_body = JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    });
    // post request to send the mail
    fetch("/emails", {
      method: "POST",
      body: email_body,
    }).then(function (response) {
      if (response.status === 201) {
        // redirect to main page and show success message for 5 second.
        load_mailbox(inbox, true);
      } else {
        response.json().then(function (result) {
          // add html for error and do not clear fields
          document.querySelector("#message-box").innerHTML = `
          <div class="alert alert-danger" role="alert">
            ${result["error"]}
          </div>
          `;
        });
      }
    });
  }

  function load_mailbox(mailbox, email_success = false) {
    // Show the mailbox and hide other views
    document.querySelector("#emails-view").style.display = "block";
    document.querySelector("#compose-view").style.display = "none";
    document.querySelector("#particular-email-view").style.display = "none";

    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = `<h3>${
      mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
    }</h3>`;

    // if coming from compose with successful email show message for 5 seconds
    if (email_success) {
      let success_message = document.createElement("div");
      success_message.innerHTML = ` <div class="alert alert-success" role="alert">
      Email sent successfully!</div>`;
      document.querySelector("#emails-view").append(success_message);
      setTimeout(() => {
        success_message.style.display = "none";
      }, 5000);
    }

    // FETCH DATA FORM OUR OWN SERVER USING THE PREDEFINED API
    fetch("/emails/" + mailbox)
      .then((response) => response.json())
      .then((emails) => {
        emails.forEach((email) => {
          // to show time in the respecitve timezone using JS Date module.
          let datetime = convert_from_django_to_JS_datetime(email.timestamp);

          // selecting the main element to push html
          const mail_element = document.createElement("div");
          mail_element.classList.add("mailfield-all"); // added class to mail elements
          // checking if the email was read or not, then change the color of element.
          if (email.read) {
            mail_element.style.backgroundColor = grey_color; // grey
          } else {
            mail_element.setAttribute("style", "font-weight: 700; !important");
          }
          mail_element.innerHTML = `
            <div style="margin-right: 1.5rem">
            <i class="fa-solid fa-user"></i>
              ${email.sender} 
            </div>
            <div style="padding-right: 0.5rem">
            <i class="fa-solid fa-angles-right" ></i>
              ${email.subject} 
            </div>
            <div style="font-size:0.75rem; color: grey; margin-left:auto">
            <i class="fa-solid fa-clock"></i>
              ${datetime.toDateString()}, ${formatAMPM(datetime)}
          </div>`; // html code ended

          mail_element.addEventListener("click", function () {
            load_email(email.id, mailbox);
          }); // event listener of button click
          // adding the html element to the view
          document.querySelector("#emails-view").append(mail_element);
        });
      });
  }

  function load_email(id, mailbox) {
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "none";
    document.querySelector("#particular-email-view").style.display = "block";

    fetch("/emails/" + id)
      .then((response) => response.json())
      .then((email) => display_email(email));

    function display_email(email) {
      // main email view page
      // to show time in the respecitve timezone using JS Date module.
      let datetime = convert_from_django_to_JS_datetime(email.timestamp);

      // selecting the main div to push html into
      let elem = document.querySelector("#particular-email-view");
      elem.innerHTML = `
      <h6><b style="font-weight: 700";>
      From: </b>${email.sender}</h6>
      <h6><b style="font-weight: 700";>
      To: </b>${email.recipients}</h6>
      <h5><b style="font-weight: 700";>
      Subject</b><i class="fa-solid fa-angles-right"></i> 
      ${email.subject}</h5>
      <h6><em style="color:grey"><i class="fa-solid fa-clock"></i>
      ${datetime.toDateString()}, ${formatAMPM(datetime)}
      </em></h6>
      <hr>
      <p>${email.body.replace(/\n/g, "<br />")}</p>
      <hr>
      `; //html content end

      // button holder to add all the buttons
      const button_holder = document.createElement("div");
      button_holder.classList.add("button-holder");
      // archive button
      if (mailbox !== sent) {
        const archive_button = document.createElement("div");
        // show archive/unarchive buttons
        if (email.archived) {
          archive_button.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="archive-button"><i class="fa-solid fa-box-archive icon"></i>UnArchive</button>`;
        } else {
          archive_button.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="archive-button"><i class="fa-solid fa-box-archive icon"></i>Archive</button>`;
        }
        archive_button.addEventListener("click", function () {
          PUT_archive(email.id, email.archived);
        });
        button_holder.append(archive_button);
      }

      // reply button
      const reply_button = document.createElement("div");
      reply_button.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="reply_button"><i class="fa-solid fa-reply icon"></i>Reply</button>`;
      reply_button.onclick = function () {
        reply_email(email);
      };
      button_holder.append(reply_button);

      // adding the button holder to the main html of our page
      elem.append(button_holder);

      // mark as read // only sends a PUT request if mail not seen otherwise skips.
      if (!email.read) {
        fetch("/emails/" + email.id, {
          method: "PUT",
          body: JSON.stringify({
            read: true,
          }),
        });
      }
    }
  }

  // function to archive or unarchive the mail
  function PUT_archive(id, archived) {
    if (archived) {
      fetch("/emails/" + id, {
        method: "PUT",
        body: JSON.stringify({
          archived: false,
        }),
      }).then(() => {
        load_mailbox(inbox);
      });
    } else {
      fetch("/emails/" + id, {
        method: "PUT",
        body: JSON.stringify({
          archived: true,
        }),
      }).then(() => {
        load_mailbox(inbox);
      });
    }
  }

  // function to reply to the mail
  function reply_email(email) {
    let recipients = email.sender;
    let subject;
    if (
      email.subject.substring(0, 4) === "Re: " ||
      email.subject.substring(0, 4) === "re: "
    ) {
      subject = email.subject;
    } else {
      subject = "Re: " + email.subject;
    }

    // to show time in the respecitve timezone using JS Date module.
    let datetime = convert_from_django_to_JS_datetime(email.timestamp);
    let time_in_ampm = formatAMPM(datetime);
    let body =
      "\n" +
      "On " +
      datetime.toDateString() +
      ", " +
      time_in_ampm +
      ", " +
      email.sender +
      " wrote:\n" +
      email.body;
    compose_email(subject, body, recipients);
  }
});
