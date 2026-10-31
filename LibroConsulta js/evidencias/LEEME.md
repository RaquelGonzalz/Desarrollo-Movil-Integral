# Evidencias y alcance

Fecha: 31 de octubre de 2026.

01-titulo.png y 02-autor.png son capturas de la app React Native ejecutada con Expo web en Chromium a 430 × 1000 píxeles. 03-sin-resultados.png y 04-validacion.png muestran los estados alternativos. No son capturas de un celular ni de Expo Go.

api-title.json, api-author.json y api-sin-resultados.json son respuestas HTTPS reales del proveedor. consultas-reales.json registra sus parámetros y resultados. interfaz-web.json registra las respuestas recibidas por la interfaz y los errores JavaScript observados.

pruebas-automatizadas.txt registra diez pruebas del cliente. Los errores HTTP 429, 503, timeout y desconexión se verificaron con respuestas controladas. No prueban el bloqueo real del proveedor.

La exportación del bundle de Android se realizó con `npx expo export --platform android`. Esto verifica la generación de JavaScript para Android; no equivale a probar una APK ni un teléfono físico.

Para la entrega móvil, añadir capturas reales de Expo Go y completar el registro del reporte. Los conteos y metadatos pueden variar por cambios en Open Library.
