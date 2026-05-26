const fs = require('fs');
const path = require('path');

fetch('http://localhost:3000/faqs')
  .then(res => res.text())
  .then(html => {
    fs.writeFileSync(path.join(__dirname, 'raw-faqs.html'), html);
    console.log("SUCCESSfully captured raw-faqs.html");
  })
  .catch(err => console.error("Error capturing raw FAQs HTML:", err));
