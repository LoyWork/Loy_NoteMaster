import { shallowRef } from 'vue'
import type { GitFileStatus } from '@share/git-status'
import { fetchGitStatus } from '@fe/support/api'
import store from '@fe/support/store'

export const gitStatuses = shallowRef<Record<string, GitFileStatus>>({})
let generation = 0
let activeRepo = ''
let pending: Promise<void> | undefined

export function resetGitStatus () {
  generation++
  activeRepo = ''
  pending = undefined
  gitStatuses.value = {}
}

export async function refreshGitStatus () {
  const repo = store.state.currentRepo
  const identity = repo ? JSON.stringify([repo.name, repo.path]) : ''
  if (identity !== activeRepo) {
    resetGitStatus()
    activeRepo = identity
  }
  if (!repo || pending) return pending
  const requestGeneration = generation
  const request = (async () => {
    try {
      const result = await fetchGitStatus(repo.name)
      if (generation === requestGeneration) gitStatuses.value = result.statuses
    } catch (_) {
      if (generation === requestGeneration) gitStatuses.value = {}
    }
  })()
  pending = request
  try {
    await request
  } finally {
    if (pending === request) pending = undefined
  }
}
