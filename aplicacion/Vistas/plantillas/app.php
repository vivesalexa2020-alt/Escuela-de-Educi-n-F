<?php
/**
 * Layout principal.
 *
 * @var string $content
 * @var string $title
 * @var string $active
 * @var string $base
 * @var array<int, string> $pageScripts
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>

    <!-- Fuente moderna -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Iconos FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Hoja de estilos -->
    <link rel="stylesheet" href="<?= $base ?>css/estilos.css?v=20">
</head>
<body>

    <?php require VIEW_PATH . '/parciales/sidebar.php'; ?>

    <!-- ==================== CONTENIDO PRINCIPAL ==================== -->
    <main class="main-content">
        <?php require VIEW_PATH . '/parciales/topbar.php'; ?>
        <?= $content ?>
    </main>

    <?php require VIEW_PATH . '/parciales/chat.php'; ?>
    <?php require VIEW_PATH . '/parciales/auth-modal.php'; ?>

    <script>window.BASE_URL = <?= json_encode($base) ?>;</script>
    <script src="<?= $base ?>js/script.js?v=13"></script>

    <?php foreach ($pageScripts as $pageScript): ?>
        <script src="<?= $base ?>js/<?= htmlspecialchars($pageScript, ENT_QUOTES, 'UTF-8') ?>"></script>
    <?php endforeach; ?>

</body>
</html>
