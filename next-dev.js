import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');

const args = process.argv.slice(2);
const filteredArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host') {
    i++; // Skip the value
    continue;
  }
  if (args[i].startsWith('--host=')) {
    continue;
  }
  filteredArgs.push(args[i]);
}

// Use 'next' if it's in the path, otherwise use the absolute path to the binary
const next = spawn(nextBin, ['dev', '-p', '3000', '-H', '0.0.0.0', ...filteredArgs], {
  stdio: 'inherit',
  shell: true
});

next.on('exit', (code) => {
  process.exit(code);
});
