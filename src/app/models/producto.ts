export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    descuento: number;
    imagen: string;
    stock: number;
    categoria: string;
    animando?: boolean;
}