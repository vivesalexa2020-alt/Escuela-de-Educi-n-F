
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
      const respuesta = await fetch("api/chat.php", {
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
          "⚙️ **Casi listo para comenzar:**\nPara activar a FinanBot, por favor abre el archivo `api/config.php` en Visual Studio Code y pega tu clave API de Google Gemini.",
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
        "⚠️ No se pudo conectar con el servidor local. Asegúrate de tener Apache encendido en XAMPP y acceder mediante http://localhost/FinanzaLab/.",
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
  // CONTROLADOR DE CUENTA DE USUARIO (REGISTRO / LOGIN)
  // ========================================================
  const btnAbrirAuth = document.getElementById("btn-abrir-auth");
  const enlaceMenuCuenta = document.getElementById("enlace-menu-cuenta");
  const modalAuthOverlay = document.getElementById("modal-auth-overlay");
  const btnCerrarAuth = document.getElementById("btn-cerrar-auth");
  const tabRegistro = document.getElementById("tab-registro");
  const tabLogin = document.getElementById("tab-login");
  const modalAuthTabs = document.getElementById("modal-auth-tabs");
  const formRegistro = document.getElementById("form-registro");
  const formLogin = document.getElementById("form-login");
  const authMensaje = document.getElementById("auth-mensaje");
  const authPerfilActivo = document.getElementById("auth-perfil-activo");
  const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

  const textoUsuarioEstado = document.getElementById("texto-usuario-estado");
  const subtextoUsuario = document.getElementById("subtexto-usuario");
  const perfilNombre = document.getElementById("perfil-nombre");
  const perfilEmail = document.getElementById("perfil-email");

  let usuarioActual = null;

  function mostrarMensajeAuth(texto, tipo = "") {
    if (!authMensaje) return;
    authMensaje.textContent = texto;
    authMensaje.className = `auth-mensaje ${tipo}`.trim();
  }

  function cambiarPestanaAuth(pestana) {
    mostrarMensajeAuth("");
    if (pestana === "registro") {
      tabRegistro?.classList.add("activo");
      tabLogin?.classList.remove("activo");
      formRegistro?.removeAttribute("hidden");
      formLogin?.setAttribute("hidden", "true");
    } else {
      tabLogin?.classList.add("activo");
      tabRegistro?.classList.remove("activo");
      formLogin?.removeAttribute("hidden");
      formRegistro?.setAttribute("hidden", "true");
    }
  }

  function actualizarUIUsuario(user) {
    usuarioActual = user;
    if (user) {
      if (textoUsuarioEstado) textoUsuarioEstado.textContent = `Hola, ${user.nombre.split(" ")[0]}`;
      if (subtextoUsuario) subtextoUsuario.textContent = "Alumno activo ✦";
      if (perfilNombre) perfilNombre.textContent = user.nombre;
      if (perfilEmail) perfilEmail.textContent = user.email;

      // Ocultar formularios y tabs, mostrar perfil activo
      modalAuthTabs?.setAttribute("hidden", "true");
      formRegistro?.setAttribute("hidden", "true");
      formLogin?.setAttribute("hidden", "true");
      authPerfilActivo?.removeAttribute("hidden");
    } else {
      if (textoUsuarioEstado) textoUsuarioEstado.textContent = "Crear cuenta";
      if (subtextoUsuario) subtextoUsuario.textContent = "o Iniciar sesión";

      modalAuthTabs?.removeAttribute("hidden");
      authPerfilActivo?.setAttribute("hidden", "true");
      cambiarPestanaAuth("registro");
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
      const resp = await fetch("api/auth.php?action=check");
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

    mostrarMensajeAuth("Creando tu cuenta...", "");

    try {
      const resp = await fetch("api/auth.php", {
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

    mostrarMensajeAuth("Validando credenciales...", "");

    try {
      const resp = await fetch("api/auth.php", {
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
      await fetch("api/auth.php?action=logout");
      actualizarUIUsuario(null);
      mostrarMensajeAuth("Has cerrado tu sesión.", "exito");
    } catch {
      actualizarUIUsuario(null);
    }
  });

  btnAbrirAuth?.addEventListener("click", abrirModalAuth);
  enlaceMenuCuenta?.addEventListener("click", e => {
    e.preventDefault();
    abrirModalAuth();
  });
  btnCerrarAuth?.addEventListener("click", cerrarModalAuth);
  modalAuthOverlay?.addEventListener("click", e => {
    if (e.target === modalAuthOverlay) cerrarModalAuth();
  });

  tabRegistro?.addEventListener("click", () => cambiarPestanaAuth("registro"));
  tabLogin?.addEventListener("click", () => cambiarPestanaAuth("login"));

  // CARGAR INFORMACIÓN AL ABRIR LA PÁGINA
  actualizarGastos();
  actualizarAhorro();
  actualizarBotonesLecciones();
  actualizarInicio();
  verificarSesionUsuario();
});


