import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Categorias, Producto, Usuario, Sesion, ElementoCarrito } from "./modelos";

const DATOS_BASE = {
    "categorias": {
        "tazas": {
            "nombre": "Tazas",
            "imagen": "/assets/img/tazas.png"
        },
        "platos": {
            "nombre": "Platos",
            "imagen": "/assets/img/platos.png"
        },
        "maceteros": {
            "nombre": "Maceteros",
            "imagen": "/assets/img/maceteros.png"
        },
        "bowls": {
            "nombre": "Bowls",
            "imagen": "/assets/img/bowls.png"
        }
    },
    "productos": [
        //Tazas
        {
            "id": 1,
            "nombre": "Main Character Energy",
            "descripcion": "Una taza diseñada para aquellos que comienzan su día con energía.",
            "precio": 12990,
            "descuento": 0,
            "imagen": "/assets/img/tazas/taza.jpg",
            "stock": 15,
            "categoria": "tazas"
        },
        {
            "id": 2,
            "nombre": "But First Coffee",
            "descripcion": "Una taza diseñada para aquellos que no pueden conocer su día sin café",
            "precio": 12990,
            "descuento": 30,
            "imagen": "/assets/img/tazas/taza2.jpg",
            "stock": 30,
            "categoria": "tazas"
        },
        {
            "id": 3,
            "nombre": "Ask Me About My Cat",
            "descripcion": "Una taza diseñada para aquellos que aman hablar de sus gatos.",
            "precio": 12990,
            "descuento": 45,
            "imagen": "/assets/img/tazas/taza3.jpg",
            "stock": 8,
            "categoria": "tazas"
        },
        //Platos
        {
            "id": 4,
            "nombre": "Diseño Clásico",
            "descripcion": "Un plato con un diseño clásico y elegante.",
            "precio": 15990,
            "descuento": 0,
            "imagen": "/assets/img/platos/plato.jpg",
            "stock": 15,
            "categoria": "platos"
        },
        {
            "id": 5,
            "nombre": "But First Coffee",
            "descripcion": "Una taza diseñada para aquellos que no pueden conocer su día sin café",
            "precio": 12990,
            "descuento": 30,
            "imagen": "/assets/img/platos/plato2.jpg",
            "stock": 30,
            "categoria": "platos"
        },
        {
            "id": 6,
            "nombre": "Ask Me About My Cat",
            "descripcion": "Una taza diseñada para aquellos que aman hablar de sus gatos.",
            "precio": 12990,
            "descuento": 0,
            "imagen": "/assets/img/platos/plato3.jpg",
            "stock": 5,
            "categoria": "platos"
        },
        //Maceteros
        {
            "id": 7,
            "nombre": "Macetero de Diseño Montaña",
            "descripcion": "Un macetero con un diseño inspirado en la naturaleza.",
            "precio": 13000,
            "descuento": 15,
            "imagen": "/assets/img/maceteros/macetero.jpg",
            "stock": 15,
            "categoria": "maceteros"
        },
        {
            "id": 8,
            "nombre": "But First Coffee",
            "descripcion": "Una taza diseñada para aquellos que no pueden conocer su día sin café",
            "precio": 12990,
            "descuento": 30,
            "imagen": "/assets/img/maceteros/macetero2.jpg",
            "stock": 30,
            "categoria": "maceteros"
        },
        {
            "id": 9,
            "nombre": "Ask Me About My Cat",
            "descripcion": "Una taza diseñada para aquellos que aman hablar de sus gatos.",
            "precio": 12990,
            "descuento": 45,
            "imagen": "/assets/img/maceteros/macetero3.jpg",
            "stock": 8,
            "categoria": "maceteros"
        },
        //Bowls
        {
            "id": 10,
            "nombre": "Macetero de Diseño Montaña",
            "descripcion": "Un macetero con un diseño inspirado en la naturaleza.",
            "precio": 13000,
            "descuento": 15,
            "imagen": "/assets/img/bowls/bowl.jpg",
            "stock": 15,
            "categoria": "bowls"
        },
        {
            "id": 11,
            "nombre": "But First Coffee",
            "descripcion": "Una taza diseñada para aquellos que no pueden conocer su día sin café",
            "precio": 12990,
            "descuento": 30,
            "imagen": "/assets/img/bowls/bowl2.jpg",
            "stock": 30,
            "categoria": "bowls"
        },
        {
            "id": 12,
            "nombre": "Ask Me About My Cat",
            "descripcion": "Una taza diseñada para aquellos que aman hablar de sus gatos.",
            "precio": 12990,
            "descuento": 45,
            "imagen": "/assets/img/bowls/bowl3.jpg",
            "stock": 8,
            "categoria": "bowls"
        }
    ],
    "usuarios": [
        {
            "id": 1,
            "nombre": "Sebastian Corvalan",
            "username": "sebastian",
            "email": "seba@gmail.com",
            "password": "seba1234!",
            "fechaNacimiento": "1994-03-31",
            "direccion": "Los Duraznos #323",
            "role": "cliente",
        },
        {
            "id": 2,
            "nombre": "Administrador",
            "username": "admin",
            "email": "admin@animug.com",
            "password": "admin1234!",
            "fechaNacimiento": "1994-03-31",
            "direccion": "Los Admin #67",
            "role": "admin",
        }
    ]
} as const;

