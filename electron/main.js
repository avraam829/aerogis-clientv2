import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs'; // уже используется path — можно добавить рядом
import { fileURLToPath } from 'url';
import { SerialPort } from 'serialport';
import { startTelemetry, stopTelemetry } from './mavlink-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let telemetryStarted = false;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
});

ipcMain.handle('connect-mavlink', async () => {
  if (telemetryStarted) return { success: true, message: 'Уже подключено' };

  const ports = await SerialPort.list();
  if (ports.length === 0) {
    return { success: false, error: 'Нет доступных COM-портов' };
  }

  const selected = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ports.map((p) => p.path),
    message: 'Выберите COM-порт для подключения к MAVLink',
  });

  const portPath = ports[selected.response]?.path;
  if (!portPath) return { success: false, error: 'Порт не выбран' };

  telemetryStarted = true;

  startTelemetry(portPath, (msg) => {
    mainWindow.webContents.send('mavlink', msg);
  });

  return { success: true, port: portPath };
});

ipcMain.handle('disconnect-mavlink', async () => {
  if (!telemetryStarted) {
    return { success: false, error: 'Соединение не активно' };
  }

  stopTelemetry();
  telemetryStarted = false;
  return { success: true };
});


ipcMain.handle('save-waypoints', async (_event, waypoints) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Сохранить маршрут в формате Mission Planner',
    defaultPath: 'waypoints.waypoints',
    filters: [{ name: 'Waypoints', extensions: ['waypoints'] }]
  });

  if (!filePath) return { success: false, error: 'Файл не выбран' };

  try {
    const lines = ['QGC WPL 110'];

    waypoints.forEach((wp, index) => {
      const {
        lat,
        lng,
        alt
      } = wp;

      const seq = index;
      const current = index === 0 ? 1 : 0;
      const frame = 3;         // MAV_FRAME_GLOBAL_RELATIVE_ALT
      const command = 16;      // MAV_CMD_NAV_WAYPOINT
      const param1 = 0;
      const param2 = 0;
      const param3 = 0;
      const param4 = 0;
      const autocontinue = 1;

      lines.push(
        `${seq}\t${current}\t${frame}\t${command}\t${param1}\t${param2}\t${param3}\t${param4}\t${lat}\t${lng}\t${alt}\t${autocontinue}`
      );
    });

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

