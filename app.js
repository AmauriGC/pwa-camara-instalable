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

// 4. iOS: no existe beforeinstallprompt, se guía la instalación manual
function verificarEntornoIOS() {
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const estaInstalada = window.navigator.standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;

  // Si está en iPhone y aún la ve desde el navegador, mostrar instrucciones manuales
  if (esIOS && !estaInstalada) {
    const guiaIOS = document.getElementById('instrucciones-ios');
    if (guiaIOS) guiaIOS.hidden = false;
  }
}

verificarEntornoIOS();

// 5. Control de la cámara
let streamActual = null;
let modoCamaraActual = 'environment'; // 'environment' = trasera | 'user' = frontal

function actualizarBotonesCamara(activa) {
  btnAlternarCamara.disabled = !activa;
  btnApagarCamara.disabled = !activa;
  btnPrepararCamara.disabled = activa;
}

// Libera el sensor: sin esto el móvil no deja abrir la otra cámara
function detenerCamaraActiva() {
  if (streamActual) {
    streamActual.getTracks().forEach((track) => {
      track.stop();
    });
    streamActual = null;
  }
}

function iniciarCamara(modo) {
  detenerCamaraActiva();

  // getUserMedia solo existe en contexto seguro (HTTPS o localhost)
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    actualizarMensajeEstado('Este navegador no permite usar la cámara aquí. Abre la app desde HTTPS.');
    return Promise.resolve();
  }

  const restricciones = {
    video: { facingMode: modo },
    audio: false
  };

  actualizarMensajeEstado('Encendiendo cámara...');
  btnAlternarCamara.disabled = true;

  return navigator.mediaDevices.getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      visorVideo.srcObject = stream;
      visorVideo.classList.toggle('espejo', modo === 'user');
      actualizarMensajeEstado(`Cámara activa (${modo === 'environment' ? 'Trasera' : 'Frontal'})`);
    })
    .catch((error) => {
      if (error.name === 'NotAllowedError') {
        actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.');
      } else if (error.name === 'NotFoundError') {
        actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.');
      } else {
        actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`);
      }
    })
    .finally(() => {
      actualizarBotonesCamara(streamActual !== null);
    });
}

// 6. Pre-permiso (UX ética)
// Paso 1: "Solicitar Acceso a Cámara" solo muestra el aviso explicativo
btnPrepararCamara.addEventListener('click', () => {
  avisoPermiso.hidden = false;
  avisoPermiso.scrollIntoView({ behavior: 'smooth' });
});

// Paso 2: el usuario leyó el motivo y confirma -> ahora sí el diálogo nativo
btnConfirmarPermiso.addEventListener('click', () => {
  avisoPermiso.hidden = true;
  iniciarCamara(modoCamaraActual);
});

btnCancelarPermiso.addEventListener('click', () => {
  avisoPermiso.hidden = true;
  actualizarMensajeEstado('No se encendió la cámara. Puedes solicitarla cuando quieras.');
});

// 7. Alternar entre cámara trasera y frontal
btnAlternarCamara.addEventListener('click', () => {
  modoCamaraActual = modoCamaraActual === 'environment' ? 'user' : 'environment';
  iniciarCamara(modoCamaraActual);
});

// 8. Apagar la cámara
btnApagarCamara.addEventListener('click', () => {
  detenerCamaraActiva();
  visorVideo.srcObject = null;
  actualizarBotonesCamara(false);
  actualizarMensajeEstado('Cámara apagada. El sensor quedó liberado.');
});
