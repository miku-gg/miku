const http = require('http');
const { exec } = require('child_process');

const { app, BrowserWindow } = require('electron');

function createWindow() {
  console.log('Starting Vite server...');
  const serverProcess = exec('pnpm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  serverProcess.on('error', (error) => {
    console.error(`exec error: ${error}`);
  });

  // Check if the server is running
  const checkServer = setInterval(() => {
    http
      .get('http://localhost:8182/index.html', (res) => {
        const { statusCode } = res;
        console.log('Server is running...', statusCode, res.headers['content-type'], res.headers['content-length']);

        if (statusCode === 200) {
          clearInterval(checkServer);

          const win = new BrowserWindow({
            width: 1200,
            height: 600,
            webPreferences: {
              contextIsolation: true,
              webSecurity: false, // disable webSecurity
              allowRunningInsecureContent: true, // allow running insecure content
            },
          });

          win.loadURL('http://localhost:8182');
        }
      })
      .on('error', (err) => {
        console.log('Waiting for the server start...', err);
      });
  }, 2000);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
