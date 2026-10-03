require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener
const urlDatabase = [];
let shortUrlCounter = 1;

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, function(err) {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = shortUrlCounter++;

      urlDatabase.push({
        original_url: originalUrl,
        short_url: shortUrl
      });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// Redirect
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  const urlEntry = urlDatabase.find(function(item) {
    return item.short_url === shortUrl;
  });

  if (!urlEntry) {
    return res.status(404).json({ error: 'short url not found' });
  }

  res.redirect(urlEntry.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
