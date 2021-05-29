import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Board} from "../board";
import {NetworkRoom} from './network.room';
import {NetworkResponse} from "./network.response";
import { environment } from '../../../environments/environment';
import {NetworkMessage} from "./network.message";

export class NetworkManager {

  private http: HttpClient;
  private board: Board;

  constructor(board: Board, http: HttpClient) {
    this.http = http;
    this.board = board;
  }

  private static HEADER = new HttpHeaders({
    'Accept': 'application/json',
    'rejectUnauthorized': 'false',
  });

  public roomuid: string = "";

  joinRoom(uid: string) {
    return new Promise<NetworkResponse>((resolve, reject) => {
      try {
        const subject: WebSocketSubject<NetworkMessage> = webSocket(environment.wsUrl + uid);
        subject.subscribe(
          (msg: NetworkMessage) => {
            console.log(msg);
            switch (msg.code) {
              case "player_join":
                this.board.step.onPlayerJoin(msg.data);
                break;
              case "broadcast":
                this.board.step.onNetworkMessage(msg.data);
                break;
              case "connected":
                resolve({status:"success", code: "connected"});
                break;
            }
          },
          err => {
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

  createRoom(name: string, autojoinroom = true): Promise<NetworkResponse> {
    console.log("Creating room " + name);
    let self = this;
    return new Promise<NetworkResponse>((resolve, reject) => {
      self.http.post<NetworkResponse>(`${environment.apiUrl}/room`, {
        game: self.board.name,
        version: self.board.version,
        name: name
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
    return this.http.get<NetworkRoom[]>(`${environment.apiUrl}/room/${this.roomuid}`, {
      headers: NetworkManager.HEADER,
      params: {

      }
    });
  }

  getClosedRooms() {
    let header = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'rejectUnauthorized': 'false',
      })
    };
    return this.http.get<NetworkRoom[]>(`${environment.apiUrl}/room/data/${this.roomuid}`, header);
  }
}
