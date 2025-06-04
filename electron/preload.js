const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mavlinkAPI", {
  onMessage: (cb) => ipcRenderer.on("mavlink", (_, data) => cb(data)),
  connect: () => ipcRenderer.invoke("connect-mavlink"),
  disconnect: () => ipcRenderer.invoke("disconnect-mavlink"),
  
});

contextBridge.exposeInMainWorld("electron", {
  saveWaypoints: (waypoints) => ipcRenderer.invoke("save-waypoints", waypoints),
});