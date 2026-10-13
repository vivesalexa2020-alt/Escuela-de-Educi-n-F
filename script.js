
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS DEL MENÚ
  const menuToggle = document.getElementById("menu-toggle");
  const navegacion = document.getElementById("navegacion");
  const barraLateral = document.querySelector(".barra-lateral");

  // GUARDAR Y LEER DATOS DEL NAVEGADOR
  function leerDatos(clave, inicial) {
    try {
      const datos = localStorage.getItem(clave);
      return datos ? JSON.parse(datos) : inicial;
    } catch {
      return inicial;
    }
  }

  function guardarDatos(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  }

  function formatoDinero(cantidad) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(cantidad);
  }

  function fechaLocal() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }

  let gastos = leerDatos("finanzalab_gastos", []);
  let metaAhorro = leerDatos("finanzalab_meta", {
    nombre: "",
    objetivo: 0,
    actual: 0
  });
  let leccionesCompletadas = leerDatos(
    "finanzalab_lecciones",
    []
  );

  if (!Array.isArray(gastos)) gastos = [];
  if (!Array.isArray(leccionesCompletadas)) {
    leccionesCompletadas = [];
  }

  // MENÚ LATERAL Y MENÚ PARA CELULAR
  menuToggle.addEventListener("click", () => {
    const abierto = barraLateral.classList.toggle("menu-abierto");

    menuToggle.setAttribute("aria-expanded", String(abierto));
    menuToggle.setAttribute(
      "aria-label",
      abierto ? "Cerrar menú" : "Abrir menú"
    );
    menuToggle.textContent = abierto ? "✕" : "☰";
  });

  navegacion.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      navegacion.querySelectorAll("a").forEach(item => {
        item.classList.remove("activo");
      });

      enlace.classList.add("activo");
      barraLateral.classList.remove("menu-abierto");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      menuToggle.textContent = "☰";
    });
  });

  // PROGRESO GENERAL DE LA ESCUELA
  function actualizarInicio() {
    document.getElementById("hero-gastos").textContent =
      String(gastos.length);

    document.getElementById("hero-ahorro").textContent =
      formatoDinero(Number(metaAhorro.actual) || 0);

    const porcentaje = Math.round(
      (leccionesCompletadas.length / 3) * 100
    );

    document.getElementById("progreso-general").style.width =
      `${porcentaje}%`;

    document.getElementById("progreso-texto").textContent =
      `${porcentaje}%`;
  }

  // CONTENIDO DE LOS NIVELES
  const lecciones = {
    1: {
      titulo: "Identifica tus gastos hormiga",
      descripcion:
        "Los gastos hormiga son pequeñas compras frecuentes que pueden acumular una cantidad importante de dinero. Aprende a reconocerlas sin dejar de cubrir tus necesidades.",
      actividad:
        "Anota tres compras pequeñas que hayas realizado recientemente. Regístralas en la herramienta de gastos y observa cuánto suman."
    },
    2: {
      titulo: "Construye tu hábito de ahorro",
      descripcion:
        "Ahorrar consiste en reservar dinero para una meta futura. La cantidad debe adaptarse a tus posibilidades y a tus gastos esenciales.",
      actividad:
        "Crea una meta en la herramienta de ahorro. Escribe para qué quieres ahorrar y cuánto necesitas reunir."
    },
    3: {
      titulo: "Conoce las inversiones",
      descripcion:
        "Invertir significa colocar dinero en una opción que puede generar rendimientos, pero también puede ocasionar pérdidas. Antes de decidir, conoce sus condiciones y riesgos.",
      actividad:
        "Escribe la diferencia entre ahorrar e invertir. Recuerda que ningún rendimiento está garantizado."
    }
  };

  const panelLeccion = document.getElementById("panel-leccion");
  const etiquetaLeccion = document.getElementById("leccion-etiqueta");
  const tituloLeccion = document.getElementById("leccion-titulo");
  const descripcionLeccion = document.getElementById(
    "leccion-descripcion"
  );
  const actividadLeccion = document.getElementById("leccion-actividad");
  const botonCompletar = document.getElementById("completar-leccion");

  let leccionActual = null;

  function actualizarBotonesLecciones() {
    document.querySelectorAll("[data-leccion]").forEach(boton => {
      const numero = Number(boton.dataset.leccion);
      const completada = leccionesCompletadas.includes(numero);

      if (completada) {
        boton.textContent = "Actividad completada ✓";
      } else if (numero === 1) {
        boton.textContent = "Comenzar nivel →";
      } else {
        boton.textContent = "Explorar nivel →";
      }
    });

    actualizarInicio();
  }

  document.querySelectorAll("[data-leccion]").forEach(boton => {
    boton.addEventListener("click", () => {
      leccionActual = Number(boton.dataset.leccion);
      const leccion = lecciones[leccionActual];

      etiquetaLeccion.textContent = `NIVEL ${leccionActual}`;
      tituloLeccion.textContent = leccion.titulo;
      descripcionLeccion.textContent = leccion.descripcion;
      actividadLeccion.textContent = leccion.actividad;

      botonCompletar.textContent =
        leccionesCompletadas.includes(leccionActual)
          ? "Actividad completada ✓"
          : "Marcar actividad como completada ✓";

      panelLeccion.hidden = false;
      panelLeccion.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  });

  document.getElementById("cerrar-leccion").addEventListener(
    "click",
    () => {
      panelLeccion.hidden = true;
    }
  );

  botonCompletar.addEventListener("click", () => {
    if (leccionActual === null) return;

    if (!leccionesCompletadas.includes(leccionActual)) {
      leccionesCompletadas.push(leccionActual);
      leccionesCompletadas.sort((a, b) => a - b);

      if (!guardarDatos(
        "finanzalab_lecciones",
        leccionesCompletadas
      )) {
        leccionesCompletadas =
          leccionesCompletadas.filter(n => n !== leccionActual);

        alert("No se pudo guardar el progreso en este navegador.");
        return;
      }
    }

    actualizarBotonesLecciones();
    botonCompletar.textContent = "Actividad completada ✓";
  });

  // REGISTRO DE GASTOS HORMIGA
  const formularioGasto = document.getElementById("form-gasto");
  const campoConcepto = document.getElementById("concepto");
  const campoImporte = document.getElementById("importe");
  const campoCategoria = document.getElementById("categoria");
  const listaGastos = document.getElementById("lista-gastos");
  const mensajeGasto = document.getElementById("mensaje-gasto");

  formularioGasto.addEventListener("submit", evento => {
    evento.preventDefault();

    const concepto = campoConcepto.value.trim();
    const importe = Number(campoImporte.value);

    if (
      !concepto ||
      !Number.isFinite(importe) ||
      importe <= 0 ||
      importe > 1000000
    ) {
      mensajeGasto.textContent =
        "Escribe un concepto y una cantidad válida.";
      return;
    }

    const nuevoGasto = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      concepto,
      importe,
      categoria: campoCategoria.value,
      fecha: fechaLocal()
    };

    gastos.unshift(nuevoGasto);

    if (!guardarDatos("finanzalab_gastos", gastos)) {
      gastos.shift();
      mensajeGasto.textContent =
        "No se pudo guardar el gasto en este navegador.";
      return;
    }

    formularioGasto.reset();
    mensajeGasto.textContent = "¡Gasto registrado correctamente!";
    actualizarGastos();
    actualizarInicio();
  });

  function actualizarGastos() {
    const hoy = fechaLocal();
    const mesActual = hoy.slice(0, 7);

    const totalHoy = gastos
      .filter(gasto => gasto.fecha === hoy)
      .reduce((suma, gasto) => suma + gasto.importe, 0);

    const totalMes = gastos
      .filter(gasto => gasto.fecha.startsWith(mesActual))
      .reduce((suma, gasto) => suma + gasto.importe, 0);

    document.getElementById("total-hoy").textContent =
      formatoDinero(totalHoy);

    document.getElementById("total-mes").textContent =
      formatoDinero(totalMes);

    document.getElementById("cantidad-gastos").textContent =
      String(gastos.length);

    listaGastos.replaceChildren();

    if (gastos.length === 0) {
      const vacio = document.createElement("div");
      vacio.className = "vacio";

      const icono = document.createElement("span");
      icono.textContent = "▤";

      const texto = document.createElement("p");
      texto.textContent = "Aún no tienes gastos registrados.";

      const detalle = document.createElement("small");
      detalle.textContent = "Tu primer registro aparecerá aquí.";

      vacio.append(icono, texto, detalle);
      listaGastos.appendChild(vacio);
      return;
    }

    gastos.slice(0, 10).forEach(gasto => {
      const fila = document.createElement("div");
      fila.className = "gasto-item";

      const icono = document.createElement("div");
      icono.className = "gasto-icono";
      icono.textContent = "↗";

      const detalle = document.createElement("div");
      detalle.className = "gasto-detalle";

      const concepto = document.createElement("strong");
      concepto.textContent = gasto.concepto;

      const informacion = document.createElement("span");
      informacion.textContent =
        `${gasto.categoria} · ${gasto.fecha}`;

      detalle.append(concepto, informacion);

      const cantidad = document.createElement("span");
      cantidad.className = "gasto-cantidad";
      cantidad.textContent = formatoDinero(gasto.importe);

      const eliminar = document.createElement("button");
      eliminar.type = "button";
      eliminar.className = "gasto-eliminar";
      eliminar.textContent = "✕";
      eliminar.setAttribute(
        "aria-label",
        `Eliminar gasto ${gasto.concepto}`
      );

      eliminar.addEventListener("click", () => {
        const gastosAnteriores = gastos;

        gastos = gastos.filter(item => item.id !== gasto.id);

        if (!guardarDatos("finanzalab_gastos", gastos)) {
          gastos = gastosAnteriores;
          mensajeGasto.textContent =
            "No se pudo eliminar el gasto.";
          return;
        }

        mensajeGasto.textContent = "Gasto eliminado.";
        actualizarGastos();
        actualizarInicio();
      });

      fila.append(icono, detalle, cantidad, eliminar);
      listaGastos.appendChild(fila);
    });
  }

  // BORRAR HISTORIAL DE GASTOS
  document.getElementById("borrar-gastos").addEventListener(
    "click",
    () => {
      if (gastos.length === 0) {
        mensajeGasto.textContent = "No hay gastos que borrar.";
        return;
      }

      const confirmar = confirm(
        "¿Quieres borrar todo tu historial de gastos? Esta acción no se puede deshacer."
      );

      if (!confirmar) return;

      const anteriores = gastos;
      gastos = [];

      if (!guardarDatos("finanzalab_gastos", gastos)) {
        gastos = anteriores;
        mensajeGasto.textContent =
          "No se pudo borrar el historial.";
        return;
      }

      mensajeGasto.textContent = "Historial eliminado.";
      actualizarGastos();
      actualizarInicio();
    }
  );

  // META DE AHORRO PERSONAL
  const formularioAhorro = document.getElementById("form-ahorro");
  const campoMetaNombre = document.getElementById("meta-nombre");
  const campoMetaTotal = document.getElementById("meta-total");
  const campoAhorroActual = document.getElementById("ahorro-actual");
  const mensajeAhorro = document.getElementById("mensaje-ahorro");

  function actualizarAhorro() {
    const objetivo = Number(metaAhorro.objetivo) || 0;
    const actual = Number(metaAhorro.actual) || 0;
    const restante = Math.max(objetivo - actual, 0);

    const porcentaje = objetivo > 0
      ? Math.min((actual / objetivo) * 100, 100)
      : 0;

    document.getElementById("ahorro-nombre-vista").textContent =
      metaAhorro.nombre || "Tu próxima meta";

    document.getElementById("ahorro-guardado").textContent =
      formatoDinero(actual);

    document.getElementById("barra-ahorro").style.width =
      `${porcentaje}%`;

    document.getElementById("ahorro-porcentaje").textContent =
      `${Math.round(porcentaje)}% completado`;

    document.getElementById("ahorro-restante").textContent =
      objetivo > 0 && actual >= objetivo
        ? "¡Meta alcanzada!"
        : `${formatoDinero(restante)} restantes`;

    const consejo = document.getElementById("consejo-texto");

    if (objetivo > 0 && actual >= objetivo) {
      consejo.textContent =
        "¡Felicidades! Has alcanzado tu meta de ahorro. Puedes definir una nueva.";
    } else if (actual > 0) {
      consejo.textContent =
        "Vas avanzando. Revisa tu progreso y procura reservar una cantidad que se ajuste a tus posibilidades.";
    } else {
      consejo.textContent =
        "Define una meta que se adapte a tus posibilidades y avanza a tu propio ritmo.";
    }

    campoMetaNombre.value = metaAhorro.nombre || "";
    campoMetaTotal.value = objetivo || "";
    campoAhorroActual.value = actual || "";
  }

  formularioAhorro.addEventListener("submit", evento => {
    evento.preventDefault();

    const nombre = campoMetaNombre.value.trim();
    const objetivo = Number(campoMetaTotal.value);
    const actual = Number(campoAhorroActual.value);

    if (
      !nombre ||
      !Number.isFinite(objetivo) ||
      !Number.isFinite(actual) ||
      objetivo <= 0 ||
      actual < 0 ||
      objetivo > 100000000 ||
      actual > 100000000
    ) {
      mensajeAhorro.textContent =
        "Revisa el nombre y las cantidades de tu meta.";
      return;
    }

    metaAhorro = { nombre, objetivo, actual };

    if (!guardarDatos("finanzalab_meta", metaAhorro)) {
      mensajeAhorro.textContent =
        "No se pudo guardar tu meta en este navegador.";
      return;
    }

    mensajeAhorro.textContent = "¡Tu meta de ahorro está guardada!";
    actualizarAhorro();
    actualizarInicio();
  });

  // CARGAR INFORMACIÓN AL ABRIR LA PÁGINA
  actualizarGastos();
  actualizarAhorro();
  actualizarBotonesLecciones();
  actualizarInicio();
});


