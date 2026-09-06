import {instanceId, resolve} from 'aaa-runtime'

// An unshared workspace helper bundled into the remote: reads a host-registered service from the shared singleton
export function useService(key) { return `${resolve(key)} (via aaa-runtime copy ${instanceId})` }
