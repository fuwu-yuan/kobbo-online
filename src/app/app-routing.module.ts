import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RulesComponent} from "./pages/rules/rules.component";
import {IngameComponent} from "./pages/ingame/ingame.component";
import {HelpComponent} from "./pages/help/help.component";

const routes: Routes = [
  { path: '', component: IngameComponent },
  { path: 'rules', component: RulesComponent },
  { path: 'help', component: HelpComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
