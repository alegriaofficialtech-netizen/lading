/* ================================================================
   ALEGRIA — Banner de consentimiento de Google Analytics
   ---------------------------------------------------------------
   Fuente unica de verdad de todo el flujo de consentimiento. El
   marcado del banner se genera aqui y NUNCA se copia a mano en las
   paginas HTML: las 10 solo cargan este archivo.

   REGLA CRITICA
   gtag.js no se inyecta hasta que el visitante acepta de forma
   explicita. Ninguna ruta de este archivo puede llamar a loadGtag()
   antes de una decision guardada o de un clic en "Aceptar". El
   archivo de gtag.js se crea con createElement + appendChild, y
   appendChild es lo que dispara la peticion de red, asi que antes
   de ese momento no sale ni un solo byte hacia googletagmanager.com.
   ================================================================ */
(function () {
  'use strict';

  /* ── Constantes ──────────────────────────────────────────── */

  // Clave versionada. Si algun dia cambia el formato de la decision,
  // cambia el sufijo _v1 y las visitas anteriores se vuelven a preguntar.
  var STORAGE_KEY = 'alegria_consent_v1';

  // Unica fuente del ID de medicion en todo el sitio.
  var MEASUREMENT_ID = 'G-TBGVGDQP8J';
  var GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;

  var GRANTED = 'granted';
  var DENIED  = 'denied';

  var PRIVACY_URL = 'privacidad.html';

  // Texto del aviso. Se inserta completo, sin recortes.
  var COPY = 'Con tu permiso, usamos Google Analytics para conocer cómo se visita nuestra web y mejorar su contenido. Puedes cambiar tu decisión cuando quieras.';

  /* ── Estado interno ──────────────────────────────────────── */

  var banner = null;      // <div> ya insertado en el DOM, o null
  var gtagLoaded = false; // evita una segunda inyeccion
  var lastFocused = null; // para devolver el foco al cerrar

  /* ── Utilidades ──────────────────────────────────────────── */

  // Crea un elemento con atributos y texto. Sin innerHTML: el texto
  // entra por textContent, asi que no hay superficie de inyeccion.
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (name) {
        node.setAttribute(name, attrs[name]);
      });
    }
    if (text !== null && text !== undefined) node.textContent = text;
    return node;
  }

  // Devuelve GRANTED, DENIED o null (sin decision / almacenamiento
  // bloqueado). Cualquier otro valor se trata como "sin decision".
  function readDecision() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return (value === GRANTED || value === DENIED) ? value : null;
    } catch (e) {
      return null; // modo privado o almacenamiento deshabilitado
    }
  }

  function writeDecision(decision) {
    try {
      window.localStorage.setItem(STORAGE_KEY, decision);
    } catch (e) {
      /* Si no se puede guardar, la decision sigue valiendo durante
         esta visita: simplemente se volvera a preguntar al recargar. */
    }
  }

  /* ── Google Analytics ────────────────────────────────────── */

  // Equivalente exacto del snippet oficial de gtag.js, ejecutado en
  // el momento en que existe una decision "granted". La cola dataLayer
  // se arma ANTES de crear el <script>, igual que el snippet original.
  function loadGtag() {
    if (gtagLoaded) return;
    gtagLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);

    // A partir de este appendChild existe la peticion de red. Antes,
    // solo hay una promesa de datos en memoria.
    var script = document.createElement('script');
    script.async = true;
    script.src = GTAG_SRC;
    document.head.appendChild(script);
  }

  /* ── Banner ──────────────────────────────────────────────── */

  function buildBanner() {
    var box = el('div', {
      'class': 'consent-banner',
      'role': 'dialog',
      'aria-label': 'Aviso de privacidad y cookies',
      'aria-describedby': 'consent-banner-text',
      'tabindex': '-1'
    });
    box.id = 'consent-banner';

    var inner = el('div', { 'class': 'consent-banner__inner' });

    var text = el('p', { 'class': 'consent-banner__text', 'id': 'consent-banner-text' }, COPY + ' ');
    text.appendChild(el('a', {
      'class': 'consent-banner__link',
      'href': PRIVACY_URL
    }, 'Lee nuestra politica de privacidad.'));
    inner.appendChild(text);

    var actions = el('div', { 'class': 'consent-banner__actions' });

    // Orden: la accion afirmativa primero. El foco nunca cae aqui solo
    // (el contenedor recibe el foco), asi que no hay "Aceptar" por defecto.
    var accept = el('button', {
      'type': 'button',
      'class': 'consent-banner__btn consent-banner__btn--accept'
    }, 'Aceptar');
    accept.addEventListener('click', function () { decide(GRANTED); });

    var reject = el('button', {
      'type': 'button',
      'class': 'consent-banner__btn consent-banner__btn--reject'
    }, 'Rechazar');
    reject.addEventListener('click', function () { decide(DENIED); });

    actions.appendChild(accept);
    actions.appendChild(reject);
    inner.appendChild(actions);

    box.appendChild(inner);
    return box;
  }

  function showBanner(trigger) {
    if (!banner) {
      banner = buildBanner();
      document.body.appendChild(banner);
    }
    lastFocused = trigger || null;
    banner.focus();
  }

  function hideBanner() {
    if (!banner) return;
    var target = lastFocused;
    banner.remove();
    banner = null;
    if (target && document.body.contains(target)) target.focus();
    lastFocused = null;
  }

  /* ── Maquina de estados ──────────────────────────────────── */

  function decide(decision) {
    writeDecision(decision);
    hideBanner();
    if (decision === GRANTED) loadGtag();
    // Nota sobre revertir: si el visitante ya habia aceptado, gtag.js
    // sigue cargado en esta pagina. Rechazar detiene la medicion a
    // partir de la siguiente navegacion, no se puede "descargar" un
    // script que ya se ejecuto.
  }

  function init() {
    var decision = readDecision();

    if (decision === GRANTED) {
      loadGtag();  // ya consentido: se configura en silencio, sin banner
      return;
    }
    if (decision === DENIED) {
      return;      // rechazo previo: no se carga nada y no se molesta
    }
    showBanner();  // primera visita o decision desconocida
  }

  // Mantiene la decision coherente entre pestanas de la misma pagina.
  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;

    var value = event.newValue;
    if (value === GRANTED) {
      hideBanner();
      loadGtag();
    } else if (value === DENIED) {
      hideBanner();
    } else {
      showBanner(); // otra pestana borro la decision: vuelve a preguntar
    }
  });

  // Controles "cambiar mi decision" que ya existan en el HTML de la pagina
  // (privacidad.html usa uno). Delegacion: funciona aunque el nodo se
  // agregue despues.
  document.addEventListener('click', function (event) {
    var node = event.target;
    if (!node || !node.closest) return;
    var trigger = node.closest('[data-consent-open]');
    if (!trigger) return;
    event.preventDefault();
    showBanner(trigger);
  });

  /* ── API publica ─────────────────────────────────────────── */

  window.AlegriaConsent = {
    // Reabre el aviso. Cualquier pagina o la consola del navegador
    // puede llamarlo: AlegriaConsent.open().
    open: function () { showBanner(); },
    decide: decide,
    get: readDecision,
    // Borra la decision guardada y vuelve a preguntar.
    reset: function () {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignorado */ }
      showBanner();
    }
  };

  /* ── Arranque ────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();