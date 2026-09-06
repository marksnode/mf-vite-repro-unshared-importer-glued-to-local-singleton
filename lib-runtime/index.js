// The singleton: one registry per copy of this module. A host registers services here; remotes must see the SAME copy.
const services = new Map()
export const instanceId = Math.random().toString(36).slice(2, 8)
export function register(key, value) { services.set(key, value) }
export function resolve(key) {
    if (!services.has(key)) throw new Error(`Service "${key}" is not registered in the container (copy ${instanceId})`)
    return services.get(key)
}
