        <!-- Barra Superior -->
        <header class="top-bar">
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Busca temas, consejos o herramientas...">
            </div>
            <div class="top-icons">
                <div class="notification-wrapper">
                    <button class="icon-btn-notif" id="btn-notif" type="button" aria-label="Notificaciones">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notif-badge" id="notif-badge" aria-hidden="true">1</span>
                    </button>
                    <div class="notif-dropdown" id="notif-dropdown" role="menu">
                        <div class="notif-header">
                            <span>Notificaciones</span>
                            <button type="button" id="btn-clear-notif">Marcar como leídas</button>
                        </div>
                        <div class="notif-list" id="notif-list"></div>
                    </div>
                </div>
                <div class="help-wrapper">
                    <button class="icon-btn-help" id="btn-help" type="button" aria-label="Ayuda">
                        <i class="fa-regular fa-circle-question"></i>
                    </button>
                    <div class="help-dropdown" id="help-dropdown" role="menu">
                        <div class="help-header">¿Necesitas ayuda?</div>
                        <div class="help-items">
                            <button type="button" class="help-item" data-action="open-chat">Hablar con FinanBot</button>
                            <a class="help-item" href="<?= $base ?>reticula">Ver retícula académica</a>
                            <a class="help-item" href="<?= $base ?>configuracion">Configuración de cuenta</a>
                        </div>
                    </div>
                </div>
                <button class="cuenta-trigger" id="btn-abrir-auth" type="button" aria-label="Crear cuenta o iniciar sesión">
                    <span class="cuenta-avatar"><i class="fa-solid fa-user"></i></span>
                    <span class="cuenta-texto">
                        <strong id="texto-usuario-estado">Crear cuenta</strong>
                        <small id="subtexto-usuario">o Iniciar sesión</small>
                    </span>
                </button>
            </div>
        </header>