@Injectable({ providedIn: 'root' })
export class DataService {
    readonly KEYS = {
        productos: 'animug_productos',
        usuarios: 'animug_usuarios',
        carritos: 'animug_carritos',
        compras: 'animug_compras',
        sesion: 'animug_sesion'
    };

    readonly categorias: Record<string, Categorias> = this.clonar(DATOS_BASE.categorias) as Record<string, Categorias>;
    readonly productos: Producto[] = this.clonar(DATOS_BASE.productos) as unknown as Producto[];
    readonly usuarios: Usuario[] = this.clonar(DATOS_BASE.usuarios) as unknown as Usuario[];

    constructor() {
        this.inicializarDatos();
    }

    inicializarDatos(): void {
        if (!this.storageDisponible()) return;

        if (!localStorage.getItem(this.KEYS.productos)) {
            this.guardarProductos(this.productos);
        }
        if (!localStorage.getItem(this.KEYS.usuarios)) {
            this.guardarUsuarios(this.usuarios);
        }
        if (!localStorage.getItem(this.KEYS.carritos)) {
            this.guardarCarritos({});
        }
    }

    //Manejo de LocalStorage
    leerJSON<T>(clave: string, respaldo: T): T {
        if (!this.storageDisponible()) return this.clonar(respaldo);

        const valor = localStorage.getItem(clave);
        if (!valor) return this.clonar(respaldo);

        try {
            return JSON.parse(valor) as T;
        } catch {
            return this.clonar(respaldo);
        }
    }

    guardarJSON<T>(clave: string, valor: T): void {
        if (!this.storageDisponible()) return;

        localStorage.setItem(clave, JSON.stringify(valor));
    }

    //Productos
    getProductos(): Producto[] {
        return this.leerJSON<Producto[]>(this.KEYS.productos, this.productos).map(producto => ({
            ...producto,
            imagen: this.normalizarRutaImagen(producto.imagen)
        }));
    }

    getProductosPorCategoria(categoriaKey: string): Producto[] {
        return this.getProductos().filter(p => p.categoria.toLowerCase() === categoriaKey.toLowerCase());
    }

