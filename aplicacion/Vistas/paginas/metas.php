        <section class="page-section">
            <div class="page-header">
                <div class="icon-box"><i class="fa-solid fa-bullseye"></i></div>
                <div>
                    <h4>METAS</h4>
                    <h1>Tus objetivos financieros</h1>
                    <p>Crea metas con un monto objetivo y lleva el control de lo que ya has reunido para cada una.</p>
                </div>
            </div>

            <div class="tool-grid">
                <div class="tool-card">
                    <h3><i class="fa-solid fa-plus"></i> Nueva meta</h3>
                    <p class="sub">Ponle nombre, monto objetivo y cuánto llevas ahorrado.</p>
                    <form class="tool-form" id="form-meta">
                        <div class="field">
                            <label for="objetivo-nombre">Nombre de la meta</label>
                            <input type="text" id="objetivo-nombre" maxlength="80" placeholder="Ej. Fondo de emergencia" required>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <label for="objetivo-monto">Monto objetivo</label>
                                <input type="number" id="objetivo-monto" min="1" step="0.01" placeholder="0.00" required>
                            </div>
                            <div class="field">
                                <label for="objetivo-actual">Ahorrado hasta hoy</label>
                                <input type="number" id="objetivo-actual" min="0" step="0.01" placeholder="0.00" required>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Crear meta <i class="fa-solid fa-check"></i></button>
                        <p class="tool-mensaje" id="mensaje-meta"></p>
                    </form>
                </div>

                <div class="tool-card">
                    <div class="mini-stats" style="margin-bottom: 20px;">
                        <div class="mini-stat-card">
                            <i class="fa-solid fa-person-running"></i>
                            <p>Metas activas</p>
                            <h4 id="metas-activas">0</h4>
                        </div>
                        <div class="mini-stat-card">
                            <i class="fa-solid fa-circle-check"></i>
                            <p>Metas completadas</p>
                            <h4 id="metas-completadas">0</h4>
                        </div>
                    </div>
                    <div class="tool-card-header">
                        <h3><i class="fa-solid fa-list-check"></i> Mis metas</h3>
                    </div>
                    <div class="data-list scroll" id="lista-metas"></div>
                </div>
            </div>
        </section>
