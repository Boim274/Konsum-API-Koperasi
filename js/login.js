$(document).ready(function() {
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        $('#login-error').text('');

        var loginData = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            url: 'http://127.0.0.1:8000/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            dataType: 'json',
            success: function(response) {
                var token = response.data.access_token;
                $('#loginResult').text('Login successful! Token: ' + token);
                console.log('Login success:', response);
                localStorage.setItem('token', response.data.token);
                window.location.href = 'index.html';
            },
            error: function(xhr, status, error) {
                $('#login-error').text('Login error: ' + xhr.responseJSON.message);
                console.error('Login error:', xhr.responseJSON.message);
            }
        });
    });
});
