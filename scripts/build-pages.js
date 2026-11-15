import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pageMetadata, notFoundMetadata, renderMetadata } from '../src/utils/metadata.js'

const index = await readFile('dist/index.html', 'utf8')
for (const path of ['/collection', '/about', '/admin']) {
  await mkdir(`dist${path}`, { recursive: true })
  await writeFile(`dist${path}/index.html`, renderMetadata(index, pageMetadata[path]))
}
await writeFile('dist/404.html', renderMetadata(index, notFoundMetadata))
