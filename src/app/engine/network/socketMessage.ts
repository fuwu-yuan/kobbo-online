export interface SocketMessage {
  /**
   * Sender UID
   */
  sender: string;
  /**
   * Receiver UID
   */
  to: string;
  code: string;
  data?: any;
}
