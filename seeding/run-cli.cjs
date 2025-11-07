const { runSeedCli } = require('./run.ts');

runSeedCli().catch((error) => {
  console.error(error);
  process.exit(1);
});
