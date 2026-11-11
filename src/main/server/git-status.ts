import { execFile } from 'child_process'
import * as path from 'path'
import { promisify } from 'util'
import type { GitFileStatus, GitStatusResult } from '../../share/git-status'

const exec = promisify(execFile)

/** Porcelain -z uses literal UTF-8 names and puts rename destinations first. */
export function parseGitStatus (output: string, root: string, directory: string): Record<string, GitFileStatus> {
  const statuses: Record<string, GitFileStatus> = Object.create(null)
  const priority: Record<GitFileStatus, number> = { added: 1, renamed: 2, deleted: 3, modified: 4, conflicted: 5 }
  function add (gitPath: string, status: GitFileStatus) {
    const relative = path.relative(directory, path.resolve(root, gitPath)).split(path.sep).join('/')
    if (relative === '..' || relative.startsWith('../') || path.isAbsolute(relative)) return
    let key = '/' + relative
    statuses[key] = status
    while (key !== '/') {
      key = path.posix.dirname(key)
      const folderStatus = status === 'added' ? 'added' : status === 'conflicted' ? 'conflicted' : 'modified'
      if (!statuses[key] || priority[folderStatus] > priority[statuses[key]]) statuses[key] = folderStatus
    }
  }

  const records = output.split('\0')
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (record.length < 4) continue
    const code = record.slice(0, 2)
    const name = record.slice(3)
    const rename = /[RC]/.test(code)
    const originalName = rename ? records[++i] : undefined
    let status: GitFileStatus
    if (code.includes('U') || code === 'AA' || code === 'DD') status = 'conflicted'
    else if (code.includes('D')) status = 'deleted'
    else if (code === '??' || code.includes('A')) status = 'added'
    else if (code.includes('M') || code.includes('T')) status = 'modified'
    else if (rename) status = 'renamed'
    else continue
    add(name, status)
    if (code.includes('R') && originalName) add(originalName, 'deleted')
  }
  return statuses
}

export async function readGitStatus (directory: string): Promise<GitStatusResult> {
  const options = {
    cwd: directory,
    windowsHide: true,
    timeout: 4000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  }
  try {
    const { stdout: root } = await exec('git', ['rev-parse', '--show-toplevel'], options)
    const { stdout } = await exec('git', ['--literal-pathspecs', 'status', '--porcelain=v1', '-z', '--untracked-files=all', '--', '.'], options)
    return { available: true, statuses: parseGitStatus(stdout, root.trim(), directory) }
  } catch (_) {
    // Git is optional: plain folders and unavailable Git keep their normal colors.
    return { available: false, statuses: {} }
  }
}
