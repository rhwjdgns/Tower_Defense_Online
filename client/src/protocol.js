const protobuf = require('protobufjs');
const root = protobuf.Root.fromJSON(require('./compiled_game.json')); // compiled_game.json은 game.proto를 컴파일한 결과 파일

const GamePacket = root.lookupType("GamePacket");

export const PacketType = {
  C2S_MONSTER_ATTACK_BASE: 15,
  S2C_UPDATE_BASE_HP: 16,
  // 다른 패킷 타입들
};

// 서버 소켓 연결
export const serverSocket = new WebSocket('ws://yourserveraddress');

serverSocket.onopen = function() {
  console.log('WebSocket Client Connected');
};

serverSocket.onmessage = function(event) {
  const data = ProtocolBuffer.decode(event.data);
  handlePacket(data);
};

// ProtocolBuffer 인코딩/디코딩 함수
export const ProtocolBuffer = {
  encode: function(packet) {
    const errMsg = GamePacket.verify(packet);
    if (errMsg) {
      throw Error(errMsg);
    }
    const message = GamePacket.create(packet);
    return GamePacket.encode(message).finish();
  },
  decode: function(data) {
    const message = GamePacket.decode(data);
    return GamePacket.toObject(message, {
      longs: String,
      enums: String,
      bytes: String
    });
  }
};

// 패킷 처리 함수
function handlePacket(packet) {
  switch(packet.packetType) {
    case PacketType.S2C_UPDATE_BASE_HP:
      // 기지 HP 업데이트 처리
      break;
    // 다른 패킷 타입 처리
  }
}
