<div align="center">

<img src="assets/icon.png" width="120" alt="Nodus" />

# Nodus

**Hábitos, dieta y finanzas en una sola app. 100 % local.**

![Expo](https://img.shields.io/badge/Expo-58-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Offline](https://img.shields.io/badge/datos-en_tu_móvil-19C39B)

</div>

---

## Módulos

| | Módulo | Qué hace |
|---|---|---|
| 🟣 | **Hábitos** | Tira semanal, botones grandes para marcar el día y creación, edición y borrado de hábitos. |
| 📈 | **Dashboard** | Gráfico mensual de cumplimiento, media, días al 100 %, mejor racha y porcentaje por hábito. |
| 🟢 | **Dieta** | Platos con macros opcionales, buscador, raciones repetidas y totales diarios frente a tus objetivos. |
| 🔵 | **Finanzas** | Ingreso mensual, presupuesto por categoría, gastos, margen restante y gráfico donut. |

Además: modo claro y oscuro con transición suave, y animaciones discretas.

## Stack

- **Expo** + **React Native** + **TypeScript**
- **Zustand** con `persist` y **AsyncStorage**, sin servidores ni cuentas
- **React Native Reanimated** para las animaciones
- **react-native-gifted-charts** para los gráficos
- **React Navigation** (pestañas inferiores)

## Empezar

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** o pulsa `a` para abrir un emulador Android.

## Instalar en el móvil (Android)

```bash
npm install -g eas-cli
eas login
eas init
eas build --platform android --profile preview
```

Al terminar, descarga el `.apk` desde el enlace que muestra la terminal e instálalo.

## Estructura

```
App.tsx
src/
├─ theme/         paletas, acentos y useTheme()
├─ store/         stores de Zustand (ajustes, hábitos, dieta, finanzas)
├─ utils/         fechas y cálculos
├─ components/    componentes compartidos (Card, Sheet, ProgressBar…)
├─ navigation/    pestañas principales
└─ screens/
   ├─ habits/     hábitos y dashboard
   ├─ diet/       platos, buscador y objetivos
   └─ finance/    presupuestos, gastos y donut
```

## Datos

Todo se guarda en el dispositivo con AsyncStorage. Si desinstalas la app, los datos se borran. Para guardarlos con MMKV en lugar de AsyncStorage, cambia el adaptador en `src/store/storage.ts` (requiere un development build).

---

<div align="center"><sub>Hecho con React Native y Expo</sub></div>
