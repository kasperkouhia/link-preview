# Link Preview

Fetch preview data from links using Puppeteer.

Returns a title, description, domain, and image.

## Usage

```js
const linkPreview = require('link-preview');
const data = await linkPreview('https://example.com');
console.log(data);
```