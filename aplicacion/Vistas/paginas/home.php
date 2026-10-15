<?php /** @var string $base */ ?>

        <!-- Sección Hero -->
        <section class="hero-section">
            <div class="hero-text">
                <h4>TU FUTURO COMIENZA HOY</h4>
                <h1>Aprende a manejar tu <span>dinero</span></h1>
                <p>En EduFin te damos las herramientas para que tomes mejores decisiones, logres tus metas y construyas un futuro financiero más seguro.</p>
                <a class="btn-primary" href="<?= $base ?>reticula">Comenzar a aprender <i class="fa-solid fa-arrow-right"></i></a>

                <div class="stats-bar">
                    <div class="stat-item">
                        <i class="fa-solid fa-medal"></i>
                        <div>
                            <h5>03</h5>
                            <p>Niveles de aprendizaje</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fa-solid fa-clock"></i>
                        <div>
                            <h5>A tu ritmo</h5>
                            <p>Aprende paso a paso</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fa-solid fa-users"></i>
                        <div>
                            <h5>+10k</h5>
                            <p>Usuarios activos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hero-visual" aria-hidden="true">
                <img src="<?= $base ?>img/images.jpg" alt="Ilustración de ahorro" style="width:100%;max-width:420px;border-radius:20px;box-shadow:0 20px 60px rgba(0,210,198,0.25);">
            </div>

        </section>

        <!-- Tarjeta de Progreso Horizontal -->
        <aside class="progress-card">
            <div class="progress-header">
                <div class="icon-box"><i class="fa-solid fa-chart-line"></i></div>
                <div>
                    <h3>Tu progreso financiero</h3>
                    <p>Pequeños pasos, grandes cambios.</p>
                </div>
            </div>

            <div class="circular-progress" id="progreso-anillo">
                <div class="progress-value">
                    <h2 id="progreso-texto">0%</h2>
                    <p>Completado</p>
                </div>
            </div>

            <div class="inner-stats">
                <div class="inner-stat-card">
                    <i class="fa-solid fa-receipt"></i>
                    <p>Gastos registrados</p>
                    <h4 id="stat-gastos">0</h4>
                </div>
                <div class="inner-stat-card">
                    <i class="fa-solid fa-piggy-bank"></i>
                    <p>Meta de ahorro</p>
                    <h4 id="stat-ahorro">$0.00</h4>
                </div>
                <div class="inner-stat-card">
                    <i class="fa-solid fa-book-open"></i>
                    <p>Lecciones completadas</p>
                    <h4 id="stat-lecciones">0</h4>
                </div>
                <div class="inner-stat-card">
                    <i class="fa-solid fa-bullseye"></i>
                    <p>Metas activas</p>
                    <h4 id="stat-metas">0</h4>
                </div>
            </div>
        </aside>

        <!-- Sección Inferior -->
        <section class="bottom-section">
            <h3>APRENDE · PRACTICA · CRECE</h3>
            <h2>Tu educación financiera comienza aquí</h2>

            <div class="cards-grid">
                <div class="feature-card">
                    <div class="icon-box"><i class="fa-solid fa-wallet"></i></div>
                    <h4>Controla tus gastos</h4>
                    <p>Registra y analiza en qué usas tu dinero.</p>
                    <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
                </div>
                <div class="feature-card">
                    <div class="icon-box"><i class="fa-solid fa-piggy-bank"></i></div>
                    <h4>Ahorra para tus metas</h4>
                    <p>Establece objetivos y da seguimiento a tu progreso.</p>
                    <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
                </div>
                <div class="feature-card">
                    <div class="icon-box"><i class="fa-solid fa-graduation-cap"></i></div>
                    <h4>Aprende con nosotros</h4>
                    <p>Descubre consejos y cursos de educación financiera.</p>
                    <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
                </div>
                <div class="feature-card">
                    <div class="icon-box"><i class="fa-solid fa-robot"></i></div>
                    <h4>Pregunta a FinanzaBot</h4>
                    <p>Tu asistente financiero siempre disponible.</p>
                    <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
                </div>
            </div>
        </section>
