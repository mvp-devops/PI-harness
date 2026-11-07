import { MockHarnessApi } from '@/mocks/mockApi'
import type { HarnessApi } from './contract'

export type ApiProviderId = 'mock'

/**
 * Single place where the data provider is chosen.
 *
 * To attach the real Pi RPC/WebSocket backend, add an implementation of
 * `HarnessApi` (e.g. `PiRpcHarnessApi`) and select it here — no screen or
 * component needs to change.
 */
export function createHarnessApi(provider: ApiProviderId = 'mock'): HarnessApi {
  switch (provider) {
    case 'mock':
      return new MockHarnessApi()
  }
}

/** Shared application instance. */
export const harnessApi: HarnessApi = createHarnessApi('mock')

export type { HarnessApi } from './contract'
