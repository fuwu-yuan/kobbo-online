import {Component} from '@angular/core';
import {Kobbo} from "./game/Kobbo";
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faMailBulk } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Kobbo - Le meilleur jeu de cartes';
  currentYear: number = new Date().getFullYear();
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faLinkedin = faLinkedin;
  faMailBulk = faMailBulk;

  getNameAndVersion() {
    return `${Kobbo.GAME_NAME} v${Kobbo.GAME_VERSION}`;
  }
}
