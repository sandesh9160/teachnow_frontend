const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src', 'app', '(home)', 'loading.tsx');

try {
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log("Successfully deleted loading.tsx!");
  } else {
    console.log("loading.tsx does not exist.");
  }
} catch (err) {
  console.error("Error deleting loading.tsx:", err);
}
