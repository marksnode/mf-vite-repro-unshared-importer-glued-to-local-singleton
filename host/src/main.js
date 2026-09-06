import {instanceId, register} from 'aaa-runtime'

register('localSettings', 'settings-from-host')
console.log(`host registered localSettings in aaa-runtime copy ${instanceId}`)
try {
    const {widget} = await import('remote/widget')
    const text = widget()
    document.getElementById('out').textContent = `OK: ${text}`
    console.log(`RESULT OK: ${text}`)
} catch (error) {
    document.getElementById('out').textContent = `FAIL: ${error.message}`
    console.log(`RESULT FAIL: ${error.message}`)
}
