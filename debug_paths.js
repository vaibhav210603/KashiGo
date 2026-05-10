const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
console.log("CWD:", process.cwd());
console.log("BLOG_DIR:", BLOG_DIR);

if (fs.existsSync(BLOG_DIR)) {
  console.log("BLOG_DIR exists");
  const files = fs.readdirSync(BLOG_DIR);
  console.log("Files:", files);
  
  files.forEach(file => {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    console.log(`Slug: ${slug}, Path: ${filePath}, Exists: ${fs.existsSync(filePath)}`);
  });
} else {
  console.log("BLOG_DIR does NOT exist");
}
