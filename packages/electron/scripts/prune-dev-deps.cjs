const { spawn } = require('node:child_process')
const { existsSync } = require('node:fs')
const { join } = require('node:path')

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

  const stagedAppDir = context?.appOutDir
    ? join(context.appOutDir, 'resources', 'app')
    : undefined

  if (!stagedAppDir || !existsSync(stagedAppDir)) {
    console.warn(
      '[beforePack] Skipping npm prune because staged app dir was not found:',
      stagedAppDir
    )
    return
  }

  console.log('[beforePack] Pruning devDependencies in:', stagedAppDir)
  await run(npmCommand, pruneArgs, {
    cwd: stagedAppDir,
    env: {
      ...process.env,
      npm_config_loglevel: process.env.npm_config_loglevel ?? 'warn'
    }
  })
}
