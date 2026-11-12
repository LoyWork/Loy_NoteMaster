import type { Plugin } from '@fe/context'

export default {
  name: 'status-bar-confetti',
  register: ctx => {
    ctx.action.registerAction({
      name: 'plugin.status-bar-confetti.show',
      description: ctx.i18n.t('premium.confetti'),
      forUser: true,
      forMcp: true,
      mcpDescription: 'Show confetti celebration. No args. No return.',
      handler: () => ctx.lib.confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 2.1e8,
      }),
    })
  },
} as Plugin
