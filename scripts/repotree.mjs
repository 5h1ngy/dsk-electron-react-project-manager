#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// scripts/analizza-repo.mjs
// Genera un albero leggibile del repository (stile `tree -L 3 -I "node_modules|dist|build|.git|.venv"`)
// Output: docs/repo-tree.md

import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const outFile = path.join(docsDir, 'repo-tree.context.md')
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

// Configurazione (modifica se necessario)
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.venv'])
const MAX_DEPTH = 100
const SHOW_DOTFILES = false // come `tree` senza -a

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function listDirSafe(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

function sortDirsFirst(a, b) {
  if (a.isDirectory() && !b.isDirectory()) return -1
  if (!a.isDirectory() && b.isDirectory()) return 1
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

async function renderTree(dir, depth = 0, prefix = '') {
  if (depth >= MAX_DEPTH) return []

  let entries = (await listDirSafe(dir)).filter((d) => {
    if (!SHOW_DOTFILES && d.name.startsWith('.')) return false
    if (IGNORE_DIRS.has(d.name)) return false
    return true
  })

  entries.sort(sortDirsFirst)
  const lines = []

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const isLast = i === entries.length - 1
    const connector = isLast ? '└── ' : '├── '
    const subPrefix = prefix + (isLast ? '    ' : '│   ')
    lines.push(prefix + connector + e.name)

    if (e.isDirectory()) {
      const childPath = path.join(dir, e.name)
      const childLines = await renderTree(childPath, depth + 1, subPrefix)
      lines.push(...childLines)
    }
  }

  return lines
}

async function makeRepoTree() {
  const projectName = path.basename(root)
  const header =
    `# Albero repository: ${projectName}\n\n` + `Generato: ${now}\n\n\`\`\`\n${projectName}\n`
  const body = (await renderTree(root)).join('\n')
  const content = header + body + `\n\`\`\`\n`
  await ensureDir(docsDir)
  await fs.writeFile(outFile, content, 'utf8')
  return outFile
}

;(async () => {
  try {
    const out = await makeRepoTree()
    console.log(`✅ Albero scritto in: ${out}`)
  } catch (err) {
    console.error("❌ Errore al creare l'albero:", err?.message || err)
    process.exitCode = 1
  }
})()
