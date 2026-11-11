// @vitest-environment node
import { execFileSync } from 'child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync } from 'fs'
import * as path from 'path'
import * as os from 'os'
import { parseGitStatus, readGitStatus } from '../git-status'

test('parses staged, unstaged, UTF-8, conflict and rename records without quoting names', () => {
  const root = path.resolve('git-fixture')
  const result = parseGitStatus(' M source/文章 空格.md\0?? source/new.png\0A  source/staged.md\0UU source/conflict.md\0R  source/new-name.md\0source/old-name.md\0 M other.md\0', root, path.join(root, 'source'))
  expect(result).toMatchObject({
    '/文章 空格.md': 'modified',
    '/new.png': 'added',
    '/staged.md': 'added',
    '/conflict.md': 'conflicted',
    '/new-name.md': 'renamed',
    '/old-name.md': 'deleted',
    '/': 'conflicted',
  })
  expect(result['/other.md']).toBeUndefined()
})

test('aggregates deleted and added children without leaking sibling folders', () => {
  const root = path.resolve('git-fixture')
  const result = parseGitStatus('?? source/new/a.png\0 D source/existing/deleted.md\0?? source-other/file.md\0', root, path.join(root, 'source'))
  expect(result).toEqual({
    '/new/a.png': 'added', '/new': 'added',
    '/existing/deleted.md': 'deleted', '/existing': 'modified', '/': 'modified',
  })
})

test('reads a real Git repository from a note subdirectory and clears committed/restored statuses', async () => {
  const prefix = path.join(os.tmpdir(), 'notemaster-git-')
  const root = mkdtempSync(prefix)
  const source = path.join(root, 'source', '_posts')
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, windowsHide: true })
  try {
    mkdirSync(source, { recursive: true })
    git('init')
    git('config', 'user.name', 'NoteMaster Test')
    git('config', 'user.email', 'test@example.invalid')
    writeFileSync(path.join(root, '.gitignore'), '*.ignored\n')
    writeFileSync(path.join(source, '中文 笔记.md'), 'original')
    writeFileSync(path.join(source, 'rename.md'), 'rename')
    git('add', '.')
    git('commit', '-m', 'fixture')
    writeFileSync(path.join(source, '中文 笔记.md'), 'modified')
    writeFileSync(path.join(source, 'new.md'), 'new')
    writeFileSync(path.join(source, 'skip.ignored'), 'ignored')
    writeFileSync(path.join(root, 'outside.md'), 'outside')
    renameSync(path.join(source, 'rename.md'), path.join(source, 'renamed.md'))
    git('add', 'source/_posts/rename.md', 'source/_posts/renamed.md')
    const result = await readGitStatus(source)
    expect(result.available).toBe(true)
    expect(result.statuses['/中文 笔记.md']).toBe('modified')
    expect(result.statuses['/new.md']).toBe('added')
    expect(result.statuses['/renamed.md']).toBe('renamed')
    expect(result.statuses['/skip.ignored']).toBeUndefined()
    expect(result.statuses['/outside.md']).toBeUndefined()
    git('restore', 'source/_posts/中文 笔记.md')
    git('add', 'source')
    git('commit', '-m', 'save notes')
    expect(await readGitStatus(source)).toEqual({ available: true, statuses: {} })
    const plain = path.join(root, 'plain')
    mkdirSync(plain)
    // This empty folder is still inside Git, but has no changed entries.
    expect((await readGitStatus(plain)).statuses).toEqual({})
  } finally {
    if (!path.resolve(root).startsWith(path.resolve(prefix))) throw new Error('Unsafe fixture path')
    rmSync(root, { recursive: true, force: true })
  }
})

test('plain or missing folders do not require Git', async () => {
  expect(await readGitStatus(path.join(os.tmpdir(), 'notemaster-missing-folder'))).toEqual({ available: false, statuses: {} })
})
