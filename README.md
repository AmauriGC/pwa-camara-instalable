# PWA Cámara Instalable: `manifest.json` y acceso ético a la cámara

Aplicación web progresiva que **se instala como app nativa** en la pantalla de inicio y enciende la **cámara trasera o frontal** solo después de explicarle al usuario para qué la usa (patrón **Pre-Permiso**).

**Demo:** https://amaurigc.github.io/pwa-camara-instalable/

## Cómo funciona

1. **Instalable:** HTTPS (GitHub Pages) + Service Worker activo + `manifest.json` con iconos de 192 y 512 px.
2. **Botón propio de instalación:** se captura `beforeinstallprompt`, se guarda el evento y el botón **Instalar App** llama a `prompt()` y lee `userChoice` con `.then()`.
3. **iPhone:** Safari no dispara `beforeinstallprompt`. Si es iOS y no está instalada, se muestran las instrucciones *Compartir → Agregar a inicio*.
4. **Pre-Permiso:** el primer botón solo muestra un aviso. El diálogo nativo de la cámara aparece hasta que el usuario pulsa **Aceptar y Encender Cámara**.
5. **Cámara:** `getUserMedia({ video: { facingMode } })`. Antes de cada cambio de lente se ejecuta `track.stop()` para liberar el sensor.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura, `<video autoplay playsinline muted>`, aviso de permiso e instrucciones iOS |
| `styles.css` | Estilos; la cámara frontal se ve en espejo |
| `app.js` | Registro del SW, instalación, detección de iOS y control de la cámara |
| `sw.js` | Precaché del App Shell con estrategia *Cache First* |
| `manifest.json`, `icons/` | Identidad de la app, modo `standalone` e iconos |

## Reglas técnicas

- JavaScript Vanilla, sin librerías.
- Sin `async/await`: solo `.then()`, `.catch()` y `.finally()`.
- Rutas relativas (`./`) para funcionar en el subdirectorio de GitHub Pages.

## Probarlo

1. **Escritorio:** abre la demo → `F12` → **Application → Manifest**: sin errores en iconos ni en instalabilidad.
2. **Android (Chrome):** pulsa **Instalar App** y abre la app desde el icono: sin barra de direcciones.
3. **iPhone (Safari):** sigue las instrucciones en pantalla (Compartir → Agregar a inicio).
4. **Cámara:** *Solicitar Acceso* → lee el aviso → *Aceptar* → permite → *Cambiar Cámara* → *Apagar*.
