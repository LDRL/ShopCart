export const SESSION_EXPIRED_EVENT = 'shopcart:session-expired'

interface AuthBridgeContract {
  getAccessToken: () => string | null
  setAccessToken: (accessToken: string) => void
  notifySessionExpired: () => void
}

const noop = (): undefined => undefined

const handlers: AuthBridgeContract = {
  getAccessToken: () => null,
  setAccessToken: noop,
  notifySessionExpired: noop,
}

export const registerAuthBridge = ( next: Partial<AuthBridgeContract>, ): void => {
  Object.assign(handlers, next)
}

export const authBridge: AuthBridgeContract = {
  getAccessToken: () => handlers.getAccessToken(),
  setAccessToken: (accessToken) => handlers.setAccessToken(accessToken),
  notifySessionExpired: () => handlers.notifySessionExpired(),
}
