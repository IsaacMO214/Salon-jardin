# Salón Jardín

Sitio web del salón de eventos **Jardín Fantasy** con panel de administración para gestionar paquetes, menús, shows, galería, testimonios y más, todo desde una interfaz amigable.

## Tecnologías

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend:** Express + TypeScript
- **Base de datos:** MySQL
- **Autenticación:** Sesiones seguras (token de 32 bytes) + bcrypt
- **Seguridad:** Helmet, rate limiting, validación de archivos

## Requisitos

- Node.js 18 o superior
- MySQL 8+
- npm (se instala junto con Node.js)

## Configuración en una PC nueva (desarrollo local)

1. **Instala Node.js** (desde https://nodejs.org) y MySQL (desde https://dev.mysql.com/downloads/ o XAMPP).

2. **Descarga el proyecto:**
   ```bash
   git clone https://github.com/IsaacMO214/Salon-jardin.git
   cd Salon-jardin
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Crea el archivo `.env`** copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```
   Edítalo con tus credenciales de MySQL y las del usuario administrador:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=tu-contrasena
   MYSQL_DATABASE=jardin_fantasy

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=una-contrasena-segura
   ```

5. **Crea la base de datos y las tablas:**
   ```bash
   mysql -u root -p < server/schema.sql
   ```

6. **Crea el usuario administrador** (para entrar al panel en `/admin`):
   ```bash
   node scripts/create-admin.js
   ```

7. **Inicia el proyecto:**
   ```bash
   npm run dev
   ```

8. Abre `http://localhost:3000` en el navegador. El panel de administración está en `http://localhost:3000/admin`.

## Despliegue en Hostinger (hosting compartido)

Hostinger tiene soporte nativo para aplicaciones Node.js en sus planes de hosting. Sigue estos pasos:

1. **Crea la base de datos:** En hPanel ve a **Bases de datos → MySQL → Crear**. Anota el nombre de la base, el usuario y la contraseña (en Hostinger el host de la base siempre es `localhost`).

2. **Crea el sitio con Node.js:** En hPanel ve a **Sitios web**, entra en tu dominio y activa la sección **Node.js** (versión 18, 20 o 22). Anota la carpeta raíz de la aplicación (ej. `public_html`).

3. **Sube el código:** Descarga el proyecto desde GitHub (botón **Code → Download ZIP**) y súbelo con el **Administrador de archivos** de hPanel (activa **Mostrar archivos ocultos** si lo necesitas), o clónalo desde el terminal de Hostinger:
   ```bash
   git clone https://github.com/IsaacMO214/Salon-jardin.git .
   ```
   > No subas las carpetas `node_modules`, `uploads`, `data` ni el archivo `.env` (el proyecto ya viene configurado para ignorarlos).

4. **Instala dependencias y compila:** Abre el **terminal** de Hostinger (SSH) en la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   npm run build
   ```

5. **Configura las variables de entorno:** En el administrador de archivos crea un archivo `.env` (o copia `.env.example`) con los datos de la base de Hostinger:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=u123456789_mi_usuario
   MYSQL_PASSWORD=mi-contrasena
   MYSQL_DATABASE=u123456789_mi_bd

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=una-contrasena-segura
   ```

6. **Crea las tablas:** Abre **phpMyAdmin**, selecciona tu base de datos e importa `server/schema.sql`. Si tu usuario no tiene permisos para crear bases, elimina las 2 primeras líneas del archivo (`CREATE DATABASE ...` y `USE ...`) e importa solo las tablas.

7. **Configura el comando de inicio:** En la sección **Node.js** de hPanel, en **Comando de inicio** (Startup command) escribe:
   ```
   node dist/server.cjs
   ```
   Guarda y **reinicia** la aplicación.

8. **Crea el usuario administrador:** Desde el terminal de Hostinger ejecuta:
   ```bash
   node scripts/create-admin.js
   ```

9. **Activa el SSL gratuito** (Let's Encrypt) en hPanel para que el sitio funcione por HTTPS.

10. Abre tu dominio y entra al panel en `/admin`.

### Migrar contenido existente (opcional)

Si ya usabas el proyecto en otra PC y quieres conservar fotos y datos:

- **Fotos y videos:** copia el contenido de la carpeta local `uploads/` a la carpeta `uploads/` del hosting (File Manager o FTP).
- **Datos de la base:** exporta tu base local desde phpMyAdmin (o `mysqldump`) e importa el archivo `.sql` en la base de Hostinger con phpMyAdmin.

## Seguridad (importante)

- El archivo `.env` contiene contraseñas y **nunca debe subirse a GitHub** (ya está ignorado).
- Cambia la contraseña del administrador regularmente desde el panel (`/admin` → Configuración → Cambiar contraseña).
- El panel de administración tiene protección contra intentos de acceso: máx. 10 intentos por 15 minutos por IP.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila frontend y backend para producción |
| `npm start` | Inicia el servidor en modo producción |
| `npm run lint` | Verifica tipos con TypeScript |
| `node scripts/create-admin.js` | Crea o actualiza el usuario administrador |

## Estructura del proyecto

```
Salon-jardin/
├── server/           # Backend Express
│   ├── routes/       # Rutas API (auth, crud, data, upload)
│   ├── auth.ts       # Sesiones de administrador
│   ├── config.ts     # Configuración y subida de archivos
│   ├── db.ts         # Conexión MySQL
│   ├── schema.sql    # Esquema de base de datos
│   ├── validation.ts # Validaciones
│   └── index.ts      # Punto de entrada
├── src/              # Frontend React
│   ├── admin/        # Panel administrativo
│   ├── api/          # Cliente API
│   ├── components/   # Componentes React
│   └── main.tsx      # Punto de entrada
├── scripts/          # Utilidades (crear admin, migraciones)
├── data/             # Datos locales (solo referencia)
├── uploads/          # Archivos subidos (no se sube a git)
├── package.json
└── vite.config.ts
```
