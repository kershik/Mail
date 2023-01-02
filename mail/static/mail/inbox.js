// Check if there is already a value for current state
if (!localStorage.getItem('current')) {
  // If not, set the current to default - index
  localStorage.setItem('current', 'inbox')
}

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'))
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'))
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'))
  document.querySelector('#compose').addEventListener('click', compose_email)

  if (localStorage.getItem('current') === 'compose') {
    compose_email()
  } else {
    load_mailbox(localStorage.getItem('current'))
  }
  localStorage.setItem('current', 'inbox')
})

function compose_email({ repl_recipient, repl_subject, repl_text } = {}) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block'
  document.querySelector('#email-view').style.display = 'none'

  // Clear out composition fields
  const recipient = document.querySelector('#compose-recipients')
  recipient.value = repl_recipient === undefined ? '' : repl_recipient
  const subject = document.querySelector('#compose-subject')
  subject.value = repl_recipient === undefined ? '' : repl_subject
  const body = document.querySelector('#compose-body')
  body.value = repl_text === undefined ? '' : repl_text

  // Disable submit button by default:
  const submit = document.querySelector('#submit-send')
  submit.disabled = true

  // Activate submit button if all fields are filled
  document.querySelector('#send').addEventListener('mouseover', () => {
    if (recipient.value.length > 0 && subject.value.length > 0 && body.value.length > 0) {
      submit.disabled = false
    }
  })

  // Post data form form
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipient.value,
        subject: subject.value,
        body: body.value
      })
    })
    .then(response => {
        if (response.ok) {
          localStorage.setItem('current', 'sent')
        } else {
          localStorage.setItem('current', 'compose')
        }
        return response.json()
      })
    .then(result => {
        // Print result
        console.log(result)
      })
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block'
  document.querySelector('#compose-view').style.display = 'none'
  document.querySelector('#email-view').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="mailbox">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3`

  const url = '/emails/' + mailbox
  fetch(url)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails)
      // Make a div for each email
      emails.forEach((email) => {
        if (email.read === true) {
          email_style = 'email-read'
        } else {
          email_style = 'email-unread'
        }
        email_title = mailbox === 'sent' ? `To: ${email.recipients}` : email.sender
        const element = document.createElement('div')
        element.innerHTML = `<strong>${email_title}</strong><span style='float: right;'>${email.timestamp}</span></br>${email.subject}`
        element.setAttribute('class', email_style)
        // Add new div to page
        document.getElementById('emails-view').append(element)
        // Add eventlistener for click on div to read email
        element.addEventListener('click', () => {
          fetch('/emails/' + email.id)
          .then(response => response.json())
          .then(email => {
              // Print email
              console.log(email)
              show_email(email)
            })
        })
      })
    })
}

function show_email(email) {
  // Show the mail and hide other views
  document.querySelector('#email-view').style.display = 'block'
  document.querySelector('#emails-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'none'

  if (email.read === false) {
    fetch('/emails/' + email.id, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }

  document.getElementById('email-subj').innerHTML = email.subject
  document.getElementById('email-sender').innerHTML = `<strong>From:</strong> ${email.sender}`
  document.getElementById('email-text').innerHTML = email.body

  const archive = document.getElementById('archive')
  if (email.sender === document.getElementById('user').innerHTML) {
    archive.style.display = 'none'
  }
  // Fill value of archive/unarchive button
  if (email.archived === false) {
    archive.innerHTML = 'Archive'
  } else {
    archive.innerHTML = 'Unarchive'
  }

  // Add onclick to archive/unarchive button
  archive.onclick = () => {
    fetch('/emails/' + email.id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !email.archived
      })
    })
    if (archive.innerHTML === 'Archive') {
      archive.innerHTML = 'Unarchive'
    } else {
      archive.innerHTML = 'Archive'
    }
  }

  document.getElementById('reply').onclick = () => {
    compose_email({
      repl_recipient: email.sender,
      repl_subject: email.subject.startsWith('Re') ? email.subject : 'Re: ' + email.subject,
      repl_text: `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`
    })
  }
}
