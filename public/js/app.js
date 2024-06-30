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
  
      if (response.ok) {
        document.getElementById('message').textContent = 'Login successful!';
        document.getElementById('message').style.color = 'green';
        window.location.href = '/users/bookings_page';
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