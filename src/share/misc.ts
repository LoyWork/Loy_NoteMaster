import { Language, translate } from './i18n'

export const MARKDOWN_FILE_EXT = '.md'
export const MARKDOWN_X_FILE_EXT = '.mdx'
export const MARKDOWN_LONG_FILE_EXT = '.markdown'
export const ENCRYPTED_MARKDOWN_FILE_EXT = '.c.md'

export const DOC_HISTORY_MAX_CONTENT_LENGTH = 102400

export const ROOT_REPO_NAME_PREFIX = '__root__'

export const DEFAULT_EXCLUDE_REGEX = '^node_modules/$|^\\.git/$|^\\.DS_Store$'

export const API_BASE_URL = 'https://yank-note.com'
export const HOMEPAGE_URL = 'https://yank-note.com'
export const GUIDE_URL = 'https://help.yank-note.com'

export function isMarkdownFile (path: string) {
  return path.endsWith(MARKDOWN_FILE_EXT) ||
    path.endsWith(MARKDOWN_X_FILE_EXT) ||
    path.endsWith(MARKDOWN_LONG_FILE_EXT)
}

export function isEncryptedMarkdownFile (path: string) {
  return path.endsWith(ENCRYPTED_MARKDOWN_FILE_EXT)
}

export function getDefaultApplicationAccelerators (platform: NodeJS.Platform, lang: Language = 'en') {
  return [
    {
      command: 'show-main-window',
      accelerator: platform === 'darwin' ? 'Shift+Alt+M' : 'Meta+Alt+N',
      description: translate(lang, 'app.tray.open-main-window')
    },
    {
      command: 'hide-main-window',
      accelerator: null,
      description: translate(lang, 'app.hide-main-window'),
    },
    {
      command: 'open-in-browser',
      accelerator: 'Meta+Shift+B',
      description: translate(lang, 'app.tray.open-in-browser')
    }
  ] as {command: 'show-main-window' | 'hide-main-window' | 'open-in-browser', accelerator: string | null, description: string}[]
}

export function isNormalRepoName (repoName: string) {
  return !repoName.startsWith('__')
}
