const express = require('express');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve challenges
app.use('/challenges', express.static(path.join(__dirname, 'challenges')));

// Serve other projects
app.use('/other', express.static(path.join(__dirname, 'other')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Challenge routes
app.get('/challenges/:category/:name', (req, res) => {
    const { category, name } = req.params;
    res.sendFile(path.join(__dirname, 'challenges', category, name, 'index.html'));
});

// Other project routes
app.get('/other/:name', (req, res) => {
    const { name } = req.params;
    res.sendFile(path.join(__dirname, 'other', name, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 