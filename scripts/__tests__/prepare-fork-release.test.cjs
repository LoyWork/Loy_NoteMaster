const { test } = require('node:test')
const assert = require('node:assert/strict')
const { parseTag } = require('../prepare-fork-release.cjs')

test('stable tags supply the package version without the v prefix', () => {
  assert.deepEqual(parseTag('v1.0.0'), { version: '1.0.0', prerelease: false })
  assert.deepEqual(parseTag('v3.93.2'), { version: '3.93.2', prerelease: false })
})

test('release candidates are published as prereleases', () => {
  assert.deepEqual(parseTag('v1.0.1-rc.1'), { version: '1.0.1-rc.1', prerelease: true })
})

test('invalid, unsafe or non-version tags fail before packaging', () => {
  for (const tag of ['', undefined, '1.0.0', 'v1', 'v01.0.0', 'v1.0.0-rc.01', 'v1.0.0+build', 'v1.0.0;echo bad', 'v1.0.0\n']) {
    assert.throws(() => parseTag(tag))
  }
})
