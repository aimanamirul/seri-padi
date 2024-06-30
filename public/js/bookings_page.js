console.log('booking page')

document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/users/logout', {
            method: 'POST',
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred. Please try again.');
    }
});