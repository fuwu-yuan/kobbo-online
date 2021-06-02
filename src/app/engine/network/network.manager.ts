import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Board} from "../board";
import {NetworkRoom} from './network.room';
import {NetworkResponse} from "./network.response";
import { environment } from '../../../environments/environment';
import {SocketMessage} from "./socketMessage";

export class NetworkManager {

  private http: HttpClient;
  private board: Board;
  private ws: WebSocketSubject<SocketMessage>|null = null;
  private static HEADER = new HttpHeaders({
    'Accept': 'application/json',
    'rejectUnauthorized': 'false',
  });
  public roomuid: string = "";

  constructor(board: Board, http: HttpClient) {
    this.http = http;
    this.board = board;
    this.checkPageReload();
  }

  joinRoom(uid: string) {
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
    let self = this;
    return new Promise<NetworkResponse>((resolve, reject) => {
      self.http.post<NetworkResponse>(`${environment.apiUrl}/room`, {
        game: self.board.name,
        version: self.board.version,
        name: name,
        limit: limit
      }, {headers: NetworkManager.HEADER})
        .subscribe(
          response => {
            this.roomuid = response.data.uid;
            if (autojoinroom) {
              self.joinRoom(response.data.uid).then(resolve).catch(reject);
            }else {
              resolve(response);
            }
          },
          (error: HttpErrorResponse) => {
            reject({ status: "error", code: "internal_error", message: error.message, data: error });
          }
        );
    });
  }

  setRoomData(data: any) {
    return this.http.post<any>(`${environment.apiUrl}/room/data/${this.roomuid}`, {
      data: data
    }, {headers: NetworkManager.HEADER});
  }

  closeRoom(uid: string, close: boolean = true) {
    return this.http.post<any>(`${environment.apiUrl}/room/close/${this.roomuid}`, {
      close: close
    }, {headers: NetworkManager.HEADER});
  }

  openRoom(uid: string) {
    this.closeRoom(uid, false);
  }

  getOpenedRooms() {
    return this.http.get<{status:string,servers:NetworkRoom[]}>(`${environment.apiUrl}/room`, {
      headers: NetworkManager.HEADER,
      params: {
        "open": "true",
        "game": this.board.name,
        "version": this.board.version
      }
    });
  }

  getClosedRooms() {
    return this.http.get<{status:string,servers:NetworkRoom[]}>(`${environment.apiUrl}/room`, {
      headers: NetworkManager.HEADER,
      params: {
        "open": "false",
        "game": this.board.name,
        "version": this.board.version
      }
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
