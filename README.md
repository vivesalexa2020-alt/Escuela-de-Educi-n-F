# EduFin

Proyecto escolar de educación financiera: aprende a controlar tus gastos, ahorrar
y cumplir tus metas.

## Estructura (MVC)

```
aplicacion/
  bootstrap.php          Arranque (autoload, sesión, constantes)
  Nucleo/                Router, Controller y Database
  Modelos/               Usuario, Chat
  Controladores/         PageController, AuthController, ChatController
  Vistas/                plantillas, parciales y páginas
config/
  database.php           Credenciales de la base de datos
  config.php             Clave de API de Gemini (NO se sube al repo)
  config.example.php     Plantilla de config.php
public/                  Único directorio expuesto al navegador
  index.php              Front controller (todas las rutas entran aquí)
  .htaccess              Reescribe las URLs hacia index.php
  css/ js/ img/          Recursos estáticos
database.sql             Estructura de la base de datos
```

## Cómo ejecutarlo (XAMPP)

1. Inicia **Apache** y **MySQL** desde el panel de XAMPP.
2. Importa `database.sql` en phpMyAdmin (base de datos `finanzalab_db`).
3. Copia `config/config.example.php` a `config/config.php` y pega tu API Key de Gemini.
4. Haz que el navegador apunte a la carpeta `public/`:
   - Crea una unión (junction) de `C:\xampp\htdocs\EduFin` a `C:\xampp\FinanzaLab\public`.
5. Abre: http://localhost/EduFin/

## Rutas principales

- `/` inicio
- `/reticula`, `/materiales`, `/gastos-hormiga`, `/mi-ahorro`, `/metas`, `/logros`, `/configuracion`
- `/api/auth` (registro, login, sesión)
- `/api/chat` (asistente FinanBot)
