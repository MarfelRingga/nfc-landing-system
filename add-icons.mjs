import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

if (!content.includes('ListOrdered')) {
  content = content.replace('Twitter,', 'Twitter,\n  ListOrdered,\n  BarChart3,\n  Users,');
}

// And while we're at it, let's fix the arrow scroll issue: 8. Scroll Animation Tidak Berfungsi
// There should be a "Scroll to explore ↓" arrow to click.
// We can add a function to scroll down smoothly. 

fs.writeFileSync('src/app/page.tsx', content);
