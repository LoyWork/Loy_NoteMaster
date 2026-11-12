// electron-builder.fork.json adds this flag only to the fork's packaged app.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const forkRelease = !!require('../../package.json').loyNoteMaster
export const forkRepository = { owner: 'LoyWork', repo: 'Loy_NoteMaster' }
export const forkReleaseUrl = 'https://github.com/LoyWork/Loy_NoteMaster/releases'
