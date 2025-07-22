const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Redirect root to the slide show
app.get('/', (req, res) => {
  res.redirect('/challenges/LetItSlide/slide-show/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});