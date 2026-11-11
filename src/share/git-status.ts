export type GitFileStatus = 'added' | 'modified' | 'deleted' | 'renamed' | 'conflicted'

export interface GitStatusResult {
  available: boolean,
  statuses: Record<string, GitFileStatus>,
}
