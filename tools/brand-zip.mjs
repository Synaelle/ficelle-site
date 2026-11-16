// The brand page's download: the knot and the colours in one zip, written
// after the build into dist/brand/. Stored, not compressed: the files are
// small and the PNG is compressed already.
import { readFileSync, writeFileSync } from 'node:fs'
import { crc32 } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const brand = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'brand')

const colours = `/* Ficelle's colours, dark then light */
:root {
  --ficelle-dark-background: #0e0d0d;
  --ficelle-dark-surface: #161414;
  --ficelle-dark-text: #e6dfd8;
  --ficelle-dark-muted: #9a918a;
  --ficelle-dark-red: #e44c3e;
  --ficelle-light-background: #f1efea;
  --ficelle-light-surface: #fbfaf7;
  --ficelle-light-text: #161413;
  --ficelle-light-muted: #5e5853;
  --ficelle-light-red: #c1271b;
}
`

const files = [
  ['knot.svg', readFileSync(join(brand, 'knot.svg'))],
  ['knot-512.png', readFileSync(join(brand, 'knot-512.png'))],
  ['colours.css', Buffer.from(colours)],
]

const local = []
const central = []
let offset = 0
for (const [name, data] of files) {
  const nameBytes = Buffer.from(name)
  const crc = crc32(data)
  const head = Buffer.alloc(30)
  head.writeUInt32LE(0x04034b50, 0)
  head.writeUInt16LE(20, 4)
  head.writeUInt32LE(crc, 14)
  head.writeUInt32LE(data.length, 18)
  head.writeUInt32LE(data.length, 22)
  head.writeUInt16LE(nameBytes.length, 26)
  local.push(head, nameBytes, data)
  const entry = Buffer.alloc(46)
  entry.writeUInt32LE(0x02014b50, 0)
  entry.writeUInt16LE(20, 4)
  entry.writeUInt16LE(20, 6)
  entry.writeUInt32LE(crc, 16)
  entry.writeUInt32LE(data.length, 20)
  entry.writeUInt32LE(data.length, 24)
  entry.writeUInt16LE(nameBytes.length, 28)
  entry.writeUInt32LE(offset, 42)
  central.push(entry, nameBytes)
  offset += head.length + nameBytes.length + data.length
}
const centralSize = central.reduce((n, b) => n + b.length, 0)
const end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0)
end.writeUInt16LE(files.length, 8)
end.writeUInt16LE(files.length, 10)
end.writeUInt32LE(centralSize, 12)
end.writeUInt32LE(offset, 16)
writeFileSync(join(brand, 'ficelle-brand.zip'), Buffer.concat([...local, ...central, end]))
console.log(`brand zip: ${files.map(([n]) => n).join(', ')}`)
