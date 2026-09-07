const encoder = new TextEncoder();

export type CloseableWebSocket = {
  close(code?: number, reason?: string): void;
};

export function cleanReason(value: unknown): string {
  const source = (typeof value === "string" ? value : "").trim();
  let result = "";
  let bytes = 0;
  for (const character of source) {
    const characterBytes = encoder.encode(character).byteLength;
    if (bytes + characterBytes > 123) {
      break;
    }
    result += character;
    bytes += characterBytes;
  }
  return result;
}

export function validCloseCode(code: number): boolean {
  return (
    code === 1000 ||
    (code >= 1001 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

export function safeClose(socket: CloseableWebSocket, code: number, reason: string): void {
  const safeCode = validCloseCode(code) ? code : 1000;
  const safeReason = cleanReason(reason);
  try {
    socket.close(safeCode, safeReason);
  } catch {
    try {
      socket.close(1000, safeReason);
    } catch {
      try {
        socket.close();
      } catch {
        // Closing is best-effort after a peer has already failed.
      }
    }
  }
}
