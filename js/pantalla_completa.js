const botonPantallaCompleta = document.querySelector('.pantalla-completa');
const icono = document.querySelector('.pantalla-completa i');
const pagina = document.documentElement;

let pantallaCompleta;

/**
 * Funciones para utilitzar la pantalla completa en distintos navegadores.
 * How To Change The Browser To Fullscreen with JavaScript [1]
 * Pone en pantalla completa el juego.
 */
function openFullscreen() {
    if (pagina.requestFullscreen) {
        pagina.requestFullscreen();
    } else if (pagina.webkitRequestFullscreen) { /* Safari */
        pagina.webkitRequestFullscreen();
    } else if (pagina.msRequestFullscreen) { /* IE11 */
        pagina.msRequestFullscreen();
    }
}

/**
 * Salir de la pantalla completa.
 */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

// Entrar/salir de la pantalla completa según esté en pantalla completa o no.
botonPantallaCompleta.addEventListener('click', () => {
    if (pantallaCompleta) {
        closeFullscreen();
    } else {
        openFullscreen();
    }
})

// Comprobar si está en pantalla completa y adaptar el icono. Tambien asigna la variable de la
// pantalla completa para alternar el funcionamiento del botón.
setInterval(() => {
    pantallaCompleta = window.innerHeight == screen.height;
    if (window.innerHeight == screen.height && icono.classList.contains('fa-expand')) {
        // Cambiar el icono del boton.
        icono.classList.remove('fa-expand');
        icono.classList.add('fa-compress');
    }
    if (window.innerHeight != screen.height && icono.classList.contains('fa-compress')) {
        icono.classList.remove('fa-compress');
        icono.classList.add('fa-expand');
    }
})

// [1]: https://www.w3schools.com/howto/howto_js_fullscreen.asp