const mocks = vi.hoisted(() => ({
  fetchHttp: vi.fn(),
  getSetting: vi.fn(),
  registerHook: vi.fn(),
  action: vi.fn(),
}))
vi.mock('@fe/support/api', () => ({ fetchHttp: mocks.fetchHttp }))
vi.mock('@fe/services/setting', () => ({ getSetting: mocks.getSetting }))
vi.mock('@fe/core/hook', () => ({ registerHook: mocks.registerHook }))
vi.mock('@fe/core/action', () => ({ getActionHandler: mocks.action }))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

test('extensions can use former premium features without reading a license', async () => {
  const { getPurchased } = await import('../premium')
  expect(getPurchased()).toBe(true)
  expect(getPurchased(true)).toBe(true)
  expect(mocks.getSetting).not.toHaveBeenCalled()
  expect(mocks.fetchHttp).not.toHaveBeenCalled()
})

test('does not register startup verification or periodic license requests', async () => {
  const timer = vi.spyOn(globalThis, 'setInterval')
  try {
    await import('../premium')
    expect(mocks.registerHook).not.toHaveBeenCalled()
    expect(timer).not.toHaveBeenCalled()
    expect(mocks.fetchHttp).not.toHaveBeenCalled()
  } finally {
    timer.mockRestore()
  }
})

test('legacy extension purchase prompts have no effect', async () => {
  const { showPremium } = await import('../premium')
  showPremium()
  showPremium('activation')
  expect(mocks.action).not.toHaveBeenCalled()
  expect(mocks.fetchHttp).not.toHaveBeenCalled()
})
