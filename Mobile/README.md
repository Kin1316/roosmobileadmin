# Mobile (Android + Español)

Aplicación React Native CLI enfocada en **Android** y con idioma **español**.

## Requisitos
- Node.js 20+
- Java JDK 17+
- Android Studio con SDK y emulador
- Variables de entorno Android:
  - `ANDROID_HOME` → `C:\Users\<usuario>\AppData\Local\Android\Sdk`
  - `PATH` con:
    - `%ANDROID_HOME%\platform-tools`
    - `%ANDROID_HOME%\emulator`

## Instalación
```bash
npm install
npm run prepare
```

## Configuración
Crear archivo `.env` en la raíz:

```env
API_BASE_URL=https://recolectoralaross.com/api
```

Para desarrollo contra un backend local desde Electron, usa:

```env
API_BASE_URL=http://localhost:8080/api
```

## Ejecutar en Android
En una terminal:
```bash
npm start
```

En otra terminal (con emulador/dispositivo listo):
```bash
npm run android
```

## Scripts útiles
- `npm run android` → ejecuta app Android
- `npm run lint` → lint
- `npm run typecheck` → revisión TypeScript
- `npm test` → pruebas
- `npm run format` → formatea código

## Notas
- El proyecto está configurado para trabajar en español (`es`) como idioma único.
- El flujo principal incluye login, menú, rutas y detalle de rutas.
