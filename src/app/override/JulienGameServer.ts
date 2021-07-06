import {AbstractNetworkManager, Network} from "@fuwu-yuan/bgew";

export class JulienGameServer extends AbstractNetworkManager{
  _apiUrl: string = ""; //TODO
  _wsUrl: string = ""; //TODO

  closeRoom(uid: string, close: boolean): Promise<Network.Response> {
    return Promise.resolve({status: "error", code: "not_implemented"});
  }

  createRoom(name: string, limit: number, autojoinroom: boolean): Promise<Network.Response> {
    return Promise.resolve({status: "error", code: "not_implemented"});
  }

  getClosedRooms(): Promise<{ status: string; servers: Network.Room[] }> {
    return Promise.resolve({servers: [], status: "error", code: "not_implemented"});
  }

  getOpenedRooms(): Promise<{ status: string; servers: Network.Room[] }> {
    return Promise.resolve({servers: [], status: "error", code: "not_implemented"});
  }

  joinRoom(uid: string): Promise<Network.Response> {
    return Promise.resolve({status: "error", code: "not_implemented"});
  }

  setRoomData(data: any): Promise<Network.Response> {
    return Promise.resolve({status: "error", code: "not_implemented"});
  }

  getRoomData(): Promise<Network.Response> {
    return Promise.resolve({status: "error", code: "not_implemented"});
  }

  ping(): Promise<string> {
    return Promise.resolve("not_implemented");
  }
}
