import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {Board} from "../board";
import {NetworkRoom} from './network.room';
import {NetworkResponse} from "./network.response";
import { environment } from '../../../environments/environment';
import {SocketMessage} from "./socketMessage";
import {AxiosResponse, default as axios} from 'axios';

export class NetworkManager {

  private api;
  private board: Board;
  private ws: WebSocketSubject<SocketMessage>|null = null;
  public roomuid: string = "";

  constructor(board: Board) {
    this.board = board;
    this.checkPageReload();
    this.api = axios.create({
      baseURL: environment.apiUrl,
      timeout: 1000,
      headers: {
        'Accept': 'application/json',
        'rejectUnauthorized': 'false',
      }
    });
  }

  joinRoom(uid: string): Promise<NetworkResponse> {
    return new Promise<NetworkResponse>((resolve, reject) => {
      try {
        this.ws = webSocket(environment.wsUrl + uid);
        this.ws.subscribe(
          (msg: SocketMessage) => {
            switch (msg.code) {
              case "player_join":
                this.board.step.onPlayerJoin(msg);
                break;
              case "player_leave":
                this.board.step.onPlayerLeave(msg);
                break;
              case "broadcast":
                this.board.step.onNetworkMessage(msg);
                break;
              case "connected":
                resolve({status:"success", code: "connected", data: msg.data});
                break;
              case "room_full":
                resolve({status:"error", code: "room_full", data: msg.data});
                break;
            }
          },
          err => {
            if (err instanceof CloseEvent) {
              this.board.step.onConnectionClosed();
            }
            console.log(err);
            reject();
          },
          this.board.step.onConnectionClosed
        );
      }catch(e) {
        reject(e);
      }
    });
  }

  createRoom(name: string, limit = 0, autojoinroom = true): Promise<NetworkResponse> {
    console.log("Creating room " + name);
    return this.api.post<any, AxiosResponse<NetworkResponse>>('/room', {
      game: this.board.name,
      version: this.board.version,
      name: name,
      limit: limit
    }).then((response) => {
      this.roomuid = response.data.data.uid;
      if (autojoinroom) {
        return this.joinRoom(this.roomuid);
      }else {
        return response.data;
      }
    });
  }

  setRoomData(data: any): Promise<NetworkResponse> {
    return this.api.post<any, AxiosResponse<NetworkResponse>>('/room/data/'+this.roomuid, {
      data: data,
    }).then(function(response) {
      return response.data;
    });
  }

  closeRoom(uid: string, close: boolean = true): Promise<NetworkResponse> {
    return this.api.post<any, AxiosResponse<NetworkResponse>>('/room/close/'+this.roomuid, {
      close: close,
    }).then(function(response) {
      return response.data;
    });
  }

  openRoom(uid: string): Promise<NetworkResponse> {
    return this.closeRoom(uid, false);
  }

  getOpenedRooms(): Promise<{status:string,servers:NetworkRoom[]}> {
    return this.api.get<any, AxiosResponse<{status:string,servers:NetworkRoom[]}>>('/room', {
      params: {
        open: true,
        game: this.board.name,
        version: this.board.version
      }
    }).then(function(response) {
      return response.data;
    });
  }

  getClosedRooms(): Promise<{status:string,servers:NetworkRoom[]}> {
    return this.api.get<any, AxiosResponse<{status:string,servers:NetworkRoom[]}>>('/room', {
      params: {
        open: false,
        game: this.board.name,
        version: this.board.version
      }
    }).then(function(response) {
      return response.data;
    });
  }

  private checkPageReload() {
    window.addEventListener("beforeunload", (event) => {
      console.log("The page is refreshing");
      if (this.ws) {
        this.ws.unsubscribe();
      }
    });
  }
}
