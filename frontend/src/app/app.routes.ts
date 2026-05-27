import { Routes } from '@angular/router';
import { SenderCreateSharePageComponent } from './features/acceptance/sender-create-share.page';
import { ReceiverAcceptPageComponent } from './features/acceptance/receiver-accept.page';

export const APP_ROUTES: Routes = [
    { path: '', component: SenderCreateSharePageComponent },
    { path: 'accept/:acceptanceToken', component: ReceiverAcceptPageComponent },
];
