# Salón Jardín

Sistema de gestión para salón de eventos con panel administrativo.

## Tecnologías

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend:** Express + TypeScript
- **Base de datos:** MySQL
- **Autenticación:** JWT + bcrypt

## Requisitos

- Node.js 18+
- MySQL 8+
- npm

## Configuración inicial

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd Salon-jardin
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus credenciales de MySQL y una clave secreta para JWT.

4. Crea la base de datos MySQL:
   ```bash
   mysql -u root -p < server/schema.sql
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Abre `http://localhost:3000` en el navegador.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila frontend y backend para producción |
| `npm start` | Inicia servidor en producción |
| `npm run lint` | Verifica tipos con TypeScript |

## Estructura del proyecto

```
Salon-jardin/
├── server/           # Backend Express
│   ├── routes/       # Rutas API
│   ├── auth.ts       # Autenticación JWT
│   ├── config.ts     # Configuración
│   ├── db.ts         # Conexión MySQL
│   ├── schema.sql    # Esquema de base de datos
│   ├── validation.ts # Validaciones
│   └── index.ts      # Punto de entrada
├── src/              # Frontend React
│   ├── admin/        # Panel administrativo
│   ├── api/          # Cliente API
│   ├── components/   # Componentes React
│   └── main.tsx      # Punto de entrada
├── data/             # Datos locales (JSON)
├── uploads/          # Archivos subidos
├── package.json
├── vite.config.ts
└── tsconfig.json
```
