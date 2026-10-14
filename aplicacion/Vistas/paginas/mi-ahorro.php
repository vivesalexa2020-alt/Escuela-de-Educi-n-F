        <section class="page-section">
            <div class="page-header">
                <div class="icon-box"><i class="fa-solid fa-piggy-bank"></i></div>
                <div>
                    <h4>MI AHORRO</h4>
                    <h1>Construye tu meta de ahorro</h1>
                    <p>Define para qué quieres ahorrar y cuánto necesitas. Verás tu avance y un consejo para mantenerte constante.</p>
                </div>
            </div>

            <div class="tool-grid">
                <div class="tool-card">
                    <h3><i class="fa-solid fa-bullseye"></i> Mi meta</h3>
                    <p class="sub" id="ahorro-nombre-vista">Tu próxima meta</p>
                    <div class="ahorro-resumen">
                        <h2 id="ahorro-guardado">$0.00</h2>
                        <span class="restante" id="ahorro-restante">$0.00 restantes</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" id="barra-ahorro"></div>
                    </div>
                    <p class="ahorro-porcentaje" id="ahorro-porcentaje">0% completado</p>
                    <div class="consejo-box">
                        <i class="fa-solid fa-lightbulb"></i>
                        <p id="consejo-texto">Define una meta que se adapte a tus posibilidades y avanza a tu propio ritmo.</p>
                    </div>
                </div>

                <div class="tool-card">
                    <h3><i class="fa-solid fa-pen-to-square"></i> Editar mi meta</h3>
                    <p class="sub">Define el nombre, cuánto necesitas y cuánto llevas ahorrado.</p>
                    <form class="tool-form" id="form-ahorro">
                        <div class="field">
                            <label for="meta-nombre">¿Para qué ahorras?</label>
                            <input type="text" id="meta-nombre" maxlength="80" placeholder="Ej. Un viaje, una laptop..." required>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <label for="meta-total">Monto objetivo</label>
                                <input type="number" id="meta-total" min="1" step="0.01" placeholder="0.00" required>
                            </div>
                            <div class="field">
                                <label for="ahorro-actual">Ahorrado hasta hoy</label>
                                <input type="number" id="ahorro-actual" min="0" step="0.01" placeholder="0.00" required>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Guardar mi meta <i class="fa-solid fa-check"></i></button>
                        <p class="tool-mensaje" id="mensaje-ahorro"></p>
                    </form>
                </div>
            </div>
        </section>
