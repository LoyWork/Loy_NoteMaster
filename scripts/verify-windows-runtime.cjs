const assert = require('node:assert/strict')
const path = require('node:path')
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')

assert.equal(process.platform, 'win32', 'Run this check on Windows')
assert.ok(process.versions.electron, 'Run this check using the packaged Electron executable')
const resources = path.resolve(process.argv[2])
const unpacked = path.join(resources, 'app.asar.unpacked')
const pty = require(path.join(unpacked, 'node_modules', 'node-pty'))

for (const exe of [
  path.join(unpacked, 'node_modules', '@vscode', 'ripgrep', 'bin', 'rg.exe'),
  path.join(unpacked, 'bin', 'win32-pandoc-2.14.2.exe'),
]) {
  const result = spawnSync(exe, ['--version'], { windowsHide: true, encoding: 'utf8', timeout: 15000 })
  assert.equal(result.status, 0, `${exe}: ${result.error || result.stderr}`)
}
const plantuml = fs.readFileSync(path.join(unpacked, 'bin', 'plantuml.jar'))
assert.equal(plantuml.subarray(0, 2).toString(), 'PK', 'PlantUML must be a JAR archive')

let output = ''
const timer = setTimeout(() => { console.error('Terminal smoke check timed out'); process.exit(1) }, 15000)
const terminal = pty.spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'echo NOTE_MASTER_PTY_OK'], {
  name: 'xterm-color', cols: 80, rows: 24, cwd: resources, env: process.env,
})
terminal.onData(data => { output += data })
terminal.onExit(({ exitCode }) => {
  setTimeout(() => {
    clearTimeout(timer)
    assert.equal(exitCode, 0)
    assert.ok(output.includes('NOTE_MASTER_PTY_OK'), output)
    console.log('Packaged terminal, search and converter runtimes verified')
    process.exit(0)
  }, 250)
})
