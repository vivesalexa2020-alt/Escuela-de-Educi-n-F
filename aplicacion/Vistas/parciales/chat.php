    <!-- ==================== ASISTENTE INTELIGENTE (FINANBOT) ==================== -->
    <div id="contenedor-asistente">
        <div class="chat-widget" id="chat-widget">
            <!-- Botón flotante -->
            <button class="chat-toggle-btn" id="chat-toggle-btn" aria-label="Abrir asistente virtual FinanBot" aria-expanded="false">
                <span class="chat-icono-abrir"><i class="fa-solid fa-robot"></i></span>
                <span class="chat-icono-cerrar" hidden><i class="fa-solid fa-xmark"></i></span>
                <span class="chat-badge-pulse"></span>
            </button>

            <!-- Ventana del chat -->
            <section class="chat-ventana" id="chat-ventana" aria-hidden="true">
                <header class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar"><i class="fa-solid fa-robot"></i></div>
                        <div>
                            <h3>FinanzaBot <span class="chat-tag">IA</span></h3>
                            <p><span class="indicador-enlinea"></span> Tutor financiero virtual</p>
                        </div>
                    </div>
                    <button class="chat-btn-cerrar" id="chat-btn-cerrar" aria-label="Cerrar chat"><i class="fa-solid fa-xmark"></i></button>
                </header>

                <div class="chat-mensajes" id="chat-mensajes">
                    <div class="mensaje-chat mensaje-bot">
                        <div class="mensaje-contenido">
                            <p>¡Hola! Soy <strong>FinanzaBot</strong>, tu tutor de EduFin.</p>
                            <p>¿Tienes dudas sobre tus gastos, cómo crear un presupuesto o cómo empezar a ahorrar? Pregúntame con confianza.</p>
                            <div class="chat-sugerencias">
                                <button type="button" class="chip-sugerencia" data-pregunta="¿Cómo puedo identificar y reducir mis gastos hormiga?">Gastos hormiga</button>
                                <button type="button" class="chip-sugerencia" data-pregunta="¿Cómo funciona la regla 50/30/20 para hacer un presupuesto personal?">Regla 50/30/20</button>
                                <button type="button" class="chip-sugerencia" data-pregunta="¿Cómo calcular cuánto necesito para mi fondo de emergencia?">Fondo de emergencia</button>
                            </div>
                        </div>
                    </div>
                </div>

                <form class="chat-formulario" id="chat-formulario">
                    <input
                        type="text"
                        id="chat-input"
                        placeholder="Escribe tu duda financiera..."
                        autocomplete="off"
                        maxlength="300"
                        required
                    >
                    <button type="submit" id="chat-btn-enviar" aria-label="Enviar mensaje">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </section>
        </div>
    </div>
