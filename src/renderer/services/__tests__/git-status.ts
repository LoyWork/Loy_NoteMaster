const mocks = vi.hoisted(() => ({
  state: { currentRepo: undefined as { name: string, path: string } | undefined },
  fetch: vi.fn(),
}))
vi.mock('@fe/support/store', () => ({ default: { state: mocks.state } }))
vi.mock('@fe/support/api', () => ({ fetchGitStatus: mocks.fetch }))
import { gitStatuses, refreshGitStatus, resetGitStatus } from '../git-status'

beforeEach(() => {
  resetGitStatus()
  mocks.fetch.mockReset()
  mocks.state.currentRepo = { name: 'notes', path: '/notes' }
})

test('refreshes changed files and clears colors after a clean status', async () => {
  mocks.fetch.mockResolvedValueOnce({ available: true, statuses: { '/note.md': 'modified' } })
  await refreshGitStatus()
  expect(gitStatuses.value['/note.md']).toBe('modified')
  mocks.fetch.mockResolvedValueOnce({ available: true, statuses: {} })
  await refreshGitStatus()
  expect(gitStatuses.value).toEqual({})
})

test('ignores stale results after switching repositories and deduplicates polling', async () => {
  let resolveOld!: (value: any) => void
  mocks.fetch.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
  const old = refreshGitStatus()
  const duplicate = refreshGitStatus()
  expect(mocks.fetch).toHaveBeenCalledTimes(1)
  mocks.state.currentRepo = { name: 'new', path: '/new' }
  mocks.fetch.mockResolvedValueOnce({ statuses: { '/new.md': 'added' } })
  await refreshGitStatus()
  resolveOld({ statuses: { '/old.md': 'modified' } })
  await Promise.all([old, duplicate])
  expect(gitStatuses.value).toEqual({ '/new.md': 'added' })
})

test('clears colors when a repository is removed or Git becomes unavailable', async () => {
  gitStatuses.value = { '/note.md': 'modified' }
  mocks.fetch.mockRejectedValueOnce(new Error('offline'))
  await refreshGitStatus()
  expect(gitStatuses.value).toEqual({})
  mocks.state.currentRepo = undefined
  await refreshGitStatus()
  expect(gitStatuses.value).toEqual({})
})
