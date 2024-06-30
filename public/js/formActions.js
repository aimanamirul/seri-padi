if (document.getElementById('loginForm')) {



  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

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

    const ID_USER = "GUEST";

    if (confirm('Confirm Submit Booking?')) {
      document.querySelector('.loading').classList.add('d-block');

      try {
        const response = await fetch('/bookings/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ID_BOOKING, BOOKING_NAME, BOOKING_EMAIL, ID_USER, BOOKING_TEL, BOOKING_DATE, BOOKING_PAX, BOOKING_REMARKS })
        });

        const result = await response.json();

        if (response.ok) {
          document.querySelector('.loading').classList.remove('d-block');
          document.getElementById('guestBookForm').reset(); // Clear the form
          document.querySelector('.sent-message').style.display = 'block'; // Show success message
          document.querySelector('.err-message').style.display = 'none'; // Hide error message if any
          document.querySelector('.sent-message').textContent = `Your booking request was sent. Booking ID: ${ID_BOOKING}. We will call back or send an Email to confirm your reservation. Thank you!`;
        } else {
          document.querySelector('.loading').classList.remove('d-block');
          throw new Error(result.error || 'Failed to submit booking request');
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        document.querySelector('.loading').classList.remove('d-block');
        document.querySelector('.err-message').textContent = 'An error occurred. Please try again.';
        document.querySelector('.err-message').style.display = 'block'; // Show error message
        document.querySelector('.sent-message').style.display = 'none'; // Hide success message
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
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ NAME: name, TEL_NO: tel_no, EMAIL: email, USERNAME: username, PASSWORD: password })
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById('registerMessage').textContent = 'Registration successful! You can now log in.';
        document.getElementById('registerMessage').style.color = 'green';
        document.getElementById('registerForm').reset();
      } else {
        document.getElementById('registerMessage').textContent = result.error;
        document.getElementById('registerMessage').style.color = 'red';
      }
    } catch (error) {
      console.error('Error during registration:', error);
      document.getElementById('registerMessage').textContent = 'An error occurred. Please try again.';
      document.getElementById('registerMessage').style.color = 'red';
    }
  });
}
