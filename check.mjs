import {spawn} from 'node:child_process'
import {chromium} from 'playwright'

// Serves both builds, opens the host and prints its verdict line
const servers = ['preview:remote', 'preview:host'].map(s => spawn('npm', ['run', s], {stdio: 'ignore'}))
await new Promise(r => setTimeout(r, 2500))
const browser = await chromium.launch()
const page = await browser.newPage()
const lines = []
page.on('console', m => lines.push(m.text()))
page.on('pageerror', e => lines.push(`pageerror: ${e.message}`))
await page.goto('http://localhost:4180/')
await page.waitForFunction(() => !document.getElementById('out').textContent.startsWith('loading'), null, {timeout: 15000}).catch(() => {})
console.log(lines.filter(l => /RESULT|pageerror|registered/.test(l)).join('\n'))
console.log('page:', await page.textContent('#out'))
await browser.close()
servers.forEach(s => s.kill())
