import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Categorias } from '../models/categoria';
import { Producto } from '../models/producto';
import { Usuario } from '../models/usuario';
import { Sesion } from '../models/sesion';
import { ElementoCarrito } from '../models/elemento-carrito';

/**
 * Constante estática con los datos de inicialización por defecto del sistema aniMug.
 * Contiene el catálogo inicial estructurado por categorías, lista de productos base y cuentas de prueba.
 */
/* const DATOS_BASE = {
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
            "role": "cliente"
        },
        {
            "id": 2,
            "nombre": "Administrador",
            "username": "admin",
            "email": "admin@animug.com",
            "password": "admin1234!",
            "fechaNacimiento": "1994-03-31",
            "direccion": "Los Admin #67",
            "role": "admin"
        }
    ]
} as const; */

/**
 * Servicio encargado de centralizar, persistir y transformar los datos operacionales de la tienda.
 * Actúa como una capa de abstracción sobre `localStorage` y `sessionStorage`, garantizando la sincronización
 * segura del estado en el navegador y resolviendo cálculos de precios y lógicas CRUD globales.
 */
@Injectable({ providedIn: 'root' })
export class DataService {

    private readonly API_URL = 'http://localhost:3000';

    readonly KEYS = {
        carritos: 'animug_carritos',
        sesion: 'animug_sesion'
    }
    /** Señales reactivas para la sesión y el carrito del usuario. */
    readonly sesionSignal = signal<Sesion | null>(null);
    readonly carritoSignal = signal<ElementoCarrito[]>([]);

    constructor(private http: HttpClient) {
        const sesion = this.getSesion();
        this.sesionSignal.set(sesion);
        if (sesion && sesion.email) {
            this.carritoSignal.set(this.getCarritoUsuario(sesion.email));
        } else {
            this.carritoSignal.set([]);
        }
    }

