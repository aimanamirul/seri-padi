if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    document.getElementById('login-spinner').style.display = 'inline-block';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      console.log(result.user);
      if (response.ok) {
        document.getElementById('login-spinner').style.display = 'none';

        document.getElementById('message').textContent = 'Login successful!';
        document.getElementById('message').style.color = 'green';
        if (result.role === 'ADMIN') {
          window.location.href = '/users/admin_page';
        } else {
          window.location.href = '/users/bookings_page';
        }
        // Handle successful login (e.g., redirect to another page)
      } else {
        document.getElementById('message').textContent = result.error;
        document.getElementById('message').style.color = 'red';
        document.getElementById('login-spinner').style.display = 'none';
      }
    } catch (error) {
      console.error('Error during login:', error);
      document.getElementById('message').textContent = 'An error occurred. Please try again.';
    }
  });

}

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

if (document.getElementById('guestBookForm')) {

  document.getElementById('guestBookForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const ID_BOOKING = generateRandomId(8);

    const BOOKING_NAME = document.getElementById('name').value;
    const BOOKING_EMAIL = document.getElementById('email').value;
    const BOOKING_TEL = document.getElementById('phone').value;
    const DATE_INPUT = document.getElementById('date').value;
    const TIME_INPUT = document.getElementById('time').value;
    const BOOKING_PAX = document.getElementById('people').value;
    const BOOKING_REMARKS = document.getElementById('remarks').value;

    const BOOKING_DATE = `${DATE_INPUT}T${TIME_INPUT}:00`;
    const CREATED_DATE = new Date().toISOString;

    const ID_USER = "GUEST";
    const BOOKING_STATUS = "N";

    if (confirm('Confirm Submit Booking?')) {
      document.getElementById('booking_loading').classList.add('d-block');

      try {
        const response = await fetch('/bookings/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ID_BOOKING, BOOKING_NAME, BOOKING_EMAIL, ID_USER, BOOKING_TEL, BOOKING_DATE, BOOKING_PAX, BOOKING_REMARKS, BOOKING_STATUS, CREATED_DATE })
        });

        const result = await response.json();

        if (response.ok) {
          document.getElementById('booking_loading').classList.remove('d-block');
          document.getElementById('guestBookForm').reset(); // Clear the form
          document.getElementById('booking_err').style.display = 'none'; // Hide error message if any
          document.getElementById('booking_sent').style.display = 'block'; // Show success message
          document.getElementById('booking_sent').textContent = `Your booking request was sent. Booking ID: ${ID_BOOKING}. We will call back or send an Email to confirm your reservation. Thank you!`;
        } else {
          document.getElementById('booking_loading').classList.remove('d-block');
          throw new Error(result.error || 'Failed to submit booking request');
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        document.getElementById('booking_loading').classList.remove('d-block');
        document.getElementById('booking_err').textContent = 'An error occurred. Please try again.';
        document.getElementById('booking_err').style.display = 'block'; // Show error message
        document.getElementById('booking_sent').style.display = 'none'; // Hide success message
      }
    }
  });
}

if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const tel_no = document.getElementById('tel_no').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;

    try {
      document.getElementById('reg-spinner').style.display = 'inline-block';
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ NAME: name, TEL_NO: tel_no, EMAIL: email, USERNAME: username, PASSWORD: password })
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById('reg-spinner').style.display = 'none';
        document.getElementById('registerMessage').textContent = 'Registration successful! You can now log in.';
        document.getElementById('registerMessage').style.color = 'green';
        document.getElementById('registerForm').reset();
      } else {
        document.getElementById('reg-spinner').style.display = 'none';
        document.getElementById('registerMessage').textContent = result.error;
        document.getElementById('registerMessage').style.color = 'red';
      }
    } catch (error) {
      console.error('Error during registration:', error);
      document.getElementById('reg-spinner').style.display = 'none';
      document.getElementById('registerMessage').textContent = 'An error occurred. Please try again.';
      document.getElementById('registerMessage').style.color = 'red';
    }
  });
}

if (document.getElementById('updateRoleForm')) {
  document.getElementById('updateRoleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('updateRoleForm'));
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    console.log(formDataObject); // Verify formDataObject structure

    try {
      // const userId = 'your-user-id'; // Replace with actual user ID logic
      const response = await fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObject)
      });

      if (response.ok) {
        alert('Role updated successfully!');
        window.location.reload(); // Reload the page on success (optional)
      } else {
        alert('Failed to update role.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  });
}

if (document.getElementById('profileForm')) {
  document.getElementById('profileForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('profileForm'));
    const formDataObject = {};
    formData.forEach((value, key) => {
      if (value) {
        formDataObject[key] = value;
      }
    });

    console.log(formDataObject); // Verify formDataObject structure

    try {
      // const userId = 'your-user-id'; // Replace with actual user ID logic
      const response = await fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObject)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        window.location.reload(); // Reload the page on success (optional)
      } else {
        alert('Failed to update user profile.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  });
}

if (document.getElementById('contactForm')) {

  document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const ID_MESSAGE = generateRandomId(8);

    const MESSAGE_NAME = document.getElementById('msg_name').value;
    const MESSAGE_EMAIL = document.getElementById('msg_email').value;
    // const BOOKING_TEL = document.getElementById('msg_phone').value;
    const MESSAGE_SUBJECT = document.getElementById('msg_subject').value;
    const MESSAGE_CONTENT = document.getElementById('msg_content').value;

    if (confirm('Confirm Submit Message?')) {
      // document.querySelector('.loading').classList.add('d-block');
      document.getElementById('msg_loading').classList.add('d-block');
      try {
        const response = await fetch('/messages/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ID_MESSAGE, MESSAGE_NAME, MESSAGE_EMAIL, MESSAGE_SUBJECT, MESSAGE_CONTENT })
        });

        const result = await response.json();

        if (response.ok) {
          document.getElementById('msg_loading').classList.remove('d-block');
          document.getElementById('contactForm').reset(); // Clear the form
          document.getElementById('msg_sent').style.display = 'block'; // Show success message
          document.getElementById('msg_error').style.display = 'none'; // Hide error message if any
          document.getElementById('msg_sent').textContent = `Your message was sent. Thank you!`;
          // alert('message sent successfully');
        } else {
          document.getElementById('msg_loading').classList.remove('d-block');
          console.log(result.error)
          throw new Error(result.error || 'Failed to submit booking request');
        }
      } catch (error) {
        console.error('Error submitting message:', error);
        document.getElementById('msg_loading').classList.remove('d-block');
        document.getElementById('msg_error').textContent = 'An error occurred. Please try again.';
        document.getElementById('msg_error').style.display = 'block'; // Show error message
        document.getElementById('msg_sent').style.display = 'none'; // Hide success message
      }
    }
  });
}