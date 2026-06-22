export type RolUsuario = 'admin' | 'cliente';
export type TipoMensaje = 'success' | 'danger' | 'warning' | 'info';

export interface Categorias {
    nombre: string;
    imagen: string;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    descuento: number;
    imagen: string;
    stock: number;
    categoria: string;
}

export interface ElementoCarrito {
    producto: Producto;
    cantidad: number;
}

export interface Usuario {
    id: number;
    nombre: string;
    username: string;
    email: string;
    password: string;
    fechaNacimiento: string;
    direccion: string;
    role: RolUsuario;
}

export interface Sesion {
    id: number;
    nombre: string;
    username: string;
    email: string;
    fechaNacimiento: string;
    direccion: string;
    role: RolUsuario;
    logueado: boolean;
}

export interface MensajeVista {
    tipo: TipoMensaje;
    texto: string;
}

