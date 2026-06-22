import { Routes } from '@angular/router';
import { Header } from './pages/header/header';
import { Login } from './pages/login/login';
import { Footer } from './pages/footer/footer';
import { Home } from './pages/home/home';
import { Registro } from './pages/registro/registro';
import { Recuperar } from './pages/recuperar/recuperar';
import { Perfil } from './pages/perfil/perfil';
import { Carrito } from './pages/carrito/carrito';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { ProductoPanel } from './pages/producto-panel/producto-panel';
import { Categoria } from './pages/categoria/categoria';

export const routes: Routes = [
    { path: 'header', component: Header },
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    { path: 'recuperar', component: Recuperar },
    { path: 'footer', component: Footer },
    { path: 'home', component: Home },
    { path: 'perfil', component: Perfil },
    { path: 'carrito', component: Carrito },
    { path: 'adminPanel', component: AdminPanel },
    { path: 'productoPanel', component: ProductoPanel },
    { path: 'categoria/:nombre', component: Categoria },
    { path: '**', redirectTo: 'home' }
];
