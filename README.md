# 🎌 三刀流 Santoryu — Web Personal para Aprender Japonés

<p align="center">
  <b>Una Progressive Web App (PWA) moderna, mobile-first y offline-first para dominar el japonés en lectura, escritura, pronunciación y comprensión.</b>
</p>

---

## ✨ Características Principales

- **🈁 Kana Dojo**: 107 Hiragana y 122 Katakana con tabla Gojūon interactiva, audio al toque y mnemotecnias.
- **🏯 Kanji Tower**: 100 Kanji del nivel JLPT N5 con lecturas On'yomi, Kun'yomi, significados en español, conteo de trazos y vocabulario de ejemplo.
- **📚 Vocab Forge**: Vocabulario esencial JLPT N5 con búsqueda instantánea, clasificación gramatical y soporte de Furigana semántico (`<ruby>`) con 3 modos (Siempre, Hover, Oculto).
- **🔄 Motor SRS FSRS-5**: Sistema de repetición espaciada moderno (Free Spaced Repetition Scheduler) con cálculo dinámico de estabilidad y recuperabilidad de memoria.
- **🗣️ Audio y Pronunciación**: Text-to-Speech nativo en japonés (`ja-JP`) integrado con la Web Speech API.
- **📱 Mobile & PWA Ready**: Instalable directamente en iOS (iPhone) desde Safari ("Añadir a pantalla de inicio") con soporte de notch, safe areas y notificaciones locales.
- **💾 100% Offline & Privado**: Todo el progreso se guarda localmente en el dispositivo con IndexedDB (Dexie.js).
- **📦 Exportar / Importar**: Copia de seguridad en archivo JSON para transferir todos tus datos entre dispositivos móviles o navegadores.
- **📊 Gamificación**: Racha diaria (streak), puntos de experiencia (XP), mapa de calor (heatmap) de actividad y logros desbloqueables.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) (Tema Dark Wabi-Sabi) |
| **PWA & Offline** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| **Base de Datos Local** | [Dexie.js](https://dexie.org/) (IndexedDB) |
| **Motor SRS** | Algoritmo FSRS-5 |
| **Animaciones** | [Motion](https://motion.dev/) |
| **Iconos** | [Lucide React](https://lucide.dev/) |
| **Enrutamiento** | [React Router v7](https://reactrouter.com/) |

---

## 🚀 Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/oscarcarballar/santoryu.git
cd santoryu
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 4. Build de producción
```bash
npm run build
```

---

## 📲 Instalación en iPhone (iOS PWA)

1. Abre la aplicación en Safari desde tu iPhone.
2. Pulsa el botón de **Compartir** (icono central inferior con flecha hacia arriba).
3. Selecciona **"Añadir a la pantalla de inicio"** (*Add to Home Screen*).
4. Ábrela desde tu pantalla de inicio para disfrutar de la experiencia como app nativa a pantalla completa y sin conexión a internet.

---

## 📄 Licencia

MIT © [oscarcarballar](https://github.com/oscarcarballar)