    guardarProductos(productos: Producto[]): void {
        const normalizados = productos.map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            descuento: Number(producto.descuento),
            stock: Number(producto.stock),
            imagen: this.normalizarRutaImagen(producto.imagen)
        }));

        this.guardarJSON(this.KEYS.productos, normalizados);
    }

    getProductoPorId(id: number | string | null): Producto | undefined {
        if (id === null || id === undefined || id === '') return undefined;

        return this.getProductos().find(producto => Number(producto.id) === Number(id));
    }

    //Metodos CRUD para productoPanel
    getProductosGlobales(): Producto[] {
        return this.getProductos();
    }

    agregarProductoGlobal(nuevoProducto: Omit<Producto, 'id'> & { id?: number | string }): void {
        const productosActuales = this.getProductos();

        // Usamos la función generarId que ya programaste en tu servicio
        const proximoId = this.generarId(productosActuales as unknown as Array<{ id: number }>);

        const productoFinal: Producto = {
            ...nuevoProducto,
            id: proximoId // Asignamos el ID numérico unificado
        } as unknown as Producto;

        productosActuales.push(productoFinal);
        this.guardarProductos(productosActuales);
    }

    actualizarProductoGlobal(productoEditado: Producto): void {
        const productosActuales = this.getProductos();
        const index = productosActuales.findIndex(p => Number(p.id) === Number(productoEditado.id));

        if (index !== -1) {
            productosActuales[index] = {
                ...productoEditado,
                id: productosActuales[index].id // Preservamos el ID original
            };
            this.guardarProductos(productosActuales);
        }
    }

    eliminarProductoGlobal(id: number | string): void {
        let productosActuales = this.getProductos();
        productosActuales = productosActuales.filter(p => Number(p.id) !== Number(id));
        this.guardarProductos(productosActuales);
    }

    //Usuarios y SessionStorage
    getUsuarios(): Usuario[] {
        return this.leerJSON<Usuario[]>(this.KEYS.usuarios, this.usuarios);
    }

    guardarUsuarios(usuarios: Usuario[]): void {
        this.guardarJSON(this.KEYS.usuarios, usuarios);
    }

    getUsuarioPorEmail(email: string): Usuario | undefined {
        const emailNormalizado = email.trim().toLowerCase();
        return this.getUsuarios().find(usuario => usuario.email.toLowerCase() === emailNormalizado);
    }

    getUsuarioPorId(id: number | string): Usuario | undefined {
        return this.getUsuarios().find(usuario => Number(usuario.id) === Number(id));
    }

    guardarSesion(usuario: Usuario): void {
        if (!this.sessionDisponible()) return;

        const sesion: Sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            username: usuario.username,
            email: usuario.email,
            fechaNacimiento: usuario.fechaNacimiento,
            direccion: usuario.direccion,
            role: usuario.role,
            logueado: true
        };

        sessionStorage.setItem(this.KEYS.sesion, JSON.stringify(sesion));
    }

    getSesion(): Sesion | null {
        if (!this.sessionDisponible()) return null;

        const valor = sessionStorage.getItem(this.KEYS.sesion);

        if (!valor) return null;

        try {
            return JSON.parse(valor) as Sesion;
        } catch {
            return null;
        }
    }

    cerrarSesion(): void {
        if (!this.sessionDisponible()) return;

        sessionStorage.removeItem(this.KEYS.sesion);
    }

    //Carrito de Compra por Usuario
    getCarritos(): Record<string, ElementoCarrito[]> {
        return this.leerJSON<Record<string, ElementoCarrito[]>>(this.KEYS.carritos, {});
    }

    guardarCarritos(carritos: Record<string, ElementoCarrito[]>): void {
        this.guardarJSON(this.KEYS.carritos, carritos);
    }

    getCarritoUsuario(email: string): ElementoCarrito[] {
        const carritos = this.getCarritos();
        return carritos[email] || [];
    }

    guardarCarritoUsuario(email: string, carrito: ElementoCarrito[]): void {
        const carritos = this.getCarritos();
        carritos[email] = carrito;
        this.guardarCarritos(carritos);
    }

    limpiarCarritoUsuario(correo: string): void {
        this.guardarCarritoUsuario(correo, []);
    }

    //Mis compras(en proceso)

    //Formateo precio
    formatearPrecio(valor: number): string {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(Number(valor));
    }

    //Calculo precio final
    calcularPrecioFinal(producto: Producto): number {
        if (!producto.descuento || Number(producto.descuento) === 0) {
            return Number(producto.precio);
        }
        return Math.round(Number(producto.precio) * (1 - Number(producto.descuento) / 100));
    }

    //Generar ID
    generarId(lista: Array<{ id: number }>): number {
        if (!lista.length) return 1;

        return Math.max(...lista.map(item => Number(item.id))) + 1;
    }

    //Categoria
    categoriaNombre(key: string): string {
        return this.categorias[key]?.nombre || key;
    }

    categoriaEntradas(): Array<{ key: string; categoria: Categorias }> {
        return Object.keys(this.categorias).map(key => ({
            key,
            categoria: this.categorias[key]
        }));
    }

    //Normalizar ruta imagenes
    normalizarRutaImagen(ruta: string): string {
        const limpia = (ruta || '').trim();
        if (limpia.startsWith('assets/')) return limpia;
        if (limpia.startsWith('src/assets/')) return limpia.replace('src/', '');
        if (limpia.startsWith('img/')) return limpia.replace('img/', 'assets/img/');
        if (limpia.startsWith('/img/')) return limpia.replace('/img/', 'assets/img/');

        return limpia || 'assets/img/logo.png';
    }

    private storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    private sessionDisponible(): boolean {
        return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
    }
    private clonar<T>(valor: T): T { return JSON.parse(JSON.stringify(valor)) as T; }
}