        <section class="page-section">
            <div class="page-header">
                <div class="icon-box"><i class="fa-solid fa-wallet"></i></div>
                <div>
                    <h4>GASTOS HORMIGA</h4>
                    <h1>Registra y controla tus gastos</h1>
                    <p>Anota esas pequeñas compras del día a día. Al verlas juntas entenderás cuánto suman y podrás tomar mejores decisiones.</p>
                </div>
            </div>

            <div class="tool-grid">
                <div class="tool-card">
                    <h3><i class="fa-solid fa-plus"></i> Nuevo gasto</h3>
                    <p class="sub">Registra el concepto, la cantidad y la categoría del gasto.</p>
                    <form class="tool-form" id="form-gasto">
                        <div class="field">
                            <label for="concepto">Concepto</label>
                            <input type="text" id="concepto" maxlength="80" placeholder="Ej. Café, botana, app..." required>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <label for="importe">Importe</label>
                                <input type="number" id="importe" min="0.01" step="0.01" placeholder="0.00" required>
                            </div>
                            <div class="field">
                                <label for="categoria">Categoría</label>
                                <select id="categoria">
                                    <option value="Comida">Comida</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Entretenimiento">Entretenimiento</option>
                                    <option value="Compras">Compras</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Guardar gasto <i class="fa-solid fa-check"></i></button>
                        <p class="tool-mensaje" id="mensaje-gasto"></p>
                    </form>
                </div>

                <div class="tool-card">
                    <div class="mini-stats" style="margin-bottom: 20px;">
                        <div class="mini-stat-card">
                            <i class="fa-solid fa-calendar-day"></i>
                            <p>Total de hoy</p>
                            <h4 id="total-hoy">$0.00</h4>
                        </div>
                        <div class="mini-stat-card">
                            <i class="fa-solid fa-calendar-days"></i>
                            <p>Total del mes</p>
                            <h4 id="total-mes">$0.00</h4>
                        </div>
                    </div>
                    <div class="tool-card-header">
                        <h3><i class="fa-solid fa-list"></i> Historial</h3>
                        <button type="button" class="btn-ghost" id="borrar-gastos"><i class="fa-solid fa-trash"></i> Borrar todo</button>
                    </div>
                    <div class="data-list scroll" id="lista-gastos"></div>
                </div>
            </div>
        </section>
