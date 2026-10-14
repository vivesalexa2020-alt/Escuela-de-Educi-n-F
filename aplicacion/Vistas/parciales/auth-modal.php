    <!-- ==================== MODAL DE CUENTA (REGISTRO / LOGIN) ==================== -->
    <div class="modal-auth-overlay" id="modal-auth-overlay" hidden>
        <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-titulo">
            <button class="auth-card-cerrar" id="btn-cerrar-auth" type="button" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

            <div class="auth-card-cabecera">
                <div class="perfil-avatar-editable">
                    <div class="perfil-avatar" id="perfil-avatar"><i class="fa-solid fa-user"></i></div>
                    <button type="button" class="btn-editar-avatar" id="btn-editar-avatar" aria-label="Editar foto o icono" title="Editar foto o icono">
                        <i class="fa-solid fa-camera"></i>
                    </button>
                </div>
                <h3 id="auth-modal-titulo">Portal de Estudiantes</h3>
                <p>Toca la cámara para elegir tu avatar</p>
            </div>

            <div class="avatar-picker" id="avatar-picker" hidden>
                <p class="avatar-picker-titulo">Constructor de avatar</p>
                <div class="avatar-colores" id="avatar-colores"></div>
                <div class="avatar-iconos" id="avatar-iconos"></div>
                <label class="btn-subir-avatar" for="input-foto-avatar">
                    <i class="fa-solid fa-upload"></i> Subir una foto
                </label>
                <input type="file" id="input-foto-avatar" accept="image/*" hidden>
                <button type="button" class="btn-link-auth avatar-quitar" id="btn-quitar-avatar">Quitar y usar icono por defecto</button>
            </div>

            <div class="modal-auth-tabs" id="modal-auth-tabs">
                <button type="button" class="tab-auth activo" id="tab-registro">Crear cuenta</button>
                <button type="button" class="tab-auth" id="tab-login">Iniciar sesión</button>
            </div>

            <!-- FORMULARIO CREAR CUENTA -->
            <form id="form-registro" class="form-auth">
                <div class="form-field">
                    <input type="text" id="reg-nombre" placeholder=" " maxlength="100" required>
                    <label for="reg-nombre">Nombre completo</label>
                </div>
                <div class="form-field">
                    <input type="email" id="reg-email" placeholder=" " maxlength="150" required>
                    <label for="reg-email">Correo electrónico</label>
                </div>
                <div class="form-field">
                    <input type="password" id="reg-password" placeholder=" " minlength="6" required>
                    <label for="reg-password">Contraseña</label>
                </div>

                <button type="submit" class="btn-primary auth-submit" id="btn-submit-registro">Crear mi cuenta <i class="fa-solid fa-arrow-right"></i></button>
            </form>

            <!-- FORMULARIO INICIAR SESIÓN -->
            <form id="form-login" class="form-auth" hidden>
                <div class="form-field">
                    <input type="email" id="login-email" placeholder=" " maxlength="150" required>
                    <label for="login-email">Correo electrónico</label>
                </div>
                <div class="form-field">
                    <input type="password" id="login-password" placeholder=" " required>
                    <label for="login-password">Contraseña</label>
                </div>

                <div class="auth-enlace-recuperar">
                    <button type="button" class="btn-link-auth" id="btn-abrir-recuperar">¿Olvidaste tu contraseña?</button>
                </div>

                <button type="submit" class="btn-primary auth-submit" id="btn-submit-login">Iniciar sesión <i class="fa-solid fa-arrow-right"></i></button>
            </form>

            <!-- FORMULARIO RECUPERAR CONTRASEÑA -->
            <form id="form-recuperar" class="form-auth" hidden>
                <p class="auth-instruccion">Ingresa tu correo registrado y define una nueva contraseña para recuperar el acceso a tu cuenta.</p>

                <div class="form-field">
                    <input type="email" id="rec-email" placeholder=" " maxlength="150" required>
                    <label for="rec-email">Correo electrónico</label>
                </div>
                <div class="form-field">
                    <input type="password" id="rec-password" placeholder=" " minlength="6" required>
                    <label for="rec-password">Nueva contraseña</label>
                </div>

                <button type="submit" class="btn-primary auth-submit" id="btn-submit-recuperar">Restablecer contraseña <i class="fa-solid fa-arrow-right"></i></button>

                <div class="auth-enlace-recuperar text-center">
                    <button type="button" class="btn-link-auth" id="btn-volver-login"><i class="fa-solid fa-arrow-left"></i> Volver a Iniciar sesión</button>
                </div>
            </form>

            <p class="auth-mensaje" id="auth-mensaje" role="status" aria-live="polite"></p>

            <!-- VISTA DE SESIÓN ACTIVA -->
            <div class="auth-perfil-activo" id="auth-perfil-activo" hidden>
                <h4 id="perfil-nombre">Nombre del alumno</h4>
                <p id="perfil-email">correo@ejemplo.com</p>
                <span class="badge-estudiante">Alumno activo</span>
                <button type="button" class="btn-secondary-auth" id="btn-cerrar-sesion">Cerrar mi sesión</button>
            </div>
        </div>
    </div>
