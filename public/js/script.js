
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
      currency: (config && config.moneda) || "MXN"
    }).format(cantidad);
  }

  function apiUrl(ruta) {
    const base = String(window.BASE_URL || "").replace(/\/$/, "");
    return `${base}/${String(ruta || "").replace(/^\//, "")}`;
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

  const CONFIG_POR_DEFECTO = {
    nombre: "",
    moneda: "MXN",
    animacion: true,
    consejos: true
  };

  let config = leerDatos("finanzalab_config", { ...CONFIG_POR_DEFECTO });
  let metas = leerDatos("finanzalab_metas", []);

  if (typeof config !== "object" || config === null) {
    config = { ...CONFIG_POR_DEFECTO };
  }
  config = { ...CONFIG_POR_DEFECTO, ...config };

  if (!Array.isArray(metas)) metas = [];

  // ========================================================
  // PERSISTENCIA: invitado (localStorage) o alumno (MySQL)
  // ========================================================
  let modoServidor = false;

  function refrescarVistas() {
    if (document.getElementById("lista-gastos")) actualizarGastos();
    if (document.getElementById("ahorro-guardado")) actualizarAhorro();
    if (document.querySelector("[data-leccion]")) actualizarBotonesLecciones();
    if (document.getElementById("lista-metas")) renderMetas();
    if (document.getElementById("badges-grid")) renderLogros();
    actualizarInicio();
  }

  function cargarDatosLocales() {
    gastos = leerDatos("finanzalab_gastos", []);
    metaAhorro = leerDatos("finanzalab_meta", {
      nombre: "",
      objetivo: 0,
      actual: 0
    });
    leccionesCompletadas = leerDatos("finanzalab_lecciones", []);
    metas = leerDatos("finanzalab_metas", []);

    if (!Array.isArray(gastos)) gastos = [];
    if (!Array.isArray(leccionesCompletadas)) leccionesCompletadas = [];
    if (!Array.isArray(metas)) metas = [];
    if (typeof metaAhorro !== "object" || metaAhorro === null) {
      metaAhorro = { nombre: "", objetivo: 0, actual: 0 };
    }

    refrescarVistas();
  }

  async function apiDatos(accion, payload = {}) {
    const resp = await fetch(apiUrl("api/datos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: accion, ...payload })
    });
    return resp.json();
  }

  function aplicarDatosServidor(data) {
    gastos = Array.isArray(data.gastos) ? data.gastos : [];
    metas = Array.isArray(data.metas) ? data.metas : [];
    leccionesCompletadas = Array.isArray(data.lecciones)
      ? data.lecciones.map(Number)
      : [];
    metaAhorro =
      data.ahorro && typeof data.ahorro === "object"
        ? {
            nombre: data.ahorro.nombre || "",
            objetivo: Number(data.ahorro.objetivo) || 0,
            actual: Number(data.ahorro.actual) || 0
          }
        : { nombre: "", objetivo: 0, actual: 0 };

    refrescarVistas();
  }

  function hayDatosLocales() {
    return (
      gastos.length > 0 ||
      metas.length > 0 ||
      leccionesCompletadas.length > 0 ||
      Number(metaAhorro.objetivo) > 0
    );
  }

  function servidorVacio(data) {
    return (
      (!data.gastos || data.gastos.length === 0) &&
      (!data.metas || data.metas.length === 0) &&
      (!data.lecciones || data.lecciones.length === 0) &&
      (!data.ahorro || Number(data.ahorro.objetivo) <= 0)
    );
  }

  let migracionEnCurso = false;

  // Al iniciar sesión se cargan los datos del servidor. Si la cuenta es
  // nueva y había datos guardados en el navegador, se importan una sola vez.
  async function cargarDatosServidor() {
    try {
      const resp = await fetch(`${apiUrl("api/datos")}?action=cargar`);
      const data = await resp.json();
      if (!data.ok) return;

      if (servidorVacio(data) && hayDatosLocales() && !migracionEnCurso) {
        migracionEnCurso = true;
        await apiDatos("migrar", {
          gastos,
          metas,
          ahorro: metaAhorro,
          lecciones: leccionesCompletadas
        });
        migracionEnCurso = false;

        const resp2 = await fetch(`${apiUrl("api/datos")}?action=cargar`);
        const data2 = await resp2.json();
        if (data2.ok) aplicarDatosServidor(data2);
        return;
      }

      aplicarDatosServidor(data);
    } catch {
      /* Sin conexión: se conservan los datos locales. */
    }
  }

  // MENÚ LATERAL Y MENÚ PARA CELULAR
  if (menuToggle && barraLateral) {
    menuToggle.addEventListener("click", () => {
      const abierto = barraLateral.classList.toggle("menu-abierto");

      menuToggle.setAttribute("aria-expanded", String(abierto));
      menuToggle.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
      );
      menuToggle.textContent = abierto ? "✕" : "☰";
    });
  }

  // NAVEGACIÓN ENTRE SECCIONES (se muestra una vista a la vez)
  const llamadoFinal = document.querySelector(".llamado-final");

  const vistas = {
    inicio: [document.getElementById("inicio"), llamadoFinal],
    nosotros: [document.getElementById("nosotros")],
    reticula: [document.getElementById("reticula")],
    gastos: [document.getElementById("gastos")],
    ahorro: [document.getElementById("ahorro")]
  };

  const elementosVista = Object.values(vistas).flat().filter(Boolean);

  function cerrarMenuMovil() {
    if (!barraLateral || !menuToggle) return;
    barraLateral.classList.remove("menu-abierto");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    menuToggle.textContent = "☰";
  }

  function mostrarVista(id) {
    if (!navegacion) return;
    const activa = vistas[id] ? id : "inicio";

    elementosVista.forEach(elemento => {
      elemento.hidden = !vistas[activa].includes(elemento);
    });

    navegacion.querySelectorAll("a").forEach(enlace => {
      enlace.classList.toggle(
        "activo",
        enlace.getAttribute("href") === `#${activa}`
      );
    });

    cerrarMenuMovil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    const destino = enlace.getAttribute("href").slice(1);
    if (!vistas[destino]) return;

    enlace.addEventListener("click", evento => {
      evento.preventDefault();
      mostrarVista(destino);
      history.replaceState(null, "", `#${destino}`);
    });
  });

  mostrarVista(window.location.hash.slice(1));

  // PROGRESO GENERAL DE LA ESCUELA
  function actualizarInicio() {
    const totalGastos = gastos.length;

    const elGastos =
      document.getElementById("hero-gastos") ||
      document.getElementById("stat-gastos");
    if (elGastos) elGastos.textContent = String(totalGastos);

    const elAhorro =
      document.getElementById("hero-ahorro") ||
      document.getElementById("stat-ahorro");
    if (elAhorro) {
      elAhorro.textContent = formatoDinero(Number(metaAhorro.actual) || 0);
    }

    const elLecciones = document.getElementById("stat-lecciones");
    if (elLecciones) {
      elLecciones.textContent = String(leccionesCompletadas.length);
    }

    const elMetas = document.getElementById("stat-metas");
    if (elMetas) {
      const activas = metas.filter(
        meta => Number(meta.actual) < Number(meta.objetivo)
      ).length;
      elMetas.textContent = String(activas);
    }

    const porcentaje = Math.round(
      (leccionesCompletadas.length / 3) * 100
    );

    const progresoGeneral = document.getElementById("progreso-general");
    if (progresoGeneral) progresoGeneral.style.width = `${porcentaje}%`;

    const progresoTexto = document.getElementById("progreso-texto");
    if (progresoTexto) progresoTexto.textContent = `${porcentaje}%`;

    const anillo = document.getElementById("progreso-anillo");
    if (anillo) {
      anillo.style.background =
        `conic-gradient(var(--accent-teal) ${porcentaje}%, ` +
        `var(--card-border) ${porcentaje}%)`;
    }
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
      if (typeof panelLeccion.scrollIntoView === "function") {
        panelLeccion.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    });
  });

  document.getElementById("cerrar-leccion")?.addEventListener(
    "click",
    () => {
      panelLeccion.hidden = true;
    }
  );

  botonCompletar?.addEventListener("click", async () => {
    if (leccionActual === null) return;

    if (!leccionesCompletadas.includes(leccionActual)) {
      leccionesCompletadas.push(leccionActual);
      leccionesCompletadas.sort((a, b) => a - b);

      if (modoServidor) {
        try {
          const data = await apiDatos("completar_leccion", {
            numero: leccionActual
          });
          if (!data.ok) throw new Error();
          leccionesCompletadas = Array.isArray(data.lecciones)
            ? data.lecciones.map(Number)
            : leccionesCompletadas;
        } catch {
          leccionesCompletadas = leccionesCompletadas.filter(
            n => n !== leccionActual
          );
          alert("No se pudo guardar el progreso en el servidor. Revisa tu conexión.");
          return;
        }
      } else if (!guardarDatos(
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

  formularioGasto?.addEventListener("submit", async evento => {
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

    if (modoServidor) {
      try {
        const data = await apiDatos("crear_gasto", {
          concepto: nuevoGasto.concepto,
          importe: nuevoGasto.importe,
          categoria: nuevoGasto.categoria,
          fecha: nuevoGasto.fecha
        });
        if (!data.ok || !data.gasto) throw new Error();
        Object.assign(nuevoGasto, data.gasto);
      } catch {
        gastos.shift();
        mensajeGasto.textContent =
          "No se pudo guardar el gasto en el servidor.";
        return;
      }
    } else if (!guardarDatos("finanzalab_gastos", gastos)) {
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

    const elTotalHoy = document.getElementById("total-hoy");
    if (elTotalHoy) elTotalHoy.textContent = formatoDinero(totalHoy);

    const elTotalMes = document.getElementById("total-mes");
    if (elTotalMes) elTotalMes.textContent = formatoDinero(totalMes);

    const elCantidadGastos = document.getElementById("cantidad-gastos");
    if (elCantidadGastos) elCantidadGastos.textContent = String(gastos.length);

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

      eliminar.addEventListener("click", async () => {
        const gastosAnteriores = gastos;

        gastos = gastos.filter(item => item.id !== gasto.id);

        if (modoServidor) {
          try {
            const data = await apiDatos("eliminar_gasto", { id: gasto.id });
            if (!data.ok) throw new Error();
          } catch {
            gastos = gastosAnteriores;
            mensajeGasto.textContent =
              "No se pudo eliminar el gasto.";
            return;
          }
        } else if (!guardarDatos("finanzalab_gastos", gastos)) {
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
  document.getElementById("borrar-gastos")?.addEventListener(
    "click",
    async () => {
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

      if (modoServidor) {
        try {
          const data = await apiDatos("borrar_gastos");
          if (!data.ok) throw new Error();
        } catch {
          gastos = anteriores;
          mensajeGasto.textContent =
            "No se pudo borrar el historial.";
          return;
        }
      } else if (!guardarDatos("finanzalab_gastos", gastos)) {
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

  formularioAhorro?.addEventListener("submit", async evento => {
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

    const metaAnterior = metaAhorro;
    metaAhorro = { nombre, objetivo, actual };

    if (modoServidor) {
      try {
        const data = await apiDatos("guardar_ahorro", {
          nombre,
          objetivo,
          actual
        });
        if (!data.ok) throw new Error();
        if (data.ahorro) {
          metaAhorro = {
            nombre: data.ahorro.nombre || nombre,
            objetivo: Number(data.ahorro.objetivo) || objetivo,
            actual: Number(data.ahorro.actual) || actual
          };
        }
      } catch {
        metaAhorro = metaAnterior;
        mensajeAhorro.textContent =
          "No se pudo guardar tu meta en el servidor.";
        return;
      }
    } else if (!guardarDatos("finanzalab_meta", metaAhorro)) {
      mensajeAhorro.textContent =
        "No se pudo guardar tu meta en este navegador.";
      return;
    }

    mensajeAhorro.textContent = "¡Tu meta de ahorro está guardada!";
    actualizarAhorro();
    actualizarInicio();
  });

  // ========================================================
  // ASISTENTE INTELIGENTE: FINANBOT
  // ========================================================
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatVentana = document.getElementById("chat-ventana");
  const chatBtnCerrar = document.getElementById("chat-btn-cerrar");
  const chatMensajes = document.getElementById("chat-mensajes");
  const chatFormulario = document.getElementById("chat-formulario");
  const chatInput = document.getElementById("chat-input");

  const chatIconoAbrir = chatToggleBtn?.querySelector(".chat-icono-abrir");
  const chatIconoCerrar = chatToggleBtn?.querySelector(".chat-icono-cerrar");

  let historialChat = [];
  let estaRespondiendo = false;

  function alternarChat(forzarEstado) {
    if (!chatVentana) return;
    const abrir = typeof forzarEstado === "boolean" 
      ? forzarEstado 
      : !chatVentana.classList.contains("abierto");

    chatVentana.classList.toggle("abierto", abrir);
    chatVentana.setAttribute("aria-hidden", String(!abrir));
    chatToggleBtn?.setAttribute("aria-expanded", String(abrir));

    if (chatIconoAbrir && chatIconoCerrar) {
      chatIconoAbrir.hidden = abrir;
      chatIconoCerrar.hidden = !abrir;
    }

    if (abrir) {
      setTimeout(() => chatInput?.focus(), 150);
      scrollChatAbajo();
    }
  }

  function scrollChatAbajo() {
    if (!chatMensajes) return;
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
  }

  function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  function formatearMarkdown(texto) {
    let limpio = escaparHTML(texto);

    // Negritas: **texto**
    limpio = limpio.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Listas con guión
    const lineas = limpio.split("\n");
    let enLista = false;
    let resultado = "";

    for (const linea of lineas) {
      const lineaTrim = linea.trim();
      if (lineaTrim.startsWith("- ") || lineaTrim.startsWith("* ")) {
        if (!enLista) {
          resultado += "<ul>";
          enLista = true;
        }
        resultado += `<li>${lineaTrim.slice(2)}</li>`;
      } else {
        if (enLista) {
          resultado += "</ul>";
          enLista = false;
        }
        if (lineaTrim) {
          resultado += `<p>${lineaTrim}</p>`;
        }
      }
    }

    if (enLista) resultado += "</ul>";
    return resultado || `<p>${limpio}</p>`;
  }

  function agregarMensaje(texto, tipo = "bot") {
    if (!chatMensajes) return;

    const mensajeDiv = document.createElement("div");
    mensajeDiv.className = `mensaje-chat mensaje-${tipo}`;

    const contenidoDiv = document.createElement("div");
    contenidoDiv.className = "mensaje-contenido";

    if (tipo === "bot") {
      contenidoDiv.innerHTML = formatearMarkdown(texto);
    } else {
      const p = document.createElement("p");
      p.textContent = texto;
      contenidoDiv.appendChild(p);
    }

    mensajeDiv.appendChild(contenidoDiv);
    chatMensajes.appendChild(mensajeDiv);
    scrollChatAbajo();
  }

  function mostrarEscribiendo() {
    quitarEscribiendo();
    const escribiendo = document.createElement("div");
    escribiendo.className = "chat-escribiendo";
    escribiendo.id = "chat-escribiendo-indicador";
    escribiendo.innerHTML = "<span></span><span></span><span></span>";
    chatMensajes?.appendChild(escribiendo);
    scrollChatAbajo();
  }

  function quitarEscribiendo() {
    const elem = document.getElementById("chat-escribiendo-indicador");
    if (elem) elem.remove();
  }

  async function enviarPregunta(texto) {
    const mensaje = texto.trim();
    if (!mensaje || estaRespondiendo) return;

    estaRespondiendo = true;
    agregarMensaje(mensaje, "usuario");

    if (chatInput) {
      chatInput.value = "";
      chatInput.disabled = true;
    }

    mostrarEscribiendo();

    try {
      const respuesta = await fetch(apiUrl("api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: mensaje,
          history: historialChat
        })
      });

      const data = await respuesta.json();
      quitarEscribiendo();

      if (data.ok && data.reply) {
        agregarMensaje(data.reply, "bot");
        historialChat.push({ role: "user", text: mensaje });
        historialChat.push({ role: "model", text: data.reply });
      } else if (data.needs_key) {
        agregarMensaje(
          "⚙️ **Casi listo para comenzar:**\nPara activar a FinanBot, por favor abre el archivo `config/config.php` en Visual Studio Code y pega tu clave API de Google Gemini.",
          "bot"
        );
      } else {
        agregarMensaje(
          `⚠️ ${data.error || "Ocurrió un problema al procesar la respuesta. Intenta nuevamente."}`,
          "bot"
        );
      }
    } catch (error) {
      quitarEscribiendo();
      agregarMensaje(
        "⚠️ No se pudo conectar con el servidor local. Asegúrate de tener Apache encendido en XAMPP y acceder mediante http://localhost/EduFin/.",
        "bot"
      );
    } finally {
      estaRespondiendo = false;
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
    }
  }

  chatToggleBtn?.addEventListener("click", () => alternarChat());
  chatBtnCerrar?.addEventListener("click", () => alternarChat(false));

  chatFormulario?.addEventListener("submit", evento => {
    evento.preventDefault();
    if (chatInput) enviarPregunta(chatInput.value);
  });

  // Manejo de chips con preguntas sugeridas
  chatMensajes?.addEventListener("click", evento => {
    const chip = evento.target.closest(".chip-sugerencia");
    if (chip && chip.dataset.pregunta) {
      enviarPregunta(chip.dataset.pregunta);
    }
  });

  // ========================================================
  // BUSCADOR GLOBAL DE LA BARRA SUPERIOR
  // ========================================================
  const INDICE_BUSQUEDA = [
    {
      titulo: "Inicio",
      descripcion: "Tu resumen, progreso y consejos del día.",
      url: "",
      icono: "fa-house",
      claves: "inicio panel dashboard resumen consejos progreso principal portada"
    },
    {
      titulo: "Retícula académica",
      descripcion: "Los tres niveles de aprendizaje financiero.",
      url: "reticula",
      icono: "fa-graduation-cap",
      claves: "reticula niveles lecciones nivel curso clases aprender academia leccion inversion invertir riesgo rendimiento interes compuesto"
    },
    {
      titulo: "Materiales",
      descripcion: "Guías, plantillas y recursos descargables.",
      url: "materiales",
      icono: "fa-book-open",
      claves: "materiales guias plantillas checklist glosario recursos descargar presupuesto 50/30/20 fondo de emergencia ahorro"
    },
    {
      titulo: "Gastos hormiga",
      descripcion: "Registra y controla tus pequeños gastos.",
      url: "gastos-hormiga",
      icono: "fa-wallet",
      claves: "gastos hormiga registrar gasto cafe antojo compras controlar categorias comida transporte entretenimiento servicios historial"
    },
    {
      titulo: "Mi ahorro",
      descripcion: "Define y sigue tu meta de ahorro.",
      url: "mi-ahorro",
      icono: "fa-piggy-bank",
      claves: "ahorro ahorrar alcancia alcancia cerdito guardar dinero meta depositar"
    },
    {
      titulo: "Metas",
      descripcion: "Crea y sigue tus metas financieras.",
      url: "metas",
      icono: "fa-bullseye",
      claves: "metas objetivos meta ahorrar para proposito"
    },
    {
      titulo: "Logros",
      descripcion: "Tus insignias y recompensas.",
      url: "logros",
      icono: "fa-trophy",
      claves: "logros insignias medallas premios recompensas trofeo"
    },
    {
      titulo: "Configuración",
      descripcion: "Cuenta, avatar, moneda y preferencias.",
      url: "configuracion",
      icono: "fa-gear",
      claves: "configuracion ajustes cuenta perfil avatar moneda contrasena sesion opciones preferencias"
    }
  ];

  function normalizarTexto(texto) {
    return (texto || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function inicializarBuscador() {
    const contenedor = document.querySelector(".search-bar");
    const input = contenedor?.querySelector("input");
    if (!contenedor || !input) return;

    if (contenedor.dataset.buscadorListo === "true") return;
    contenedor.dataset.buscadorListo = "true";

    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "search-resultados";
    panel.hidden = true;
    panel.setAttribute("role", "listbox");
    contenedor.appendChild(panel);

    let resultados = [];
    let seleccionado = -1;

    function cerrarPanel() {
      panel.hidden = true;
      panel.innerHTML = "";
      resultados = [];
      seleccionado = -1;
      input.setAttribute("aria-expanded", "false");
    }

    function paginasCoincidentes(consulta) {
      const terminos = normalizarTexto(consulta).split(/\s+/).filter(Boolean);
      if (!terminos.length) return [];
      return INDICE_BUSQUEDA.filter(pagina => {
        const texto = normalizarTexto(
          `${pagina.titulo} ${pagina.descripcion} ${pagina.claves}`
        );
        return terminos.every(t => texto.includes(t));
      });
    }

    function crearOpcionBot(consulta) {
      const opcion = document.createElement("button");
      opcion.type = "button";
      opcion.className = "search-resultado search-resultado-bot";
      opcion.dataset.bot = consulta;
      opcion.setAttribute("role", "option");
      opcion.innerHTML = `
        <span class="search-resultado-icono"><i class="fa-solid fa-robot"></i></span>
        <span class="search-resultado-texto">
          <strong>Preguntar a FinanBot</strong>
          <small>Consulta "${escaparHTML(consulta)}" con tu tutor virtual</small>
        </span>`;
      return opcion;
    }

    function renderizar(consulta) {
      resultados = paginasCoincidentes(consulta);
      seleccionado = -1;
      panel.innerHTML = "";

      if (!consulta.trim()) {
        cerrarPanel();
        return;
      }

      if (!resultados.length) {
        const vacio = document.createElement("p");
        vacio.className = "search-vacio";
        vacio.textContent = `Sin resultados para "${consulta}"`;
        panel.appendChild(vacio);
      } else {
        resultados.forEach((pagina, i) => {
          const opcion = document.createElement("a");
          opcion.href = apiUrl(pagina.url);
          opcion.className = "search-resultado";
          opcion.setAttribute("role", "option");
          opcion.dataset.indice = String(i);
          opcion.innerHTML = `
            <span class="search-resultado-icono"><i class="fa-solid ${pagina.icono}"></i></span>
            <span class="search-resultado-texto">
              <strong>${escaparHTML(pagina.titulo)}</strong>
              <small>${escaparHTML(pagina.descripcion)}</small>
            </span>
            <i class="fa-solid fa-arrow-right search-resultado-flecha"></i>`;
          panel.appendChild(opcion);
        });
      }

      panel.appendChild(crearOpcionBot(consulta));
      panel.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    function moverSeleccion(delta) {
      if (!resultados.length) return;
      seleccionado = (seleccionado + delta + resultados.length) % resultados.length;
      panel.querySelectorAll(".search-resultado").forEach((elem, i) => {
        const activo = i === seleccionado;
        elem.classList.toggle("activo", activo);
        if (activo) elem.scrollIntoView({ block: "nearest" });
      });
    }

    input.addEventListener("input", () => renderizar(input.value));
    input.addEventListener("focus", () => {
      if (input.value.trim()) renderizar(input.value);
    });

    input.addEventListener("keydown", evento => {
      if (evento.key === "ArrowDown") {
        evento.preventDefault();
        moverSeleccion(1);
      } else if (evento.key === "ArrowUp") {
        evento.preventDefault();
        moverSeleccion(-1);
      } else if (evento.key === "Escape") {
        cerrarPanel();
        input.blur();
      } else if (evento.key === "Enter") {
        const destino = seleccionado >= 0 ? resultados[seleccionado] : resultados[0];
        if (destino) {
          evento.preventDefault();
          window.location.href = destino.url;
        }
      }
    });

    panel.addEventListener("click", evento => {
      const botonBot = evento.target.closest(".search-resultado-bot");
      if (!botonBot) return;
      evento.preventDefault();
      const consulta = botonBot.dataset.bot;
      cerrarPanel();
      input.value = "";
      alternarChat(true);
      enviarPregunta(consulta);
    });

    document.addEventListener("click", evento => {
      if (!contenedor.contains(evento.target)) cerrarPanel();
    });
  }

  inicializarBuscador();

  // ========================================================
  // CONTROLADOR DE CUENTA DE USUARIO (REGISTRO / LOGIN)
  // ========================================================
  const btnAbrirAuth = document.getElementById("btn-abrir-auth");
  const modalAuthOverlay = document.getElementById("modal-auth-overlay");
  const btnCerrarAuth = document.getElementById("btn-cerrar-auth");
  const tabRegistro = document.getElementById("tab-registro");
  const tabLogin = document.getElementById("tab-login");
  const modalAuthTabs = document.getElementById("modal-auth-tabs");
  const formRegistro = document.getElementById("form-registro");
  const formLogin = document.getElementById("form-login");
  const formRecuperar = document.getElementById("form-recuperar");
  const btnAbrirRecuperar = document.getElementById("btn-abrir-recuperar");
  const btnVolverLogin = document.getElementById("btn-volver-login");
  const authMensaje = document.getElementById("auth-mensaje");
  const authPerfilActivo = document.getElementById("auth-perfil-activo");
  const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

  const textoUsuarioEstado = document.getElementById("texto-usuario-estado");
  const subtextoUsuario = document.getElementById("subtexto-usuario");
  const perfilNombre = document.getElementById("perfil-nombre");
  const perfilEmail = document.getElementById("perfil-email");
  const sidebarNombre = document.getElementById("sidebar-nombre");

  let usuarioActual = null;

  function mostrarMensajeAuth(texto, tipo = "") {
    if (!authMensaje) return;
    authMensaje.textContent = texto;
    authMensaje.className = `auth-mensaje ${tipo}`.trim();
  }

  function esCorreoValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || "").trim());
  }

  function inicializarValidacionCorreos() {
    if (!modalAuthOverlay) return;

    modalAuthOverlay.querySelectorAll('input[type="email"]').forEach(input => {
      if (input.dataset.correoValidado === "true") return;
      input.dataset.correoValidado = "true";
      input.setAttribute("inputmode", "email");
      input.setAttribute("autocomplete", "email");

      const contenedor = input.closest(".form-field");
      let mensaje = contenedor?.querySelector(".mensaje-campo");
      if (contenedor && !mensaje) {
        mensaje = document.createElement("p");
        mensaje.className = "mensaje-campo";
        mensaje.setAttribute("aria-live", "polite");
        contenedor.appendChild(mensaje);
      }

      const validar = () => {
        const valor = input.value.trim();
        const boton = input.closest("form")?.querySelector('button[type="submit"]');

        if (valor === "") {
          contenedor?.classList.remove("campo-valido", "campo-invalido");
          if (mensaje) mensaje.textContent = "";
          if (boton) boton.removeAttribute("disabled");
          return;
        }

        const valido = esCorreoValido(valor);
        contenedor?.classList.toggle("campo-valido", valido);
        contenedor?.classList.toggle("campo-invalido", !valido);
        if (mensaje) {
          mensaje.textContent = valido
            ? "Correo válido"
            : "Ingresa un correo válido, por ejemplo nombre@dominio.com";
        }
        if (boton) {
          if (valido) boton.removeAttribute("disabled");
          else boton.setAttribute("disabled", "disabled");
        }
      };

    input.addEventListener("input", validar);
    input.addEventListener("blur", validar);
    validar();
  });
  }

  function esPasswordValida(valor) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/.test(String(valor || ""));
  }

  function inicializarTogglePassword() {
    if (!modalAuthOverlay) return;

    modalAuthOverlay.querySelectorAll(".toggle-password").forEach(boton => {
      if (boton.dataset.toggleListo === "true") return;
      boton.dataset.toggleListo = "true";

      boton.addEventListener("click", () => {
        const input = document.getElementById(boton.dataset.target);
        if (!input) return;

        const mostrando = input.type === "text";
        input.type = mostrando ? "password" : "text";
        boton.setAttribute("aria-pressed", String(!mostrando));
        boton.setAttribute("aria-label", mostrando ? "Mostrar contraseña" : "Ocultar contraseña");

        const icono = boton.querySelector("i");
        if (icono) {
          icono.classList.toggle("fa-eye", mostrando);
          icono.classList.toggle("fa-eye-slash", !mostrando);
        }
      });
    });
  }

  function inicializarValidacionPasswords() {
    if (!modalAuthOverlay) return;

    modalAuthOverlay.querySelectorAll('input[type="password"]').forEach(input => {
      if (input.dataset.passwordValidada === "true") return;
      input.dataset.passwordValidada = "true";

      const contenedor = input.closest(".form-field");
      let mensaje = contenedor?.querySelector(".mensaje-campo");
      if (contenedor && !mensaje) {
        mensaje = document.createElement("p");
        mensaje.className = "mensaje-campo";
        mensaje.setAttribute("aria-live", "polite");
        contenedor.appendChild(mensaje);
      }

      const validar = () => {
        const valor = input.value;

        if (valor === "") {
          contenedor?.classList.remove("campo-valido", "campo-invalido");
          if (mensaje) mensaje.textContent = "";
          return;
        }

        const valido = esPasswordValida(valor);
        contenedor?.classList.toggle("campo-valido", valido);
        contenedor?.classList.toggle("campo-invalido", !valido);
        if (mensaje) {
          mensaje.textContent = valido
            ? "Contraseña válida"
            : "Debe tener 6 caracteres, con al menos una letra y un número";
        }
      };

      input.addEventListener("input", validar);
      input.addEventListener("blur", validar);
      validar();
    });
  }


  function cambiarPestanaAuth(pestana) {
    mostrarMensajeAuth("");
    if (pestana === "recuperar") {
      modalAuthTabs?.setAttribute("hidden", "true");
      formRegistro?.setAttribute("hidden", "true");
      formLogin?.setAttribute("hidden", "true");
      formRecuperar?.removeAttribute("hidden");
    } else if (pestana === "registro") {
      modalAuthTabs?.removeAttribute("hidden");
      tabRegistro?.classList.add("activo");
      tabLogin?.classList.remove("activo");
      formRegistro?.removeAttribute("hidden");
      formLogin?.setAttribute("hidden", "true");
      formRecuperar?.setAttribute("hidden", "true");
    } else {
      modalAuthTabs?.removeAttribute("hidden");
      tabLogin?.classList.add("activo");
      tabRegistro?.classList.remove("activo");
      formLogin?.removeAttribute("hidden");
      formRegistro?.setAttribute("hidden", "true");
      formRecuperar?.setAttribute("hidden", "true");
    }
  }

  function actualizarUIUsuario(user) {
    usuarioActual = user;
    modoServidor = Boolean(user);
    if (user) {
      if (textoUsuarioEstado) textoUsuarioEstado.textContent = `Hola, ${user.nombre.split(" ")[0]}`;
      if (subtextoUsuario) subtextoUsuario.textContent = "Alumno activo ✦";
      if (perfilNombre) perfilNombre.textContent = user.nombre;
      if (perfilEmail) perfilEmail.textContent = user.email;
      if (sidebarNombre) sidebarNombre.textContent = `Hola, ${user.nombre.split(" ")[0]}`;

      const configCuentaNombre = document.getElementById("config-cuenta-nombre");
      const configCuentaEmail = document.getElementById("config-cuenta-email");
      if (configCuentaNombre) configCuentaNombre.textContent = user.nombre;
      if (configCuentaEmail) configCuentaEmail.textContent = user.email;

      // Ocultar formularios y tabs, mostrar perfil activo
      modalAuthTabs?.setAttribute("hidden", "true");
      formRegistro?.setAttribute("hidden", "true");
      formLogin?.setAttribute("hidden", "true");
      authPerfilActivo?.removeAttribute("hidden");
    } else {
      if (textoUsuarioEstado) textoUsuarioEstado.textContent = "Crear cuenta";
      if (subtextoUsuario) subtextoUsuario.textContent = "o Iniciar sesión";
      if (sidebarNombre) sidebarNombre.textContent = "Hola, Usuario";

      const configCuentaNombre = document.getElementById("config-cuenta-nombre");
      const configCuentaEmail = document.getElementById("config-cuenta-email");
      if (configCuentaNombre) configCuentaNombre.textContent = "Aún no has iniciado sesión";
      if (configCuentaEmail) configCuentaEmail.textContent = "Tu progreso se guarda en este navegador.";

      modalAuthTabs?.removeAttribute("hidden");
      authPerfilActivo?.setAttribute("hidden", "true");
      cambiarPestanaAuth("registro");
    }
    const avatar = user && user.avatar ? user.avatar : leerAvatarLocal();
    aplicarAvatar(avatar);

    if (user) {
      cargarDatosServidor();
    } else {
      cargarDatosLocales();
    }
  }

  function abrirModalAuth() {
    mostrarMensajeAuth("");
    if (modalAuthOverlay) modalAuthOverlay.hidden = false;
  }

  function cerrarModalAuth() {
    if (modalAuthOverlay) modalAuthOverlay.hidden = true;
    mostrarMensajeAuth("");
  }

  async function verificarSesionUsuario() {
    try {
      const resp = await fetch(`${apiUrl("api/auth")}?action=check`);
      const data = await resp.json();
      if (data.ok && data.logged_in && data.user) {
        actualizarUIUsuario(data.user);
      } else {
        actualizarUIUsuario(null);
      }
    } catch {
      actualizarUIUsuario(null);
    }
  }

  formRegistro?.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("reg-nombre")?.value.trim();
    const email = document.getElementById("reg-email")?.value.trim();
    const password = document.getElementById("reg-password")?.value;

    if (!esCorreoValido(email)) {
      document.getElementById("reg-email")?.focus();
      mostrarMensajeAuth("Ingresa un correo electrónico válido (ejemplo: nombre@dominio.com).", "error");
      return;
    }

    if (!esPasswordValida(password)) {
      document.getElementById("reg-password")?.focus();
      mostrarMensajeAuth("La contraseña debe tener 6 caracteres, combinando letras y números.", "error");
      return;
    }

    mostrarMensajeAuth("Creando tu cuenta...", "");

    try {
      const resp = await fetch(apiUrl("api/auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "registro", nombre, email, password })
      });
      const data = await resp.json();

      if (data.ok && data.user) {
        mostrarMensajeAuth("¡Cuenta creada con éxito! Bienvenido.", "exito");
        setTimeout(() => {
          actualizarUIUsuario(data.user);
          cerrarModalAuth();
        }, 1200);
      } else {
        mostrarMensajeAuth(data.error || "No se pudo registrar.", "error");
      }
    } catch {
      mostrarMensajeAuth("Error de conexión al registrar cuenta.", "error");
    }
  });

  formLogin?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value;

    if (!esCorreoValido(email)) {
      document.getElementById("login-email")?.focus();
      mostrarMensajeAuth("Ingresa un correo electrónico válido (ejemplo: nombre@dominio.com).", "error");
      return;
    }

    mostrarMensajeAuth("Validando credenciales...", "");

    try {
      const resp = await fetch(apiUrl("api/auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password })
      });
      const data = await resp.json();

      if (data.ok && data.user) {
        mostrarMensajeAuth("¡Bienvenido de vuelta!", "exito");
        setTimeout(() => {
          actualizarUIUsuario(data.user);
          cerrarModalAuth();
        }, 1200);
      } else {
        mostrarMensajeAuth(data.error || "Error al iniciar sesión.", "error");
      }
    } catch {
      mostrarMensajeAuth("Error de conexión al iniciar sesión.", "error");
    }
  });

  btnCerrarSesion?.addEventListener("click", async () => {
    try {
      await fetch(`${apiUrl("api/auth")}?action=logout`);
      actualizarUIUsuario(null);
      mostrarMensajeAuth("Has cerrado tu sesión.", "exito");
    } catch {
      actualizarUIUsuario(null);
    }
  });

  // RECUPERAR CONTRASEÑA
  const formRecuperarEl = document.getElementById("form-recuperar");
  formRecuperarEl?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("rec-email")?.value.trim();
    const password = document.getElementById("rec-password")?.value;

    if (!esCorreoValido(email)) {
      document.getElementById("rec-email")?.focus();
      mostrarMensajeAuth("Ingresa un correo electrónico válido (ejemplo: nombre@dominio.com).", "error");
      return;
    }

    if (!esPasswordValida(password)) {
      document.getElementById("rec-password")?.focus();
      mostrarMensajeAuth("La nueva contraseña debe tener 6 caracteres, combinando letras y números.", "error");
      return;
    }

    mostrarMensajeAuth("Actualizando tu contraseña...", "");

    try {
      const resp = await fetch(apiUrl("api/auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recuperar", email, password })
      });
      const data = await resp.json();

      if (data.ok) {
        mostrarMensajeAuth(data.mensaje, "exito");
        // Limpiar los campos de recuperación
        document.getElementById("rec-email").value = "";
        document.getElementById("rec-password").value = "";
        // Regresar al login después de 2 segundos
        setTimeout(() => {
          cambiarPestanaAuth("login");
          mostrarMensajeAuth("Ya puedes iniciar sesión con tu nueva contraseña.", "exito");
        }, 2000);
      } else {
        mostrarMensajeAuth(data.error || "No se pudo restablecer la contraseña.", "error");
      }
    } catch {
      mostrarMensajeAuth("Error de conexión. Intenta nuevamente.", "error");
    }
  });

  btnAbrirRecuperar?.addEventListener("click", () => cambiarPestanaAuth("recuperar"));
  btnVolverLogin?.addEventListener("click", () => cambiarPestanaAuth("login"));

  btnAbrirAuth?.addEventListener("click", abrirModalAuth);
  btnCerrarAuth?.addEventListener("click", cerrarModalAuth);
  modalAuthOverlay?.addEventListener("click", e => {
    if (e.target === modalAuthOverlay) cerrarModalAuth();
  });

  tabRegistro?.addEventListener("click", () => cambiarPestanaAuth("registro"));
  tabLogin?.addEventListener("click", () => cambiarPestanaAuth("login"));

  // ============ AVATAR (FOTO O ICONO) ============
  const perfilAvatarEl = document.getElementById("perfil-avatar");
  const cuentaAvatarEl = document.querySelector(".cuenta-avatar");
  const sidebarAvatarEl = document.getElementById("sidebar-avatar");
  const btnEditarAvatar = document.getElementById("btn-editar-avatar");
  const avatarPicker = document.getElementById("avatar-picker");
  const avatarColores = document.getElementById("avatar-colores");
  const avatarIconos = document.getElementById("avatar-iconos");
  const inputFotoAvatar = document.getElementById("input-foto-avatar");
  const btnQuitarAvatar = document.getElementById("btn-quitar-avatar");

  const AVATAR_KEY = "finanzalab_avatar";
  const COLOR_DEFECTO = "#FF1E40";
  let colorAvatar = COLOR_DEFECTO;
  let avatarActual = null;

  function leerAvatarLocal() {
    try { return localStorage.getItem(AVATAR_KEY) || null; } catch { return null; }
  }

  function guardarAvatarLocal(valor) {
    try {
      if (valor) localStorage.setItem(AVATAR_KEY, valor);
      else localStorage.removeItem(AVATAR_KEY);
    } catch {}
  }

  const COLORES_AVATAR = [
    "#FF1E40", "#0066FF", "#0A1931", "#3B82F6", "#8B5CF6", "#EC4899",
    "#10B981", "#F97316", "#F59E0B", "#06B6D4", "#64748B", "#1F2937"
  ];

  const ICONOS_AVATAR = [
    "fa-user", "fa-user-astronaut", "fa-user-graduate", "fa-user-tie",
    "fa-user-secret", "fa-user-ninja", "fa-robot", "fa-cat", "fa-dog",
    "fa-frog", "fa-dragon", "fa-otter", "fa-fish", "fa-hippo", "fa-feather",
    "fa-paw", "fa-rocket", "fa-star", "fa-heart", "fa-crown", "fa-gem",
    "fa-lightbulb", "fa-mug-hot", "fa-pizza-slice"
  ];

  function colorContraste(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminancia > 150 ? "#0B132B" : "#FFFFFF";
  }

  function parseAvatar(avatar) {
    if (typeof avatar !== "string" || avatar === "") return { tipo: "default" };
    if (avatar.indexOf("data:image") === 0) return { tipo: "foto" };
    let m = avatar.match(/^built:#([0-9a-fA-F]{6}):(fa-[a-z0-9-]+)$/);
    if (m) return { tipo: "built", color: "#" + m[1].toLowerCase(), icon: m[2] };
    if (avatar.indexOf("icon:") === 0) return { tipo: "icon", icon: avatar.slice(5) };
    return { tipo: "default" };
  }

  function renderAvatar(el, avatar) {
    if (!el) return;
    el.innerHTML = "";
    el.style.background = "";
    el.style.color = "";
    const a = parseAvatar(avatar);
    if (a.tipo === "foto") {
      const img = document.createElement("img");
      img.src = avatar;
      img.alt = "Avatar";
      el.appendChild(img);
    } else if (a.tipo === "built") {
      el.style.background = a.color;
      el.style.color = colorContraste(a.color);
      el.innerHTML = `<i class="fa-solid ${a.icon}"></i>`;
    } else if (a.tipo === "icon") {
      el.innerHTML = `<i class="fa-solid ${a.icon}"></i>`;
    } else {
      el.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  function marcarColorActivo() {
    if (!avatarColores) return;
    [...avatarColores.querySelectorAll(".avatar-color")].forEach(b => {
      b.classList.toggle("activo", b.dataset.color.toLowerCase() === colorAvatar.toLowerCase());
    });
  }

  function aplicarAvatar(avatar) {
    avatarActual = avatar || null;
    const a = parseAvatar(avatarActual);
    if (a.tipo === "built") colorAvatar = a.color;
    renderAvatar(perfilAvatarEl, avatarActual);
    renderAvatar(cuentaAvatarEl, avatarActual);
    renderAvatar(sidebarAvatarEl, avatarActual);
    marcarColorActivo();
    if (avatarIconos) {
      [...avatarIconos.querySelectorAll("button")].forEach(b => {
        b.classList.toggle("activo", a.icon === b.dataset.icon);
      });
    }
  }

  function construirColores() {
    if (!avatarColores || avatarColores.children.length) return;
    COLORES_AVATAR.forEach(color => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "avatar-color";
      b.dataset.color = color;
      b.style.background = color;
      b.title = color;
      b.addEventListener("click", () => {
        colorAvatar = color;
        marcarColorActivo();
      });
      avatarColores.appendChild(b);
    });
    marcarColorActivo();
  }

  function construirIconosAvatar() {
    if (!avatarIconos || avatarIconos.children.length) return;
    ICONOS_AVATAR.forEach(icon => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.icon = icon;
      b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
      b.addEventListener("click", () => guardarAvatar("built:" + colorAvatar + ":" + icon));
      avatarIconos.appendChild(b);
    });
  }

  async function guardarAvatar(avatar) {
    const valor = avatar || "";
    guardarAvatarLocal(valor);
    if (!usuarioActual) {
      aplicarAvatar(valor);
      mostrarMensajeAuth(valor ? "Avatar guardado en este dispositivo." : "Avatar restablecido.", "exito");
      return;
    }
    try {
      const resp = await fetch(apiUrl("api/auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "actualizar_avatar", avatar: valor })
      });
      const data = await resp.json();
      if (data.ok) {
        usuarioActual.avatar = data.avatar ?? null;
        aplicarAvatar(usuarioActual.avatar);
        mostrarMensajeAuth(data.mensaje || "Avatar actualizado.", "exito");
      } else {
        mostrarMensajeAuth(data.error || "No se pudo actualizar el avatar.", "error");
      }
    } catch {
      mostrarMensajeAuth("Error de conexión al actualizar el avatar.", "error");
    }
  }

  function manejarFotoAvatar(file) {
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      mostrarMensajeAuth("Selecciona un archivo de imagen válido.", "error");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        guardarAvatar(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => mostrarMensajeAuth("No se pudo leer la imagen.", "error");
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  }

  btnEditarAvatar?.addEventListener("click", () => {
    if (avatarPicker) avatarPicker.hidden = !avatarPicker.hidden;
  });

  inputFotoAvatar?.addEventListener("change", e => {
    manejarFotoAvatar(e.target.files && e.target.files[0]);
    e.target.value = "";
  });

  btnQuitarAvatar?.addEventListener("click", () => guardarAvatar(""));

  construirColores();
  construirIconosAvatar();

  // ========================================================
  // CONFIGURACIÓN DEL USUARIO
  // ========================================================
  function aplicarConfig() {
    if (config.nombre) {
      const saludo = document.getElementById("sidebar-nombre");
      if (saludo) saludo.textContent = `Hola, ${config.nombre}`;
    }
  }

  function bloquearCerdito() {
    if (config.animacion === false) {
      const cerdito = document.getElementById("cerdito-3d");
      if (cerdito) cerdito.style.display = "none";
    }
  }

  const formConfig = document.getElementById("form-config");
  const inputConfigNombre = document.getElementById("config-nombre");
  const selectConfigMoneda = document.getElementById("config-moneda");
  const mensajeConfig = document.getElementById("mensaje-config");
  const toggleAnimacion = document.getElementById("config-animacion");
  const toggleConsejos = document.getElementById("config-consejos");
  const btnConfigCuenta = document.getElementById("btn-config-cuenta");
  const btnBorrarDatos = document.getElementById("btn-borrar-datos");
  const mensajeDatos = document.getElementById("mensaje-datos");

  if (inputConfigNombre) inputConfigNombre.value = config.nombre || "";
  if (selectConfigMoneda) selectConfigMoneda.value = config.moneda || "MXN";
  if (toggleAnimacion) toggleAnimacion.checked = config.animacion !== false;
  if (toggleConsejos) toggleConsejos.checked = config.consejos !== false;

  formConfig?.addEventListener("submit", evento => {
    evento.preventDefault();

    config.nombre = inputConfigNombre.value.trim();
    config.moneda = selectConfigMoneda.value;

    if (!guardarDatos("finanzalab_config", config)) {
      if (mensajeConfig) {
        mensajeConfig.textContent = "No se pudieron guardar tus ajustes.";
        mensajeConfig.classList.add("error");
      }
      return;
    }

    if (mensajeConfig) {
      mensajeConfig.textContent = "¡Tus ajustes se guardaron!";
      mensajeConfig.classList.remove("error");
    }

    aplicarConfig();
    if (document.getElementById("lista-gastos")) actualizarGastos();
    if (document.getElementById("ahorro-guardado")) actualizarAhorro();
    if (document.getElementById("lista-metas")) renderMetas();
    actualizarInicio();
  });

  toggleAnimacion?.addEventListener("change", () => {
    config.animacion = toggleAnimacion.checked;
    guardarDatos("finanzalab_config", config);
    if (config.animacion) {
      const cerdito = document.getElementById("cerdito-3d");
      if (cerdito) cerdito.style.display = "";
    } else {
      bloquearCerdito();
    }
  });

  toggleConsejos?.addEventListener("change", () => {
    config.consejos = toggleConsejos.checked;
    guardarDatos("finanzalab_config", config);
  });

  btnConfigCuenta?.addEventListener("click", () => {
    document.getElementById("btn-abrir-auth")?.click();
  });

  btnBorrarDatos?.addEventListener("click", () => {
    const confirmar = confirm(
      "¿Quieres borrar tus gastos, metas y ajustes guardados en este navegador? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    [
      "finanzalab_gastos",
      "finanzalab_meta",
      "finanzalab_lecciones",
      "finanzalab_metas",
      "finanzalab_config"
    ].forEach(clave => {
      try {
        localStorage.removeItem(clave);
      } catch {}
    });

    if (mensajeDatos) {
      mensajeDatos.textContent = "Datos borrados. Recargando...";
      mensajeDatos.classList.remove("error");
    }
    setTimeout(() => window.location.reload(), 800);
  });

  // ========================================================
  // METAS FINANCIERAS (VARIAS)
  // ========================================================
  const listaMetas = document.getElementById("lista-metas");

  function renderMetas() {
    if (!listaMetas) return;

    listaMetas.innerHTML = "";

    metas.forEach(meta => {
      const objetivo = Number(meta.objetivo) || 0;
      const actual = Number(meta.actual) || 0;
      const porcentaje =
        objetivo > 0 ? Math.min(Math.round((actual / objetivo) * 100), 100) : 0;
      const completa = objetivo > 0 && actual >= objetivo;

      const item = document.createElement("div");
      item.className = "data-item";

      const info = document.createElement("div");
      info.className = "data-info";

      const top = document.createElement("div");
      top.className = "data-top";

      const nombre = document.createElement("strong");
      nombre.textContent = meta.nombre;

      const monto = document.createElement("span");
      monto.textContent =
        `${formatoDinero(actual)} / ${formatoDinero(objetivo)}`;

      top.append(nombre, monto);

      const pista = document.createElement("div");
      pista.className = "progress-track";
      const relleno = document.createElement("div");
      relleno.className = "progress-fill";
      relleno.style.width = `${porcentaje}%`;
      pista.appendChild(relleno);

      const sub = document.createElement("span");
      sub.className = "data-sub";
      sub.textContent = completa
        ? "¡Meta alcanzada!"
        : `${porcentaje}% · faltan ${formatoDinero(objetivo - actual)}`;

      info.append(top, pista, sub);

      const eliminar = document.createElement("button");
      eliminar.type = "button";
      eliminar.className = "icon-btn";
      eliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
      eliminar.setAttribute("aria-label", `Eliminar meta ${meta.nombre}`);
      eliminar.addEventListener("click", async () => {
        const metasAnteriores = metas;
        metas = metas.filter(m => m.id !== meta.id);

        if (modoServidor) {
          try {
            const data = await apiDatos("eliminar_meta", { id: meta.id });
            if (!data.ok) throw new Error();
          } catch {
            metas = metasAnteriores;
            return;
          }
        } else {
          guardarDatos("finanzalab_metas", metas);
        }

        renderMetas();
        actualizarInicio();
      });

      item.append(info, eliminar);
      listaMetas.appendChild(item);
    });

    const activas = metas.filter(m => Number(m.actual) < Number(m.objetivo)).length;
    const completadas = metas.filter(
      m => Number(m.objetivo) > 0 && Number(m.actual) >= Number(m.objetivo)
    ).length;

    const elActivas = document.getElementById("metas-activas");
    const elCompletadas = document.getElementById("metas-completadas");
    if (elActivas) elActivas.textContent = String(activas);
    if (elCompletadas) elCompletadas.textContent = String(completadas);
  }

  document.getElementById("form-meta")?.addEventListener("submit", async evento => {
    evento.preventDefault();

    const mensajeMeta = document.getElementById("mensaje-meta");
    const nombre = document.getElementById("objetivo-nombre").value.trim();
    const monto = Number(document.getElementById("objetivo-monto").value);
    const actual = Number(document.getElementById("objetivo-actual").value);

    if (
      !nombre ||
      !Number.isFinite(monto) ||
      !Number.isFinite(actual) ||
      monto <= 0 ||
      actual < 0 ||
      monto > 100000000 ||
      actual > 100000000
    ) {
      if (mensajeMeta) {
        mensajeMeta.textContent = "Escribe un nombre y montos válidos.";
        mensajeMeta.classList.add("error");
      }
      return;
    }

    const nuevaMeta = {
      id: `meta-${Date.now()}`,
      nombre,
      objetivo: monto,
      actual
    };
    metas.push(nuevaMeta);

    if (modoServidor) {
      try {
        const data = await apiDatos("crear_meta", {
          nombre,
          objetivo: monto,
          actual
        });
        if (!data.ok || !data.meta) throw new Error();
        Object.assign(nuevaMeta, data.meta);
      } catch {
        metas.pop();
        if (mensajeMeta) {
          mensajeMeta.textContent =
            "No se pudo guardar la meta en el servidor.";
          mensajeMeta.classList.add("error");
        }
        return;
      }
    } else if (!guardarDatos("finanzalab_metas", metas)) {
      metas.pop();
      if (mensajeMeta) {
        mensajeMeta.textContent = "No se pudo guardar la meta.";
        mensajeMeta.classList.add("error");
      }
      return;
    }

    if (mensajeMeta) {
      mensajeMeta.textContent = "¡Meta creada!";
      mensajeMeta.classList.remove("error");
    }
    evento.target.reset();
    renderMetas();
    actualizarInicio();
  });

  // ========================================================
  // LOGROS / INSIGNIAS
  // ========================================================
  function renderLogros() {
    const contenedor = document.getElementById("badges-grid");
    if (!contenedor) return;

    const totalLecciones = 3;
    const logros = [
      {
        icono: "fa-shoe-prints",
        titulo: "Primer paso",
        desc: "Registra tu primer gasto hormiga.",
        ok: gastos.length >= 1
      },
      {
        icono: "fa-bug",
        titulo: "Cazador de hormigas",
        desc: "Registra 10 gastos hormiga.",
        ok: gastos.length >= 10
      },
      {
        icono: "fa-piggy-bank",
        titulo: "Ahorrador",
        desc: "Define una meta de ahorro.",
        ok: Number(metaAhorro.objetivo) > 0
      },
      {
        icono: "fa-trophy",
        titulo: "Meta cumplida",
        desc: "Alcanza tu meta de ahorro.",
        ok:
          Number(metaAhorro.objetivo) > 0 &&
          Number(metaAhorro.actual) >= Number(metaAhorro.objetivo)
      },
      {
        icono: "fa-book-open",
        titulo: "Aprendiz",
        desc: "Completa una lección.",
        ok: leccionesCompletadas.length >= 1
      },
      {
        icono: "fa-graduation-cap",
        titulo: "Estudiante estrella",
        desc: "Completa las tres lecciones.",
        ok: leccionesCompletadas.length >= totalLecciones
      },
      {
        icono: "fa-bullseye",
        titulo: "Soñador",
        desc: "Crea una meta en Metas.",
        ok: metas.length >= 1
      },
      {
        icono: "fa-layer-group",
        titulo: "Coleccionista",
        desc: "Crea tres metas.",
        ok: metas.length >= 3
      }
    ];

    contenedor.innerHTML = "";
    let desbloqueadas = 0;

    logros.forEach(logro => {
      if (logro.ok) desbloqueadas++;

      const card = document.createElement("article");
      card.className = `badge-card ${logro.ok ? "desbloqueado" : "bloqueado"}`;

      const icono = document.createElement("div");
      icono.className = "badge-icon";
      icono.innerHTML = `<i class="fa-solid ${logro.icono}"></i>`;

      const titulo = document.createElement("h4");
      titulo.textContent = logro.titulo;

      const desc = document.createElement("p");
      desc.textContent = logro.desc;

      const estado = document.createElement("span");
      estado.className = "badge-estado";
      estado.textContent = logro.ok ? "Desbloqueado" : "Bloqueado";

      card.append(icono, titulo, desc, estado);
      contenedor.appendChild(card);
    });

    const contador = document.getElementById("logros-count");
    if (contador) {
      contador.textContent = `${desbloqueadas} de ${logros.length} desbloqueadas`;
    }

    const barra = document.getElementById("logros-barra");
    if (barra) {
      barra.style.width = `${Math.round((desbloqueadas / logros.length) * 100)}%`;
    }
  }

  // CARGAR INFORMACIÓN AL ABRIR LA PÁGINA
  // Inicializar solo las vistas que existen en esta página
  if (document.getElementById("lista-gastos")) actualizarGastos();
  if (document.getElementById("ahorro-guardado")) actualizarAhorro();
  if (document.querySelector("[data-leccion]")) actualizarBotonesLecciones();
  if (document.getElementById("lista-metas")) renderMetas();
  if (document.getElementById("badges-grid")) renderLogros();
  aplicarConfig();
  bloquearCerdito();
  actualizarInicio();
  inicializarValidacionCorreos();
  inicializarTogglePassword();
  inicializarValidacionPasswords();
  verificarSesionUsuario();
});


