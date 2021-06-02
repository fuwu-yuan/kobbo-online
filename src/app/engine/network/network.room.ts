export interface NetworkRoom {
  uid: string;
  game: string;
  version: string;
  name: string;
  open: boolean;
  data: any;
  limit: number;
  players: any[];
}