    /**
     * Obtiene el listado completo de categorías disponibles para la venta.
     * @returns {Observable<Record<string, Categorias>>} Un observable que emite el listado de categorías.
     */
    getCategorias(): Observable<Record<string, Categorias>> {
        return this.http.get<Record<string, Categorias>>(`${this.API_URL}/categorias`);
    }
    /**
     * Recupera y normaliza las imágenes de productos.
     * @returns {Observable<Producto[]>} Un observable que emite el listado de productos mapeados.
     */
    getProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.API_URL}/productos`).pipe(
            map(productos => productos.map(producto => ({
                ...producto,
                imagen: this.normalizarRutaImagen(producto.imagen)
            })))
        );
    }
    /** Obtener producto por ID */
    getProductoPorId(id: number | string): Observable<Producto> {
        return this.http.get<Producto>(`${this.API_URL}/productos/${id}`).pipe(
            map(producto => ({
                ...producto,
                imagen: this.normalizarRutaImagen(producto.imagen)
            }))
        );
    }
    /** 
     * Obtener productos por categoría
     * @param categoriaKey
     * @returns Observable<Producto[]> 
     */
    getProductosPorCategoria(categoriaKey: string): Observable<Producto[]> {
        return this.getProductos().pipe(
            map(productos => productos.filter(p => p.categoria.toLowerCase() === categoriaKey.toLowerCase()))
        );
    }

    /** Agregar producto mediante POST */
    agregarProductoGlobal(nuevoProducto: Omit<Producto, 'id'>): Observable<Producto> {
        return this.http.post<Producto>(`${this.API_URL}/productos`, nuevoProducto);
    }

    /** Actualizar producto mediante PUT */
    actualizarProductoGlobal(productoEditado: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.API_URL}/productos/${productoEditado.id}`, productoEditado);
    }

    /** Eliminar producto mediante DELETE */
    eliminarProductoGlobal(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/productos/${id}`);
    }

    /**
     * Recupera el conjunto completo de usuarios registrados en el servidor remoto.
     */
    getUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.API_URL}/usuarios`);
    }

    /**
     * Registra/Guarda de forma remota un nuevo usuario en la API Rest.
     */
    guardarUsuarios(nuevoUsuario: Omit<Usuario, 'id'>): Observable<Usuario> {
        return this.http.post<Usuario>(`${this.API_URL}/usuarios`, nuevoUsuario);
    }
    /**
     * Busca un usuario específico usando su correo electrónico mediante Query Params remotos.
     */
    getUsuarioPorEmail(email: string): Observable<Usuario | undefined> {
        const emailNormalizado = email.trim().toLowerCase();
        return this.http.get<Usuario[]>(`${this.API_URL}/usuarios?email=${emailNormalizado}`).pipe(
            map(usuarios => usuarios.length > 0 ? usuarios[0] : undefined)
        );
    }

    /**
     * Localiza a un usuario específico mediante la comparación directa de su ID numérico remoto.
     */
    getUsuarioPorId(id: number | string): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.API_URL}/usuarios/${id}`);
    }


    /**
     * Recupera y parsea un objeto JSON guardado en el almacenamiento del navegador de manera segura.
     * @param {string} clave Identificador único del registro en LocalStorage.
     * @param {T} respaldo Estructura por defecto que retornará en caso de fallo o inexistencia.
     * @returns {T} Los datos recuperados tipados correctamente o el elemento de respaldo clonado.
     */
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
    /**
     * Serializa y guarda cualquier estructura de datos dentro de LocalStorage de manera segura.
     * @param {string} clave Identificador único del registro en LocalStorage.
     * @param {T} valor El objeto o arreglo que se desea almacenar.
     */
    guardarJSON<T>(clave: string, valor: T): void {
        if (!this.storageDisponible()) return;

        localStorage.setItem(clave, JSON.stringify(valor));
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
        this.sesionSignal.set(sesion);
        this.carritoSignal.set(this.getCarritoUsuario(usuario.email));
    }
    /**
     * Extrae el estado actual de la sesión desde SessionStorage controlando errores de casteo de objetos.
     * @returns {Sesion | null} Estructura de sesión del usuario logueado o `null` si no se registra actividad.
     */
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
    /**
     * Destruye de forma definitiva las credenciales temporales de sesión activas en SessionStorage.
     */
    cerrarSesion(): void {
        if (!this.sessionDisponible()) return;

        sessionStorage.removeItem(this.KEYS.sesion);
        this.sesionSignal.set(null);
        this.carritoSignal.set([]);
    }
    /**
     * Recupera el mapa relacional completo de todos los carritos registrados por los usuarios del sistema.
     * @returns {Record<string, ElementoCarrito[]>} Diccionario indexado por el correo del usuario con sus respectivos carritos.
     */
    getCarritos(): Record<string, ElementoCarrito[]> {
        return this.leerJSON<Record<string, ElementoCarrito[]>>(this.KEYS.carritos, {});
    }
    /**
     * Guarda en LocalStorage las actualizaciones de los estados globales de los carritos.
     * @param {Record<string, ElementoCarrito[]>} carritos Diccionario indexado a guardar.
     */
    guardarCarritos(carritos: Record<string, ElementoCarrito[]>): void {
        this.guardarJSON(this.KEYS.carritos, carritos);
    }
    /**
     * Obtiene de forma única la lista de artículos guardados en el carrito pertenecientes a un usuario en específico.
     * @param {string} email Correo electrónico identificador del usuario propietario.
     * @returns {ElementoCarrito[]} Arreglo de artículos añadidos al carrito.
     */
    getCarritoUsuario(email: string): ElementoCarrito[] {
        const carritos = this.getCarritos();
        return carritos[email] || [];
    }
    /**
     * Actualiza o inserta el carrito de compras particular de un usuario asociándolo unívocamente a su email.
     * @param {string} email Identificador del cliente.
     * @param {ElementoCarrito[]} carrito Lista actualizada de artículos agregados.
     */
    guardarCarritoUsuario(email: string, carrito: ElementoCarrito[]): void {
        const carritos = this.getCarritos();
        carritos[email] = carrito;
        this.guardarCarritos(carritos);
        const sesion = this.getSesion();
        if (sesion && sesion.email === email) {
            this.carritoSignal.set([...carrito]);
        }
    }
    /**
     * Vacía por completo el carro de compras activo de un cliente dejándolo como un arreglo vacío.
     * @param {string} correo Correo electrónico del cliente.
     */
    limpiarCarritoUsuario(correo: string): void {
        this.guardarCarritoUsuario(correo, []);
    }

    //Mis compras(en proceso)

    /**
     * Aplica reglas de localización internacional utilizando el estándar 'es-CL' para formatear números en formato de moneda chilena (CLP).
     * @param {number} valor Monto numérico en bruto.
     * @returns {string} Cadena formateada bajo la máscara de divisa nacional (ej. $12.990).
     */
    formatearPrecio(valor: number): string {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(Number(valor));
    }
    /**
     * Calcula de forma matemática el costo real final de un ítem procesando el porcentaje de descuento asignado.
     * @param {Producto} producto Objeto del producto analizado.
     * @returns {number} Precio numérico final redondeado con `Math.round`.
     */
    calcularPrecioFinal(producto: Producto): number {
        if (!producto.descuento || Number(producto.descuento) === 0) {
            return Number(producto.precio);
        }
        return Math.round(Number(producto.precio) * (1 - Number(producto.descuento) / 100));
    }
    /**
     * Normaliza rutas de strings de imágenes arbitrarias para asegurar que cumplan de forma uniforme el estándar relacional de carpetas internas de Angular (`assets/img/`).
     * @param {string} ruta Dirección física o virtual guardada del recurso gráfico.
     * @returns {string} Ruta normalizada y válida hacia los recursos o imagen del logo por defecto.
     */
    normalizarRutaImagen(ruta: string): string {
        const limpia = (ruta || '').trim();
        if (limpia.startsWith('assets/')) return limpia;
        if (limpia.startsWith('src/assets/')) return limpia.replace('src/', '');
        if (limpia.startsWith('img/')) return limpia.replace('img/', 'assets/img/');
        if (limpia.startsWith('/img/')) return limpia.replace('/img/', 'assets/img/');

        return limpia || 'assets/img/logo.png';
    }
    /**
     * Valida si el contexto global de ejecución posee acceso nativo a la API de `window` y de `localStorage` de forma segura frente a escenarios SSR.
     * @returns {boolean} `true` si se puede interactuar con el almacenamiento del navegador en el hilo de ejecución actual.
     */
    private storageDisponible(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }
    /**
     * Valida si el contexto global de ejecución posee acceso seguro a la API de `sessionStorage`.
     * @returns {boolean} `true` si está disponible de forma nativa.
     */
    private sessionDisponible(): boolean {
        return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
    }
    /**
     * Rompe de forma intencional la referencia en memoria de un objeto o arreglo creando una copia idéntica e independiente mediante serialización por texto.
     * @param {T} valor Estructura de origen a clonar.
     * @returns {T} Una nueva copia profunda sin referencias cruzadas al original.
     */
    private clonar<T>(valor: T): T { return JSON.parse(JSON.stringify(valor)) as T; }

    obtenerTotalItemsCarrito(emailUsuario: string): number {
        const carrito = this.getCarritoUsuario(emailUsuario);
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}