module.exports = (firstName, url) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
</head>
<body>
    <h2>Hello ${firstName}</h2>

    <p>You requested a password reset.</p>

    <p>This link is valid for only <strong>10 minutes</strong>.</p>

    <a href="${url}">
        Reset Password
    </a>

    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
`;