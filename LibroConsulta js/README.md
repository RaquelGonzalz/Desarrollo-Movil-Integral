# LibroConsulta · Actividad 17

Prototipo NUEVO con React Native y Expo. Opción B: catálogo bibliográfico mediante Open Library. No usa base de datos propia, claves API, cuentas ni backend local.

## 1. Preparar la computadora

Instala Node.js LTS compatible con Expo (Node 22 LTS o superior) y Visual Studio Code. Instala Expo Go en tu teléfono. Descomprime la carpeta en una ruta sencilla, por ejemplo `C:\Proyectos\LibroConsulta`. Abre esa carpeta en VS Code y una terminal.

```powershell
npm ci
npm start
```

Escanea el QR con Expo Go en Android o con la cámara en iPhone. La computadora y el teléfono deben compartir Wi-Fi. Debe haber Internet para consultar libros. No se necesita cambiar una IP ni ejecutar Flask.

Este paquete usa Expo SDK 58, React 19.3 y React Native 0.88.1, según las dependencias instaladas. Si Expo Go avisa que es incompatible, verifica el SDK que admite tu versión de Expo Go; usa una versión compatible o un development build. No cambies únicamente el número de Expo en package.json. Consulta la guía oficial de actualización.

Si la red impide abrir el QR, prueba `npx expo start --tunnel` (puede pedir instalar @expo/ngrok); si Metro conserva datos viejos, `npx expo start -c`. No desactives el firewall completo.

Alternativa para revisión en computadora:

```powershell
npm run web
```

## 2. Usar y demostrar

1. Deja seleccionado Título y escribe `Don Quijote`.
2. Pulsa Buscar libros. Observa carga y tarjetas con título, autor, primera publicación y ediciones.
3. Pulsa Actualizar consulta para volver a consultar la última búsqueda. Espera al menos 1.2 segundos entre peticiones.
4. Selecciona Autor, escribe `Gabriel García Márquez` y busca.
5. Busca `zzzxqvlibroinexistente987654` para comprobar la respuesta vacía.
6. Borra el texto y busca: se debe impedir la solicitud y mostrar una validación.
7. Para comprobar la desconexión, apaga Internet y usa un término nuevo que no esté en caché; vuelve a activar Internet después.

Las búsquedas repetidas pueden salir de la caché en memoria durante cinco minutos. Al cerrar o recargar la app se pierde. El botón Actualizar omite la caché. La app no consulta al escribir cada letra ni reintenta automáticamente.

## 3. Archivos

- `App.js`: pantalla y estados de carga, error, resultado y vacío.
- `src/library.mjs`: validación, URL, GET, interpretación JSON, timeout, caché y límites.
- `tests/library.test.mjs`: pruebas automáticas sin dependencia de disponibilidad externa.
- `evidencias/`: imágenes de la ejecución web de esta misma app, respuestas reales y registro de pruebas.
- `package-lock.json`: dependencias fijadas para `npm ci`.
- `app.json`: nombre y configuración Expo del proyecto.

## 4. API

Servicio: Open Library, Internet Archive. Endpoint: `https://openlibrary.org/search.json`. Método: GET. Respuesta: JSON. Este endpoint público de búsqueda no requiere una clave de acceso.

Ejemplos reproducibles:

```text
https://openlibrary.org/search.json?title=Don%20Quijote&limit=12&fields=key,title,author_name,first_publish_year,edition_count
https://openlibrary.org/search.json?author=Gabriel%20Garc%C3%ADa%20M%C3%A1rquez&limit=12&fields=key,title,author_name,first_publish_year,edition_count
```

La respuesta incluye `docs` (libros) y `numFound` o `num_found` (total). Cada registro puede incluir `title`, `author_name` (lista), `first_publish_year`, `edition_count` y `key`. El año corresponde a la ficha del proveedor y puede contener imprecisiones. No es una verificación histórica. Las tarjetas muestran “No disponible” si falta un dato.

Se limita la respuesta a 12 registros; el total puede ser mayor y el prototipo no implementa paginación. El catálogo busca obras, no garantiza disponibilidad de lectura ni descarga de libros.

## 5. Seguridad y uso del servicio

- URL fija con HTTPS y parámetros codificados con encodeURIComponent.
- Entrada normalizada, de 2 a 80 caracteres; lista permitida de letras Unicode, números, espacios y puntuación habitual. Modo restringido a título o autor.
- Valida HTTP, JSON y estructura de docs; maneja campos faltantes y registros malformados.
- Tiempo máximo de consulta: 15 segundos. Una sola petición activa.
- Pausa mínima local de 1.2 segundos entre peticiones; hasta 20 consultas en caché durante cinco minutos. Este control es por instancia, no global para todos los usuarios.
- HTTP 429: respeta Retry-After numérico o en fecha; si no existe, espera 60 segundos. No hay reintento automático.
- No almacena contraseñas ni claves. No pide cámara, contactos ni ubicación. Los términos buscados se envían al proveedor; no escribas datos personales sensibles.
- Fuente visible: “Datos de Open Library · Internet Archive”. No usa portadas ni reproduce libros.

La documentación permite herramientas educativas y consulta humana y desaconseja extracción masiva y uso como infraestructura comercial de alto tráfico. Publica un límite predeterminado de una solicitud por segundo. Para uso frecuente pide identificar la app y un contacto real mediante User-Agent; también solicita registrar el caso de uso. Este prototipo opera con el límite predeterminado y no inventa un contacto. Antes de un despliegue frecuente, registra el caso e incorpora un contacto público autorizado en las peticiones nativas o en un intermediario. Un navegador no permite modificar libremente User-Agent.

La página de licencias no reclama nuevos derechos sobre la base y advierte que pueden existir derechos de terceros. Mostrar la fuente no otorga derechos sobre libros o imágenes.

## 6. Pruebas

```powershell
npm test
```

Usa Node 22 o superior para ejecutar el corredor incorporado. Las pruebas de errores emplean respuestas controladas: no provocan límites reales contra Open Library. El informe diferencia esta validación de las consultas reales y de la revisión pendiente en teléfono.

## 7. Capturas y entrega

Se incluyen capturas reales de la versión web de la app en una ventana de tamaño móvil. No son capturas de un teléfono ni de Expo Go. Para la evidencia móvil, abre el QR y toma al menos una captura de la búsqueda por título y otra por autor. Agrega las capturas al reporte y registra dispositivo, fecha y resultado de ejecución. No marques como aprobada una prueba que no ejecutaste.

Entrega el ZIP con código, el reporte Word y tus capturas de Expo Go. Completa los integrantes del equipo en la portada. Puedes entregar este código sin publicar un repositorio.

## 8. Publicar en tu propio repositorio opcionalmente

Crea un repositorio vacío en GitHub y, desde LibroConsulta, ejecuta:

```powershell
git init
git add .
git commit -m "Actividad 17 catalogo de libros con Open Library"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/LibroConsulta.git
git push -u origin main
```

Reemplaza TU_USUARIO por tu cuenta. No subas node_modules, .expo, credenciales ni archivos .env. El .gitignore incluido evita los directorios temporales habituales.

## 9. Fuentes oficiales revisadas el 31 de octubre de 2026

- https://openlibrary.org/dev/docs/api/search
- https://openlibrary.org/developers/api
- https://openlibrary.org/developers/licensing
- https://docs.expo.dev/more/create-expo/
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
