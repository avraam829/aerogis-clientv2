const MAVLINK_STX_V2 = 0xFD;

export class MavlinkParser {
  constructor(onMessage) {
    this.buffer = [];
    this.state = 0;
    this.payloadLength = 0;
    this.payload = [];
    this.onMessage = onMessage;
  }

  parseByte(byte) {
    console.log("📥 Принят байт:", byte.toString(16).padStart(2, '0'));

    switch (this.state) {
      case 0:
        if (byte === MAVLINK_STX_V2) {
          this.state = 1;
          this.buffer = [byte];
        }
        break;
      case 1:
        this.payloadLength = byte;
        this.buffer.push(byte);
        this.state = 2;
        break;
      case 2: // incompat_flags
      case 3: // compat_flags
      case 4: // seq
      case 5: // sysid
      case 6: // compid
      case 7: // msgid[0]
      case 8: // msgid[1]
      case 9: // msgid[2]
        this.buffer.push(byte);
        if (this.buffer.length === 10) {
          this.state = 10;
          this.payload = [];
        }
        break;
      case 10: // payload
        this.payload.push(byte);
        this.buffer.push(byte);
        if (this.payload.length === this.payloadLength) {
          this.state = 11;
        }
        break;
      case 11: // checksum (2 байта)
        this.buffer.push(byte);
        if (this.buffer.length === this.payloadLength + 12) {
          // можно добавить подпись (signature), но пока пропустим

          const msgid =
            this.buffer[7] |
            (this.buffer[8] << 8) |
            (this.buffer[9] << 16);

          const msg = {
            msgid,
            payload: [...this.payload],
          };
          console.log("✅ MAVLink v2 сообщение:", msg);
          this.onMessage(msg);
          this.state = 0;
        }
        break;
      default:
        this.state = 0;
        break;
    }
  }

  parse(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      this.parseByte(buffer[i]);
    }
  }
}
