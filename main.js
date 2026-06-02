const { app, BrowserWindow, shell } = require("electron");
const { startServer } = require("./server");

let appServer;
let mainWindow;

async function createWindow() {
  const { server, url } = await startDesktopServer();
  appServer = server;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    title: "Chinese Tutor",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  await mainWindow.loadURL(url);
}

async function startDesktopServer() {
  const preferredPort = Number(process.env.CHINESE_TUTOR_PORT || 5177);
  const ports = Array.from({ length: 11 }, (_, index) => preferredPort + index);

  let lastError;
  for (const port of ports) {
    try {
      return await startServer(port);
    } catch (error) {
      lastError = error;
      if (error.code !== "EADDRINUSE" && error.code !== "EPERM") {
        throw error;
      }
    }
  }

  throw lastError || new Error("Unable to start the Chinese Tutor local server");
}

app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (appServer) {
    appServer.close();
    appServer = null;
  }
});
