const fs = require('node:fs')
const path = require('node:path')

function parseTag (tag) {
  const match = /^v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)$/.exec(tag || '')
  if (!match || (match[2] || '').split('.').some(part => /^0\d+$/.test(part))) {
    throw new Error('Use a version tag such as v1.0.0 or v1.0.1-rc.1')
  }
  return { version: match[1], prerelease: !!match[2] }
}

if (require.main === module) {
  const { version, prerelease } = parseTag(process.env.GITHUB_REF_NAME)
  const packagePath = path.join(__dirname, '..', 'package.json')
  const metadata = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  metadata.version = version
  fs.writeFileSync(packagePath, JSON.stringify(metadata, null, 2) + '\n')
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nprerelease=${prerelease}\n`)
  console.log(`Packaging Loy NoteMaster ${version} (${prerelease ? 'pre-release' : 'release'})`)
}

module.exports = { parseTag }
