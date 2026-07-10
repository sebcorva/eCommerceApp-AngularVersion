import { ElementoCarrito } from './elemento-carrito';

export interface Compra {
    id?: number | string;
    emailUsuario: string;
    nombreUsuario: string;
    fecha: string;
    items: ElementoCarrito[];
    total: number;
    estado: 'Pendiente' | 'Despachado' | 'Entregado';
}
