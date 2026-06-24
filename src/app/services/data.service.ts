import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Categorias, Producto, Usuario, Sesion, ElementoCarrito } from "./modelos";

/**
 * Constante estática con los datos de inicialización por defecto del sistema aniMug.
 * Contiene el catálogo inicial estructurado por categorías, lista de productos base y cuentas de prueba.
 */
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

/**
 * Servicio encargado de centralizar, persistir y transformar los datos operacionales de la tienda.
 * Actúa como una capa de abstracción sobre `localStorage` y `sessionStorage`, garantizando la sincronización
 * segura del estado en el navegador y resolviendo cálculos de precios y lógicas CRUD globales.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
    /**
     * Diccionario estático que define las llaves exclusivas para la persistencia en la Web Storage API.
     */
    readonly KEYS = {
        productos: 'animug_productos',
        usuarios: 'animug_usuarios',
        carritos: 'animug_carritos',
        compras: 'animug_compras',
        sesion: 'animug_sesion'
    };

    /** Listado de categorías base clonadas listas para lectura en la aplicación. */
    readonly categorias: Record<string, Categorias> = this.clonar(DATOS_BASE.categorias) as Record<string, Categorias>;
    /** Colección por defecto de productos en la aplicación. */
    readonly productos: Producto[] = this.clonar(DATOS_BASE.productos) as unknown as Producto[];
    /** Colección por defecto de usuarios registrados en la aplicación. */
    readonly usuarios: Usuario[] = this.clonar(DATOS_BASE.usuarios) as unknown as Usuario[];

    constructor() {
        this.inicializarDatos();
    }

    /**
     * Evalúa la disponibilidad de almacenamiento en el navegador e inyecta los datos de respaldo (`DATOS_BASE`)
     * en el `localStorage` en caso de que sea la primera ejecución de la aplicación.
     */
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
    /**
     * Extrae el catálogo completo de productos vigentes normalizando de forma dinámica sus rutas de imágenes.
     * @returns {Producto[]} Listado completo de productos mapeados.
     */
    getProductos(): Producto[] {
        return this.leerJSON<Producto[]>(this.KEYS.productos, this.productos).map(producto => ({
            ...producto,
            imagen: this.normalizarRutaImagen(producto.imagen)
        }));
    }
    /**
     * Filtra los productos de acuerdo con un identificador de categoría ignorando mayúsculas y minúsculas.
     * @param {string} categoriaKey Nombre interno de la categoría (ej: 'tazas').
     * @returns {Producto[]} Colección filtrada correspondiente a la categoría.
     */
    getProductosPorCategoria(categoriaKey: string): Producto[] {
        return this.getProductos().filter(p => p.categoria.toLowerCase() === categoriaKey.toLowerCase());
    }
    /**
     * Actualiza masivamente el catálogo de productos en LocalStorage forzando el tipado numérico en sus campos críticos.
     * @param {Producto[]} productos Arreglo completo de productos a persistir.
     */
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
    /**
     * Busca un producto específico por su identificador único controlando nulidades o vacíos de forma segura.
     * @param {number | string | null} id Identificador del producto a buscar.
     * @returns {Producto | undefined} El producto encontrado o `undefined` si no coincide ninguno.
     */
    getProductoPorId(id: number | string | null): Producto | undefined {
        if (id === null || id === undefined || id === '') return undefined;

        return this.getProductos().find(producto => Number(producto.id) === Number(id));
    }
    /**
     * Obtiene el listado sin filtros alternativos de los productos almacenados a nivel global.
     * @returns {Producto[]} Listado completo de productos globales.
     */
    getProductosGlobales(): Producto[] {
        return this.getProductos();
    }
    /**
     * Añade un nuevo producto al catálogo asignándole automáticamente un identificador incremental e unificado.
     * @param {Omit<Producto, 'id'> & { id?: number | string }} nuevoProducto Objeto del producto sin la obligación de incluir el ID.
     */
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
    /**
     * Busca y actualiza las propiedades de un producto existente manteniendo inalterado su identificador original.
     * @param {Producto} productoEditado Objeto del producto modificado con sus nuevos valores.
     */
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
    /**
     * Remueve de forma definitiva un producto del catálogo global según su identificador.
     * @param {number | string} id Identificador único del producto que se desea eliminar.
     */
    eliminarProductoGlobal(id: number | string): void {
        let productosActuales = this.getProductos();
        productosActuales = productosActuales.filter(p => Number(p.id) !== Number(id));
        this.guardarProductos(productosActuales);
    }
    /**
     * Recupera el conjunto completo de usuarios registrados en LocalStorage.
     * @returns {Usuario[]} Lista de usuarios registrados.
     */
    getUsuarios(): Usuario[] {
        return this.leerJSON<Usuario[]>(this.KEYS.usuarios, this.usuarios);
    }
    /**
     * Guarda de forma atómica la lista completa de usuarios actualizados en el almacenamiento local.
     * @param {Usuario[]} usuarios Colección de usuarios a guardar.
     */
    guardarUsuarios(usuarios: Usuario[]): void {
        this.guardarJSON(this.KEYS.usuarios, usuarios);
    }
    /**
     * Busca a un usuario por su correo electrónico ignorando espacios y variaciones de capitalización.
     * @param {string} email Correo a consultar.
     * @returns {Usuario | undefined} Instancia de usuario encontrada o `undefined`.
     */
    getUsuarioPorEmail(email: string): Usuario | undefined {
        const emailNormalizado = email.trim().toLowerCase();
        return this.getUsuarios().find(usuario => usuario.email.toLowerCase() === emailNormalizado);
    }
    /**
     * Localiza a un usuario específico mediante la comparación directa de su ID numérico.
     * @param {number | string} id Identificador numérico o en cadena del usuario.
     * @returns {Usuario | undefined} Instancia de usuario encontrada o `undefined`.
     */
    getUsuarioPorId(id: number | string): Usuario | undefined {
        return this.getUsuarios().find(usuario => Number(usuario.id) === Number(id));
    }
    /**
     * Genera y guarda de manera volátil un objeto de tipo `Sesion` en SessionStorage marcándolo con estado activo.
     * @param {Usuario} usuario Cuenta de usuario que inicia la sesión actual.
     */
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
     * Analiza una lista de objetos dotados con ID numérico e identifica el valor máximo para generar un nuevo identificador secuencial no repetitivo.
     * @param {Array<{ id: number }>} lista Colección de ítems sobre los cuales inferir el ID correlativo.
     * @returns {number} Identificador numérico correlativo disponible (`max + 1`).
     */
    generarId(lista: Array<{ id: number }>): number {
        if (!lista.length) return 1;

        return Math.max(...lista.map(item => Number(item.id))) + 1;
    }
    /**
     * Retorna la propiedad de visualización amigable (`nombre`) asociada a un ID de categoría.
     * @param {string} key Llave identificadora interna de la categoría.
     * @returns {string} Nombre estético listo para el HTML o en su defecto la misma llave recibida.
     */
    categoriaNombre(key: string): string {
        return this.categorias[key]?.nombre || key;
    }
    /**
     * Transforma el diccionario de categorías en un arreglo plano indexado con su clave interna para iteraciones complejas en la vista (como un `*ngFor`).
     * @returns {Array<{ key: string; categoria: Categorias }>} Lista mapeada con llaves y objetos completos de categorías.
     */
    categoriaEntradas(): Array<{ key: string; categoria: Categorias }> {
        return Object.keys(this.categorias).map(key => ({
            key,
            categoria: this.categorias[key]
        }));
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
}