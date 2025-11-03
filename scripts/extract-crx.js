const fs = require('fs')
const path = require('path')

const [inputArg, outputZipArg] = process.argv.slice(2)

if (!inputArg || !outputZipArg) {
  console.error('Usage: node scripts/extract-crx.js <input.crx> <output.zip>')
  process.exit(1)
}

const inputPath = path.resolve(process.cwd(), inputArg)
const outputPath = path.resolve(process.cwd(), outputZipArg)

if (!fs.existsSync(inputPath)) {
  console.error(`Input CRX not found: ${inputPath}`)
  process.exit(1)
}

const buffer = fs.readFileSync(inputPath)
const magic = buffer.slice(0, 4).toString()

if (magic !== 'Cr24') {
  console.error('Invalid CRX header magic number, expected "Cr24"')
  process.exit(1)
}

const version = buffer.readUInt32LE(4)
let zipStartOffset = 0

if (version === 2) {
  const publicKeyLength = buffer.readUInt32LE(8)
  const signatureLength = buffer.readUInt32LE(12)
  zipStartOffset = 16 + publicKeyLength + signatureLength
} else if (version === 3) {
  const headerSize = buffer.readUInt32LE(8)
  zipStartOffset = 12 + headerSize
} else {
  console.error(`Unsupported CRX version: ${version}`)
  process.exit(1)
}

if (zipStartOffset <= 0 || zipStartOffset >= buffer.length) {
  console.error('Calculated ZIP offset is invalid')
  process.exit(1)
}

const zipBuffer = buffer.slice(zipStartOffset)
fs.writeFileSync(outputPath, zipBuffer)
console.log(`Extracted ZIP payload to ${outputPath}`)
