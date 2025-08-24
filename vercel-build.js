import { build } from 'vite';
 
// Run the build
build().catch((err) => {
  console.error(err);
  process.exit(1);
}); 