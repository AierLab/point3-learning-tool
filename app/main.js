const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const net = require('net')
const { spawn } = require('child_process')

const isDev = process.argv.includes('--dev')
const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE
  || (process.platform === 'win32' ? 'python' : 'python3')

let flaskProcess = null

function waitForPort (port, retries = 40, interval = 250) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const socket = net.createConnection(port, '127.0.0.1')
      socket.once('connect', () => {
        socket.end()
        resolve()
      })
      socket.once('error', () => {
        socket.destroy()
        if (remaining <= 0) {
          reject(new Error(`Port ${port} not available`))
          return
        }
        setTimeout(() => attempt(remaining - 1), interval)
      })
    }
    attempt(retries)
  })
}

async function ensureFlaskServer () {
  if (isDev) {
    await waitForPort(5000).catch((err) => {
      console.error(`Waiting for Flask dev server failed: ${err.message}`)
    })
    return
  }

  if (flaskProcess) {
    return
  }

  const flaskScript = path.join(__dirname, 'backend', 'app.py')

  console.log(`Starting Flask server with "${PYTHON_EXECUTABLE}"...`)
  flaskProcess = spawn(
    PYTHON_EXECUTABLE,
    [flaskScript],
    {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit'
    }
  )

  flaskProcess.on('close', (code) => {
    console.log(`Flask server exited with code ${code}`)
    flaskProcess = null
  })

  await waitForPort(5000).catch((err) => {
    console.error(`Waiting for Flask server failed: ${err.message}`)
  })
}

async function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/')
  } else {
    const indexPath = path.join(__dirname, 'client', 'build', 'index.html')
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      mainWindow.loadURL('data:text/html;charset=utf-8,' +
        encodeURIComponent('<h2>Build not found</h2><p>Please run "npm run build" before starting Electron.</p>'))
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })
}

app.whenReady().then(async () => {
  await ensureFlaskServer()
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (flaskProcess) {
      flaskProcess.kill()
    }
    app.quit()
  }
})

app.on('will-quit', () => {
  if (flaskProcess) {
    flaskProcess.kill()
  }
})
