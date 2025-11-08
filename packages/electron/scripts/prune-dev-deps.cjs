const { spawn } = require('node:child_process')

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options
    })

    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(
          `Command "${command} ${args.join(' ')}" failed with exit code ${code ?? 'unknown'}`
        )
      )
    })
  })

exports.default = async function beforePack(context) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const pruneArgs = ['prune', '--production', '--no-audit', '--no-fund']

  console.log('[beforePack] Pruning devDependencies for appDir:', context.appDir)
  await run(npmCommand, pruneArgs, {
    cwd: context.appDir,
    env: {
      ...process.env,
      npm_config_loglevel: process.env.npm_config_loglevel ?? 'warn'
    }
  })
}
