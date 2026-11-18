// app.js - Instalación de la PWA y acceso consciente a la cámara.
// Sin async/await: toda la asincronía usa .then(), .catch() y .finally().

// 1. Registrar el Service Worker (ruta relativa para GitHub Pages)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then((reg) => console.log('[SW] Registrado. Scope:', reg.scope))
    .catch((err) => console.error('[SW] Error al registrar:', err));
}

// 2. Referencias a los elementos del HTML
const btnInstalar = document.getElementById('btn-instalar');
const visorVideo = document.getElementById('visor-camara');
const mensajeEstado = document.getElementById('mensaje-estado');
const avisoPermiso = document.getElementById('aviso-permiso');
const btnPrepararCamara = document.getElementById('btn-preparar-camara');
const btnConfirmarPermiso = document.getElementById('btn-confirmar-permiso');
const btnCancelarPermiso = document.getElementById('btn-cancelar-permiso');
const btnAlternarCamara = document.getElementById('btn-alternar-camara');
const btnApagarCamara = document.getElementById('btn-apagar-camara');

function actualizarMensajeEstado(texto) {
  mensajeEstado.textContent = texto;
}

// 3. Instalación personalizada (Chrome / Android)
let eventoInstalacionDiferido = null;

window.addEventListener('beforeinstallprompt', (event) => {
  // Evita que el mini-banner automático aparezca antes de tiempo
  event.preventDefault();
  eventoInstalacionDiferido = event;
  btnInstalar.hidden = false;
});

btnInstalar.addEventListener('click', () => {
  if (!eventoInstalacionDiferido) return;
  eventoInstalacionDiferido.prompt();
  eventoInstalacionDiferido.userChoice
    .then((resultado) => {
      console.log('[PWA] Elección del usuario:', resultado.outcome);
      if (resultado.outcome === 'accepted') {
        btnInstalar.hidden = true;
      }
    })
    .finally(() => {
      // El evento solo se puede usar una vez
      eventoInstalacionDiferido = null;
    });
});

// Se dispara al terminar la instalación (por nuestro botón o por el menú)
window.addEventListener('appinstalled', () => {
  btnInstalar.hidden = true;
  console.log('[PWA] Aplicación instalada');
});
