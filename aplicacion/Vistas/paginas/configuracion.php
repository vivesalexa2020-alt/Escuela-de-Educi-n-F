        <section class="page-section">
            <div class="page-header">
                <div class="icon-box"><i class="fa-solid fa-gear"></i></div>
                <div>
                    <h4>CONFIGURACIÓN</h4>
                    <h1>Ajusta tu experiencia</h1>
                    <p>Personaliza tu nombre, la moneda y administra los datos que guarda este navegador.</p>
                </div>
            </div>

            <div class="tool-card">
                <h3><i class="fa-solid fa-user"></i> Perfil</h3>
                <p class="sub">Este nombre se muestra en el saludo. La moneda se usa en toda la aplicación.</p>
                <form class="tool-form" id="form-config">
                    <div class="field">
                        <label for="config-nombre">Nombre para mostrar</label>
                        <input type="text" id="config-nombre" maxlength="60" placeholder="Ej. Ana">
                    </div>
                    <div class="field">
                        <label for="config-moneda">Moneda</label>
                        <select id="config-moneda">
                            <option value="MXN">Peso mexicano (MXN)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">Guardar cambios <i class="fa-solid fa-check"></i></button>
                    <p class="tool-mensaje" id="mensaje-config"></p>
                </form>
            </div>

            <div class="tool-card">
                <h3><i class="fa-solid fa-id-card"></i> Mi cuenta</h3>
                <p class="sub">Inicia sesión o crea una cuenta para guardar tu avatar y tus datos en el servidor.</p>
                <div class="config-cuenta">
                    <strong id="config-cuenta-nombre">Aún no has iniciado sesión</strong>
                    <span id="config-cuenta-email">Tu progreso se guarda en este navegador.</span>
                </div>
                <button type="button" class="btn-ghost" id="btn-config-cuenta"><i class="fa-solid fa-right-to-bracket"></i> Abrir mi cuenta</button>
            </div>

            <div class="tool-card">
                <h3><i class="fa-solid fa-sliders"></i> Preferencias</h3>
                <p class="sub">Elige cómo quieres usar EduFin.</p>
                <div class="toggle-item">
                    <div class="toggle-texto">
                        <h4>Animación 3D del cerdito</h4>
                        <p>Muestra el cerdito animado en la página de inicio.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="config-animacion">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <div class="toggle-texto">
                        <h4>Consejos de FinanBot</h4>
                        <p>Muestra sugerencias al abrir el asistente.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="config-consejos">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="tool-card danger-zone">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> Zona de riesgo</h3>
                <p class="sub">Borra los gastos, metas y ajustes guardados en este navegador. Esta acción no se puede deshacer.</p>
                <button type="button" class="btn-danger" id="btn-borrar-datos"><i class="fa-solid fa-trash"></i> Borrar mis datos locales</button>
                <p class="tool-mensaje" id="mensaje-datos"></p>
            </div>
        </section>
