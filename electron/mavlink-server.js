import { SerialPort } from 'serialport';
import {
  MavLinkPacketSplitter,
  MavLinkPacketParser,
  minimal,
  common,
  ardupilotmega,
} from 'node-mavlink';

const REGISTRY = {
  ...minimal.REGISTRY,
  ...common.REGISTRY,
  ...ardupilotmega.REGISTRY,
};

let currentPort = null;

export function startTelemetry(portPath, onMessage) {
  console.log('📡 Подключаемся к:', portPath);

  currentPort = new SerialPort({ path: portPath, baudRate: 57600 });

  const reader = currentPort
    .pipe(new MavLinkPacketSplitter())
    .pipe(new MavLinkPacketParser());

  reader.on('data', (packet) => {
    const clazz = REGISTRY[packet.header.msgid];
    if (clazz) {
      const message = packet.protocol.data(packet.payload, clazz);
      if (message) {
        console.log('📦 Получено сообщение:', message.constructor.name);
        onMessage({
          type: message.constructor.name,
          msgid: packet.header.msgid,
          data: message,
        });
      }
    }
  });

  currentPort.on('open', () => {
    console.log('✅ Порт открыт:', portPath);
  });

  currentPort.on('error', (err) => {
    console.error('❌ Ошибка порта:', err);
  });
}

export function stopTelemetry() {
  if (currentPort && currentPort.isOpen) {
    currentPort.close((err) => {
      if (err) {
        console.error('❌ Ошибка при закрытии порта:', err);
      } else {
        console.log('🔌 Порт закрыт');
      }
    });
    currentPort = null;
  }
}
