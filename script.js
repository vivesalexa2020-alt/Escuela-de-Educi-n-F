
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // MENÚ LATERAL
    // =========================

    const menuToggle = document.getElementById("menuToggle");
    const barraLateral = document.getElementById("barraLateral");
    const enlacesMenu = document.querySelectorAll(".enlace-menu");

    menuToggle.addEventListener("click", () => {
        const abierto = barraLateral.classList.toggle("menu-abierto");

        menuToggle.setAttribute("aria-expanded", String(abierto));
        menuToggle.setAttribute(
            "aria-label",
            abierto ? "Cerrar menú" : "Abrir menú"
        );
        menuToggle.textContent = abierto ? "✕" : "☰";
    });

    enlacesMenu.forEach((enlace) => {
        enlace.addEventListener("click", () => {
            enlacesMenu.forEach((item) => item.classList.remove("activo"));
            enlace.classList.add("activo");

            barraLateral.classList.remove("menu-abierto");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
            menuToggle.textContent = "☰";
        });
    });

    // Cambiar el enlace activo según la sección visible.
    const secciones = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window) {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    enlacesMenu.forEach((enlace) => {
                        enlace.classList.toggle(
                            "activo",
                            enlace.getAttribute("href") === "#" + entrada.target.id
                        );
                    });
                }
            });
        }, {
            rootMargin: "-25% 0px -60% 0px"
        });

        secciones.forEach((seccion) => observador.observe(seccion));
    }

    // =========================
    // CALCULADORA DE AHORRO
    // =========================

    const cantidad = document.getElementById("cantidad");
    const meses = document.getElementById("meses");
    const botonCalcular = document.getElementById("calcular");
    const resultado = document.getElementById("resultado");
    const detalleResultado = document.getElementById("detalleResultado");

    const formatoDinero = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    });

    function calcularAhorro() {
        const ahorroMensual = Number(cantidad.value);
        const numeroMeses = Number(meses.value);

        if (
            cantidad.value.trim() === "" ||
            !Number.isFinite(ahorroMensual) ||
            ahorroMensual < 0
        ) {
            resultado.textContent = "Cantidad no válida";
            detalleResultado.textContent =
                "Escribe una cantidad igual o mayor que cero.";
            return;
        }

        const total = ahorroMensual * numeroMeses;

        resultado.textContent = formatoDinero.format(total);
        detalleResultado.textContent =
            `Ahorrando ${formatoDinero.format(ahorroMensual)} al mes durante ${numeroMeses} meses, sin considerar intereses.`;
    }

    botonCalcular.addEventListener("click", calcularAhorro);
    cantidad.addEventListener("input", calcularAhorro);
    meses.addEventListener("change", calcularAhorro);

    calcularAhorro();

    // =========================
    // MINI LECCIONES
    // =========================

    const cursos = {
        ahorro: {
            titulo: "El arte del ahorro",
            texto: "Ahorrar consiste en guardar una parte del dinero que recibes para utilizarlo más adelante. No necesitas empezar con mucho: lo importante es crear el hábito.",
            actividad: "Ejemplo: si guardas $50 cada semana, al terminar 4 semanas tendrás $200."
        },
        presupuesto: {
            titulo: "Tu primer presupuesto",
            texto: "Un presupuesto te ayuda a saber cuánto dinero recibes, cuánto gastas y cuánto puedes ahorrar. Anotar tus gastos permite identificar en qué puedes mejorar.",
            actividad: "Actividad: anota tus ingresos y después escribe tres gastos que tengas durante la semana."
        },
        metas: {
            titulo: "Metas financieras",
            texto: "Una meta financiera es algo para lo que quieres reunir dinero, como comprar una computadora o pagar un curso. Define cuánto necesitas y cuánto puedes guardar cada mes.",
            actividad: "Ejemplo: si necesitas $1,200 y puedes ahorrar $200 al mes, tardarás 6 meses en reunir esa cantidad."
        }
    };

    const modalCurso = document.getElementById("modalCurso");
    const tituloModal = document.getElementById("tituloModal");
    const textoModal = document.getElementById("textoModal");
    const actividadModal = document.getElementById("actividadModal");
    const cerrarModal = document.getElementById("cerrarModal");
    const terminarLeccion = document.getElementById("terminarLeccion");
    const botonesCurso = document.querySelectorAll("[data-curso]");

    function abrirLeccion(tipo) {
        const curso = cursos[tipo];

        if (!curso) return;

        tituloModal.textContent = curso.titulo;
        textoModal.textContent = curso.texto;
        actividadModal.textContent = curso.actividad;

        modalCurso.classList.add("modal-visible");
        modalCurso.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        cerrarModal.focus();
    }

    function cerrarLeccion() {
        modalCurso.classList.remove("modal-visible");
        modalCurso.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    botonesCurso.forEach((boton) => {
        boton.addEventListener("click", () => {
            abrirLeccion(boton.dataset.curso);
        });
    });

    cerrarModal.addEventListener("click", cerrarLeccion);
    terminarLeccion.addEventListener("click", cerrarLeccion);

    modalCurso.addEventListener("click", (evento) => {
        if (evento.target === modalCurso) {
            cerrarLeccion();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" &&
            modalCurso.classList.contains("modal-visible")) {
            cerrarLeccion();
        }
    });

    // =========================
    // CUESTIONARIO FINANCIERO
    // =========================

    const preguntas = [
        {
            pregunta: "¿Qué significa ahorrar?",
            opciones: [
                "Gastar todo el dinero que recibimos",
                "Guardar una parte del dinero para usarla después",
                "Pedir dinero prestado constantemente"
            ],
            correcta: 1,
            explicacion: "¡Correcto! Ahorrar es guardar dinero para necesidades o metas futuras."
        },
        {
            pregunta: "¿Para qué sirve un presupuesto?",
            opciones: [
                "Para gastar sin llevar cuentas",
                "Para comprar cosas innecesarias",
                "Para organizar los ingresos y los gastos"
            ],
            correcta: 2,
            explicacion: "¡Muy bien! Un presupuesto ayuda a controlar el dinero y planear los gastos."
        },
        {
            pregunta: "¿Qué es una meta financiera?",
            opciones: [
                "Un objetivo relacionado con el dinero",
                "Gastar todo el sueldo el primer día",
                "No revisar nunca nuestros gastos"
            ],
            correcta: 0,
            explicacion: "¡Exacto! Una meta financiera es un objetivo económico que queremos alcanzar."
        }
    ];

    const numeroPregunta = document.getElementById("numeroPregunta");
    const puntuacion = document.getElementById("puntuacion");
    const progresoRelleno = document.getElementById("progresoRelleno");
    const preguntaTexto = document.getElementById("pregunta");
    const opcionesQuiz = document.getElementById("opcionesQuiz");
    const mensajeQuiz = document.getElementById("mensajeQuiz");
    const siguientePregunta = document.getElementById("siguientePregunta");
    const resultadoQuiz = document.getElementById("resultadoQuiz");
    const reiniciarQuiz = document.getElementById("reiniciarQuiz");

    let indicePregunta = 0;
    let puntos = 0;
    let respondida = false;

    function mostrarPregunta() {
        const preguntaActual = preguntas[indicePregunta];

        respondida = false;
        numeroPregunta.textContent =
            `Pregunta ${indicePregunta + 1} de ${preguntas.length}`;
        puntuacion.textContent = `Puntos: ${puntos}`;
        progresoRelleno.style.width =
            `${((indicePregunta + 1) / preguntas.length) * 100}%`;

        preguntaTexto.textContent = preguntaActual.pregunta;
        mensajeQuiz.textContent = "";
        opcionesQuiz.replaceChildren();

        siguientePregunta.disabled = true;
        siguientePregunta.hidden = false;
        resultadoQuiz.hidden = true;
        reiniciarQuiz.hidden = true;

        preguntaActual.opciones.forEach((opcion, indice) => {
            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "opcion-quiz";
            boton.textContent = opcion;

            boton.addEventListener("click", () => {
                responderPregunta(indice, boton);
            });

            opcionesQuiz.appendChild(boton);
        });

        siguientePregunta.textContent =
            indicePregunta === preguntas.length - 1
                ? "Ver resultado →"
                : "Siguiente pregunta →";
    }

    function responderPregunta(indiceElegido, botonElegido) {
        if (respondida) return;

        respondida = true;

        const preguntaActual = preguntas[indicePregunta];
        const botones = opcionesQuiz.querySelectorAll(".opcion-quiz");
        const esCorrecta = indiceElegido === preguntaActual.correcta;

        botones.forEach((boton, indice) => {
            boton.disabled = true;

            if (indice === preguntaActual.correcta) {
                boton.classList.add("correcta");
            }
        });

        if (esCorrecta) {
            puntos++;
            mensajeQuiz.textContent = preguntaActual.explicacion;
        } else {
            botonElegido.classList.add("incorrecta");
            mensajeQuiz.textContent =
                "No pasa nada. " + preguntaActual.explicacion;
        }

        puntuacion.textContent = `Puntos: ${puntos}`;
        siguientePregunta.disabled = false;
    }

    function finalizarQuiz() {
        preguntaTexto.textContent = "¡Cuestionario terminado!";
        opcionesQuiz.replaceChildren();
        mensajeQuiz.textContent = "";

        const porcentaje = Math.round((puntos / preguntas.length) * 100);

        let mensajeFinal;

        if (puntos === preguntas.length) {
            mensajeFinal = "¡Excelente! Dominas estos conceptos básicos.";
        } else if (puntos >= 2) {
            mensajeFinal = "¡Muy bien! Sigue practicando para aprender más.";
        } else {
            mensajeFinal = "¡Sigue aprendiendo! Puedes repasar los cursos y volver a intentarlo.";
        }

        resultadoQuiz.replaceChildren();

        const tituloResultado = document.createElement("strong");
        tituloResultado.textContent = `${puntos} de ${preguntas.length} respuestas correctas`;

        const textoResultado = document.createElement("p");
        textoResultado.textContent = `${porcentaje}% de aciertos. ${mensajeFinal}`;

        resultadoQuiz.append(tituloResultado, textoResultado);
        resultadoQuiz.hidden = false;

        siguientePregunta.hidden = true;
        reiniciarQuiz.hidden = false;
        progresoRelleno.style.width = "100%";
        numeroPregunta.textContent = "Cuestionario completado";
    }

    siguientePregunta.addEventListener("click", () => {
        if (!respondida) return;

        if (indicePregunta < preguntas.length - 1) {
            indicePregunta++;
            mostrarPregunta();
        } else {
            finalizarQuiz();
        }
    });

    reiniciarQuiz.addEventListener("click", () => {
        indicePregunta = 0;
        puntos = 0;
        mostrarPregunta();
    });

    mostrarPregunta();

});

