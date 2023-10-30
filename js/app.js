const botonInicio = document.querySelector('.boton-inicio');
const tablero = document.querySelector('.tablero');
const menu = document.querySelector('.menu');
const tematica = document.querySelector('.select-tematica');
const customOpcion = document.querySelector('#custom-option');
const casillas = document.querySelectorAll('td');
const tiempo = document.querySelector('.select-tiempo');
const contador = document.querySelector('.contador');
const pantallaPierde = document.querySelector('.pantalla-pierde');
const pantallaGana = document.querySelector('.pantalla-gana');
const pantallaDetenido = document.querySelector('.pantalla-detenido');
const fondoLatente = document.querySelector('.latente');
const customMenu = document.querySelector('.custom');
const estadisticas = document.querySelector('.estadisticas');
const marcadorPuntuacion = document.querySelector('.puntuacion');
const marcadorAciertos = document.querySelector('.parejas');
const botonCargaCustom = document.querySelector('#carga');
const botonDescargaCustom = document.querySelector('#descarga');
const botonX = document.querySelector('.x-enlace');

// Regex para comprobar si las URL de las imágenes del tema personalizado son validas.
const urlRegex = /(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

// Lista con los inputs de las imágenes del tema personalizado.
let customUrls = [];
for (let i = 1; i <= 12; i++) {
    customUrls.push(document.querySelector(`#custom-${i}`));
}

const customFondo = document.querySelector('#custom-fondo');

// Lista para comprobar que todos los campos del tema personalizado son validos.
let customSet = [
    false, false, false, false, false, false, false, false, false, false, false, false, false
];

// Variables del funcionamiento del juego.
let tiempoSeleccionado = 0;
let tiempoRestante = 0;
let fichasGiradas = [];
let temporizador;
let esperando = false;
let final = false;
let puntuacion = {
    'puntos': 0,
    'aciertos': 0,
}

// Variables para controlar el estado de la partida.
let jugando = false;
let pierdePorTiempo = false;
let pierdePorDetener = false;
let gana = false;

// Otras variables.
const valorPocoTiempo = 1000;     // 10s

/**
 * Oculta un elemento pasado por parámetro añadiéndole la clase 'oculto'.
 * @param {HTMLElement} elemento Elemento a ocultar.
 */
const ocultar = (elemento) => {elemento.classList.add('oculto')};

/**
 * Muestra un elemento pasado por parámetro añadiéndole la clase 'oculto'.
 * @param {HTMLElement} elemento Elemento a mostrar.
 */
const mostrar = (elemento) => {elemento.classList.remove('oculto')};

/**
 * Comprueba la lista de campos del tema personalizado, si no son todos correctos (sin contar el
 * fondo que es opcional), no activa el boton de inicio hasta que cada campo tenga un enlace valido.
 */
const validarCustom = () => {
    // Comprobar las imágenes personalizadas de las fichas.
    if (customSet.slice(0, -1).every(Boolean)) {
        creaFichas(true, true);
        botonInicio.disabled = false;

    // Si todos los campos tienen un enlace valido, habilitar el botón de inicio.
    } else {
        botonInicio.disabled = true;
    }

    // Cambiar el fondo si hay.
    if (customSet[12] === true) {
        document.body.style.backgroundImage = `url(${customFondo.value})`;
    } else {
        let degradadoCustom = `linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)`;
        document.body.style.backgroundImage = degradadoCustom;
    }
};

/**
 * Comprueba si la entrada del input del menu de temática personalizada es una URL correcta.
 * @param {number} index Index del input para acceder a la posición correspondiente de la lista
 * customSet.
 * @param {HTMLInputElement} input Input HTML del menu de temática personalizada.
 */
const comprobarCampo = (index, input) => {
    customSet[index] = Boolean(input.value.match(urlRegex));
    validarCustom();
}

/**
 * Pone el input en el color por defecto.
 * @param {HTMLInputElement} input Input HTML del menu de temática personalizada.
 */
const inputPorDefecto = (input) => {
    input.style.backgroundColor = '#fff';
    input.style.color = '#000';
}

/**
 * Pone el input en rojo.
 * @param {HTMLInputElement} input Input HTML del menu de temática personalizada.
 */
const inputError = (input) => {
    input.style.backgroundColor = '#f00';
    input.style.color = '#fff';
}

/**
 * Cambia el fondo según el contenido del select.
 */
function cambioSelect() {
    // Si no es un tema personalizado, muestra el fondo y las fichas del tema seleccionado.
    if (tematica.value !== 'custom') {
        // Ocultar el menu del tema personalizado.
        botonInicio.disabled = false;
        ocultar(customMenu);
        document.body.style.backgroundImage = `url(img/${tematica.value}/fondo.webp)`;
        restablecerJuego();
        creaFichas(true);
        
    // Si es personalizado, comprobar si es un tema personalizado correcto.
    } else {
        mostrar(customMenu);
        validarCustom();
    }
}

/**
 * Mezcla la lista mediante el algoritmo de Durstenfeld.
 * @param {array} array - La lista para mezclar aleatoriamente.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Crea la lista con las direcciones de las imágenes duplicadas y mezcladas.
 * @param {boolean} [ordenada] Si la lista se tiene que ordenar o no.
 * @param {boolean} [custom] Si son imágenes personalizadas.
 * @returns {string[]} La lista con las direcciones de las imágenes.
 */
function generaListaImagenes(ordenada = false, custom = false) {
    let listaImagenes = [];

    if (!custom) {
        // Añadir las imágenes.
        for (let j = 1; j <= 2; j++) {
            for (let i = 1; i < 13; i++) {
                listaImagenes.push(`img/${tematica.value}/${i}.webp`)
            }
        }
    } else {
        for (let j = 1; j <= 2; j++) {
            customUrls.forEach((url, index) => {
                // Añadir #index al final para hacer las comparaciones correctamente en caso de
                // imágenes personalizadas repetidas.
                listaImagenes.push(`${url.value}#${index}`)
            })
        }
    }

    if (!ordenada) {
        shuffleArray(listaImagenes);
    } else {
        // Dar la vuelta para que concuerden con el menú personalizado.
        listaImagenes.reverse();
    }
    return listaImagenes;
}

/**
 * Habilitar las configuraciones cuando no se está jugando.
 */
function habilitarControles() {
    tiempo.disabled = false;
    tematica.disabled = false;
    if (tematica.value === 'custom') {
        mostrar(customMenu);
    }
}

/**
 * Deshabilitar las configuraciones durante el juego.
 */
function deshabilitarControles() {
    tiempo.disabled = true;
    tematica.disabled = true;
    ocultar(customMenu);
}

/**
 * Ocultar los mensajes de victoria/derrota y todo lo relacionado con el estado final de la partida
 * anterior.
 */
function ocultarEfectos() {
    // Quitar los colores de la interfaz del juego.
    tablero.classList.remove('interfaz-pierde');
    tablero.classList.remove('interfaz-gana');
    menu.classList.remove('interfaz-pierde');
    menu.classList.remove('interfaz-gana');

    // Quitar los mensajes.
    [pantallaGana, pantallaPierde, pantallaDetenido].forEach((pantalla) => {
        ocultar(pantalla);
    })
}

/**
 * Restablece todos los parámetros del juego.
 */
function restablecerJuego() {
    fichasGiradas = [];
    esperando = false;
    puntuacion = {
        'puntos': 0,
        'aciertos': 0,
    }

    pierdePorTiempo = false;
    pierdePorDetener = false;
    gana = false;

    ocultarEfectos();
    restableceTemporizador();
}

/**
 * Añade las fichas al tablero.
 * @param {boolean} [visibles] Mostrar las fichas al jugador o taparlas para jugar.
 * @param {boolean} [custom] Si las imágenes de las fichas son personalizadas, para la función
 * generaListaImagenes.
 */
function creaFichas(visibles = false, custom = false) {
    // Crea la lista de las imágenes que se utilizaran para las fichas.
    let listaImagenes = generaListaImagenes(visibles, custom);

    // Aplicar las nuevas fichas.
    casillas.forEach(casilla => {
        // Quitar las fichas anteriores.
        if (casilla.firstElementChild) {
            casilla.firstElementChild.remove();
        }

        // Crear cada ficha con una imagen aleatoria.
        let ficha = document.createElement('div');
        ficha.classList.add('ficha');
        if (!visibles) {
            ficha.classList.add('ficha-tapada');
        } else {
            ficha.classList.add('ficha-abierta');    // Borde blanco.
        }

        // Crear la imagen y sacarla de la lista de imágenes.
        let imagenFicha = document.createElement('img');
        imagenFicha.src = listaImagenes.pop();

        // Añadir la ficha a la casilla.
        ficha.appendChild(imagenFicha);
        casilla.appendChild(ficha);
    });
}

/**
 * Mostrar el efecto latente.
 */
const efectoLatente = () => {mostrar(fondoLatente)};

/**
 * Ocultar el efecto latente.
 */
const pararLatente = () => {ocultar(fondoLatente)};

/**
 * Función que se llama cuando queda poco tiempo.
 */
function pocoTiempo() {
    efectoLatente();
}

/**
 * Da formato al tiempo proporcionado.
 * @param {number} tiempoCentecimas Tiempo en centésimas.
 * @param {boolean} [mostrarCentecimas] Mostrar el tiempo con las centésimas o no.
 * @returns {string} La cadena con el tiempo con el formato aplicado.
 */
function muestraTiempo(tiempoCentecimas, mostrarCentecimas = false) {
    // Calcular las unidades de tiempo.
    let minutos = parseInt(tiempoCentecimas / 6000);
    let segundos = parseInt(tiempoCentecimas / 100 % 60);
    let centesimas = parseInt(tiempoCentecimas % 100);

    // Convertir a cadena y añadirle un cero en caso que solo sea un dígito.
    minutos = minutos.toString().padStart(2, '0');
    segundos = segundos.toString().padStart(2, '0');
    centesimas = centesimas.toString().padStart(2, '0');

    // Devolver la cadena con o sin centésimas.
    if (mostrarCentecimas) {
        return minutos + ':' + segundos + '.' + centesimas;
    }
    return minutos + ':' + segundos;
}

/**
 * Restablece el temporizador mostrado en el juego a cero.
 */
const restableceTemporizador = () => {contador.innerHTML = '00:00'};

/**
 * Crea el temporizador que se usará para la partida.
 */
function creaTemporizador() {
    let quedaPoco = false;
    tiempoSeleccionado = +tiempo.value;
    tiempoRestante = tiempoSeleccionado;
    // Actualizar el contador por primera vez para que no empiece en cero.
    contador.innerHTML = muestraTiempo(tiempoRestante);

    // Poner el temporizador.
    temporizador = setInterval(() => {
        contador.innerHTML = muestraTiempo(tiempoRestante, quedaPoco);

        // Activar efectos en caso que quede poco tiempo.
        if (!quedaPoco && tiempoRestante <= valorPocoTiempo) {
            quedaPoco = true;
            pocoTiempo();
        }

        // Acabar la partida si s'acaba el tiempo.
        if (tiempoRestante == 0) {
            pierdePorTiempo = true;
            juegoTerminado();
        }

        tiempoRestante--;
    }, 10) // 0,01s
}

/**
 * Actualiza el texto del boton de inicio.
 * @param {string} valor Texto del boton de inicio.
 */
const nombreBotonInicio = (valor) => {botonInicio.innerHTML = valor};

/**
 * Función que se encarga del inicio el juego.
 */
function inicioJuego() {
    nombreBotonInicio('Parar el juego');
    jugando = true;
    mostrar(estadisticas);
    creaFichas(false, tematica.value === 'custom');
    creaTemporizador();
    deshabilitarControles();
    actualizarMarcador();  // Actualizarlo para que muestre cero.
}

/**
 * Función que se llama cuando el juego se detiene.
 */
function detenerJuego() {
    pierdePorDetener = true;
    juegoTerminado();
}

/**
 * Crea un tuit para compartir el resultado de la partida y lo pone como enlace del boton de
 * compartir.
 * @param {'W' | 'L'} estado Cadena que determina si se ha ganado la partida o no. 'W' en caso que
 * se haya ganado, 'L' en caso que se haya perdido.
 */
function crearTuit(estado) {
    let tuit = 'https://twitter.com/intent/tweet?text=';

    if (estado === 'W') {
        tuit += `¡He conseguido ganar en el Memory! ¡Me ha sobrado 
${muestraTiempo(tiempoRestante, true)} de tiempo, con un tiempo total de 
${muestraTiempo(tiempoSeleccionado)} y he conseguido una puntuación de ${puntuacion['puntos']}!`;

    } else if (estado === 'L') {
        tuit += `He perdido en el Memory... He conseguido ${puntuacion['aciertos']} parejas y una 
puntuación de ${puntuacion['puntos']} en un tiempo de ${muestraTiempo(tiempoSeleccionado)}.`;
    }
    // %0A és un carácter codificado en HTML que representa un salto de linea.
    tuit += '%0A%0AJuega tú también en https://ssr765.github.io/Memory-Game/';

    botonX.href = tuit;
}

/**
 * Función que se llama cuando se ha perdido el juego.
 */
function juegoPerdido() {
    crearTuit('L');
    
    // Efectos de cuando se pierde el juego.
    const imatgesJoc = document.querySelectorAll('.ficha img');
    imatgesJoc.forEach(img => {
        img.classList.add('ficha-bn');
    });

    mostrar(pantallaPierde);
    tablero.classList.add('interfaz-pierde');
    menu.classList.add('interfaz-pierde');
}

/**
 * Función que se llama cuando se ha detenido el juego.
 */
function juegoDetenido() {
    crearTuit('L');

    // Efectos de cuando el juego se detiene.
    mostrar(pantallaDetenido);
}

/**
 * Función que se llama cuando se ha ganado el juego.
 */
function juegoGanado() {
    puntuacion['puntos'] += puntosCompletado();
    crearTuit('W');
    actualizarMarcador();

    // Efectos de cuando se ha ganado el juego.
    mostrar(pantallaGana);
    tablero.classList.add('interfaz-gana');
    menu.classList.add('interfaz-gana');
}

/**
 * Función que se llama cuando se acaba el juego, independientemente de si se ha ganado o perdido.
 */
function juegoTerminado() {
    nombreBotonInicio('Volver a jugar');
    jugando = false;
    final = true;

    // Mostrar el botón para compartir, parar el efecto latente y parar el temporizador.
    mostrar(botonX);
    pararLatente();
    clearInterval(temporizador);

    // Llamar a la función respectiva según el estado del juego.
    if (pierdePorTiempo) {
        juegoPerdido();
    } else if (pierdePorDetener) {
        juegoDetenido();
    } else if (gana) {
        juegoGanado();
    }
}

// Intervalo permanente que detecta si se ha ganado la partida.
setInterval(() => {
    if (jugando && puntuacion['aciertos'] == 12) {
        gana = true;
        juegoTerminado();
    }
})

/**
 * Prepara la siguiente partida.
 */
function prepararJuego() {
    nombreBotonInicio('Iniciar el juego');
    final = false;
    habilitarControles();
    restablecerJuego();
    creaFichas(true, tematica.value === 'custom');
    ocultar(estadisticas);
    ocultar(botonX);
}

// Configuración del botón de inicio.
botonInicio.addEventListener('click', () => {
    // Llamar a la función respectiva según el estado del juego.
    if (jugando) {
        detenerJuego();

    } else if (final) {
        prepararJuego();

    } else {
        inicioJuego();

    }
})

/**
 * Calcula los puntos que recibirá el jugador al acertar una pareja de fichas.
 * @returns {number} Puntos basados en el tiempo seleccionado y el tiempo restante.
 * 
 * @example
 * // En caso que queden 20 segundos y se haya seleccionado 1 minuto el resultado será el siguiente.
 * const tiempoSeleccionado = 6000;   // 60s
 * const tiempoRestante = 2000;       // 20s
 * const puntos = puntosAcierto();     // 1852
 */
const puntosAcierto = () => {
    return Math.round((1000000 / tiempoSeleccionado / 3) * ((100 / tiempoSeleccionado) * tiempoRestante))
};

/**
 * Calcula los puntos que recibirá el jugador al completar el juego.
 * @returns {number} Puntos basados en el tiempo seleccionado y el tiempo restante.
 * 
 * @example
 * // En caso que queden 20 segundos y se haya seleccionado 1 minuto el resultado será el siguiente.
 * const tiempoSeleccionado = 6000;   // 60s
 * const tiempoRestante = 2000;       // 20s
 * const puntos = puntosCompletado();  // 3333
 */
const puntosCompletado = () => {
    return Math.round(100000 / (tiempoSeleccionado / 100) * 1.5 * (1 + ((100 / tiempoSeleccionado) * tiempoRestante) / 100));
};

/**
 * Actualiza las puntuaciones del marcador.
 */
function actualizarMarcador() {
    marcadorAciertos.innerHTML = `Aciertos: ${puntuacion['aciertos']}/12`;
    marcadorPuntuacion.innerHTML = `Puntuación: ${puntuacion['puntos']}`;
}

/**
 * Comprueba si las fichas son iguales, y hace el procedimiento correspondiente dependiendo si el
 * jugado ha acertado o no.
 */
function comprobarFichas() {
    // Quitar el borde blanco de la ficha para poner el efecto correspondiente a si ha fallado o no.
    fichasGiradas.forEach(ficha => ficha.classList.remove('ficha-abierta'));

    // Si las direcciones de las fichas son iguales, añadir la clase 'ficha-descubierta', la qual
    // pone un borde verde a la ficha.
    if (fichasGiradas[0].firstElementChild.src === fichasGiradas[1].firstElementChild.src) {
        // Actualizar marcadores.
        puntuacion['aciertos']++;
        puntuacion['puntos'] += puntosAcierto();
        actualizarMarcador();

        fichasGiradas.forEach(ficha => ficha.classList.add('ficha-descubierta'));
        fichasGiradas = [];

    // En caso de fallar, esperar un segundo para que el jugador pueda ver la segunda ficha
    // destapada y para que no pueda destapar otras casillas.
    } else {
        esperando = true;
        fichasGiradas.forEach(ficha => ficha.classList.add('ficha-incorrecta'));
        // Penalización de un segundo antes de seguir destapando fichas.
        setTimeout(() => {
            // Dejarlas abiertas en caso que se acabe el juego.
            if (jugando) {
                fichasGiradas.forEach(ficha => {
                    ficha.classList.add('ficha-tapada');
                    ficha.classList.remove('ficha-incorrecta');
                });
            }
            fichasGiradas = [];
            esperando = false;
        }, 1000)    // 1s
    }
}

/**
 * Destapa una ficha y si hay dos destapadas, las comprueba.
 * @param {MouseEvent} event 'MouseEvent' del listener para saber que ficha se quiere destapar.
 */
function destaparFicha(event) {
    // Cuando se destape una ficha, añadirla a la lista de fichas giradas para hacer la comparación
    // cuando hayan dos.
    let ficha = event.target;
    if (ficha.classList.contains('ficha-tapada')) {
        ficha.classList.remove('ficha-tapada');
        ficha.classList.add('ficha-abierta');
        fichasGiradas.push(ficha);
    }
    // Cuando hayan dos fichas giradas, comprobarlas.
    if (fichasGiradas.length === 2) {
        comprobarFichas();
    }
}

// Configurar el funcionamiento de las fichas.
casillas.forEach(casilla => {
    casilla.addEventListener('click', (event) => {
        // Evitar que el jugador pueda destapar otras casillas si ha fallado.
        if (!esperando) {
            destaparFicha(event);
        }

    })
})

// Comprueba la dirección introducida cuando se escribe en el input del menu de temática
// personalizada.
customUrls.forEach((url, index) => {
    url.addEventListener('input', () => {
        inputPorDefecto(url);
        comprobarCampo(index, url)
    });
});

// Lo mismo que en los listeners de encima, pero con el input del fondo personalizado.
customFondo.addEventListener('input', () => comprobarCampo(12, customFondo));

/**
 * Función que se ejecuta cuando se lee el archivo de tema personalizado subido.
 * @param {ProgressEvent} event 'ProgressEvent' que pasa por parámetro el método reader.load.
 */
function leerArchivo(event) {
    let error = false;
    let files = event.target.result.split('\n');
    // Comprobar que el archivo tenga de 12 a 13 lineas y que sean enlaces validos.
    if (files.length >= 12 && files.length <= 13) {
        files.forEach((fila) => {
            if (!error) {
                error = !Boolean(fila.match(urlRegex));
            }
        });
    } else {
        alert('El archivo de texto tiene que tener 12 o 13 lineas de enlaces a imágenes.');
    }

    // Si el tema es correcto, pone las direcciones a las imágenes en los inputs del menú de
    // temática personalizada.
    if (!error) {
        // Nombre del archivo en el texto de la opción personalizada.
        customOpcion.innerHTML = `Personalizado... (${archivo.name})`;
        
        // Poner los enlaces en los inputs.
        customUrls.forEach((input, index) => {
            inputPorDefecto(input);
            input.value = files[index];
            customSet[index] = true;
        });

        // Poner el fondo personalizado si hay.
        if (files.length === 13) {
            customFondo.value = files[12];
            customSet[12] = true;
        }

        validarCustom();

    // Si se ha encontrado algún enlace incorrecto, informará que el tema no es válido.
    } else {
        alert('Tema no válido.');
    }
};

// Detectar cuando se ha subido un archivo.
botonCargaCustom.addEventListener('change', () => {
    archivo = botonCargaCustom.files[0];
    if (archivo.type === 'text/plain') {
        // Crear un lector de archivos y leer el archivo subido si es un archivo de texto plano.
        const reader = new FileReader();
        reader.onload = leerArchivo;
        reader.readAsText(archivo);
    } else {
        alert('Los temas personalizados han de ser archivos \'.txt\' con 12 o 13 links a imágenes');
    }
    // Limpiar el input de archivo por si se quiere volver a subir el mismo tema.
    botonCargaCustom.value = '';
})

// Detectar cuando se quiere exportar un tema.
botonDescargaCustom.addEventListener('click', () => {
    let enlaces = [];

    // Comprobar cada input y ponerlo en rojo si no tienen un enlace válido.
    customUrls.forEach(input => {
        if (!Boolean(input.value.match(urlRegex))) {
            inputError(input);
        } else {
            enlaces.push(input.value);
        }
    });

    // En caso que haya un fondo personalizado, añadir-lo a la lista de enlaces.
    if (customSet[12]) {
        enlaces.push(customFondo.value);
    }

    // Si todos los enlaces son validos, descargar el archivo mediante la librería de FileSaver.
    if (customSet.slice(0, -1).every(Boolean)) {
        const blob = new Blob([enlaces.join('\n')], { type: 'text/plain' });
        const nombreArchivo = prompt('Introduce el nombre del tema personalizado');
        if (nombreArchivo !== null) {
            saveAs(blob, `${nombreArchivo}.memory.txt`);
        }
    }
})

creaFichas(true);