import { Producto } from "./producto";

export interface ElementoCarrito {
    producto: Producto;
    cantidad: number;
}