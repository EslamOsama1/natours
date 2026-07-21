module.exports = (firstName, url) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
</head>
<body>
    <h2>Welcome ${firstName}! 👋</h2>

    <p>Thanks for joining Natours.</p>

    <a href="${url}">
        Start Exploring
    </a>
</body>
</html>
`;