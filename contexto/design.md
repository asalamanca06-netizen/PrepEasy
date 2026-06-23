# Design System RecetaRápida

## Visión

RecetaRápida es un design system pensado para profesionales ocupados que desean cocinar recetas deliciosas y accesibles en poco tiempo. El sistema refleja amigabilidad, claridad y eficiencia a través de una interfaz equilibrada, acogedora y fácil de navegar.

---

## Principios de Diseño

1. **Claridad ante todo**: La información más importante debe ser evidente sin necesidad de explicaciones adicionales.
2. **Eficiencia en el diseño**: Reducir pasos innecesarios; respetar el tiempo del usuario profesional.
3. **Calidez accesible**: Combinar modernidad con una sensación humana y de confianza.
4. **Coherencia visual**: Mantener una experiencia consistente en toda la plataforma.
5. **Facilidad de uso**: Diseño intuitivo que requiera mínima curva de aprendizaje.

---

## Paleta de Color

### Colores Primarios

- **Primario (Verde Vibrante)**: `#2D9D4E`
  - Rol: Botones principales, acciones primarias, llamadas a la acción.
  - Transmite frescura, salud, naturalidad (asociado a ingredientes frescos).
- **Primario Oscuro**: `#1F6B35`
  - Rol: Estados hover/pressed, énfasis en navegación.
- **Primario Claro**: `#D4F4DD`
  - Rol: Fondos suaves, highlights, confirmaciones.

### Colores de Superficie

- **Fondo Principal**: `#FFFFFF`
  - Rol: Fondo base de la aplicación.
- **Superficie Secundaria**: `#F7F9F6`
  - Rol: Cards, panels, áreas contenidas.
- **Superficie Terciaria**: `#EEF1ED`
  - Rol: Diferenciación adicional, bordes sutiles.

### Colores Neutrales

- **Texto Primario**: `#1C1C1C`
  - Rol: Títulos, textos de lectura principal.
- **Texto Secundario**: `#5E5E5E`
  - Rol: Descripciones, metadatos, textos auxiliares.
- **Texto Terciario**: `#A8A8A8`
  - Rol: Labels, hints, textos deshabilitados.
- **Borde**: `#D5D5D5`
  - Rol: Separadores, bordes de componentes.

### Colores Semánticos

- **Éxito**: `#4CAF50`
  - Rol: Confirmaciones, estados positivos.
- **Advertencia**: `#FFA726`
  - Rol: Alertas, advertencias, información importante.
- **Error**: `#EF5350`
  - Rol: Errores, estados críticos, validaciones fallidas.
- **Información**: `#29B6F6`
  - Rol: Información contextual, tips.

---

## Tipografía

### Familias

- **Sans Serif (Principal)**: Segoe UI, Roboto, -apple-system
  - Rol: Cuerpo de texto, UI labels, interfaz general.
  - Característica: Legibilidad, modernidad, profesionalismo.
- **Serif (Acentos)**: Georgia, Garamond, serif
  - Rol: Títulos de recetas, nombres de platos, elementos destacados.
  - Característica: Calidez, sofisticación, invita a explorar.

### Escala Tipográfica

- **Display (H1)**: 32px, peso 700 (serif), line-height 1.2
  - Uso: Títulos principales de página.
- **Heading 1 (H2)**: 28px, peso 600 (serif), line-height 1.3
  - Uso: Nombres de recetas, secciones principales.
- **Heading 2 (H3)**: 24px, peso 600 (sans), line-height 1.3
  - Uso: Subtítulos, encabezados de sección.
- **Heading 3 (H4)**: 20px, peso 600 (sans), line-height 1.4
  - Uso: Subencabezados, labels destacados.
- **Body Large**: 16px, peso 400 (sans), line-height 1.5
  - Uso: Textos principales, descripciones.
- **Body Regular**: 14px, peso 400 (sans), line-height 1.5
  - Uso: Cuerpo estándar, descripciones secundarias.
- **Body Small**: 12px, peso 400 (sans), line-height 1.4
  - Uso: Labels, metadatos, información complementaria.
- **Caption**: 11px, peso 500 (sans), line-height 1.4
  - Uso: Hints, información muy pequeña, notas.
  - **⚠️ Mínimo absoluto de la interfaz. No usar tamaños inferiores a 11px.**

---

## Spacing & Layout

### Tokens de Spacing (Escala 4px)

- **xs**: 4px (separaciones muy pequeñas)
- **sm**: 8px (separaciones internas pequeñas)
- **md**: 16px (espaciado estándar)
- **lg**: 24px (espaciado generoso)
- **xl**: 32px (separación entre secciones)
- **2xl**: 48px (grandes separaciones)
- **3xl**: 64px (separaciones máximas)

### Densidad Equilibrada

- **Padding en componentes**: 12px - 16px (interno)
- **Margen entre componentes**: 16px - 24px
- **Ancho máximo de contenido**: 1200px (desktop), 100% (mobile)
- **Columnas**: 12 columnas en desktop, 4 en tablet, 2 en mobile
- **Altura mínima de tap target**: 48px × 48px

---

## Componentes Base

### Border Radius

- **xs**: 2px (bordes sutiles)
- **sm**: 4px (bordes pequeños)
- **md**: 8px (bordes estándar)
- **lg**: 12px (bordes redondeados)
- **full**: 9999px (píldoras, avatares)

### Shadows

- **Elevation 1** (subtle): `0px 2px 4px rgba(0, 0, 0, 0.08)`
- **Elevation 2** (small card): `0px 4px 8px rgba(0, 0, 0, 0.12)`
- **Elevation 3** (modal/large card): `0px 8px 16px rgba(0, 0, 0, 0.15)`
- **Elevation 4** (elevated): `0px 12px 24px rgba(0, 0, 0, 0.18)`

### Opacity

- **Disabled**: 0.48
- **Hover**: 0.08
- **Focus**: 0.12
- **Backdrop**: 0.4

---

## Estados Interactivos

### Botón Primario

- **Default**: Fondo `#2D9D4E`, texto blanco
- **Hover**: Fondo `#1F6B35`, sombra elevation 2
- **Pressed**: Fondo `#1F6B35`, sin sombra
- **Disabled**: Fondo `#A8A8A8` con opacidad 0.48
- **Focus**: Borde 2px `#2D9D4E` con offset 2px

### Entrada de Texto

- **Default**: Borde 1px `#D5D5D5`, fondo blanco
- **Hover**: Borde 1px `#2D9D4E`
- **Focus**: Borde 2px `#2D9D4E`, fondo `#F7F9F6`
- **Error**: Borde 2px `#EF5350`
- **Disabled**: Fondo `#EEF1ED`, texto `#A8A8A8`

---

## Modo de Color

**Modo Claro (Light Mode)** — Primario en esta versión

- Fondos luminosos (`#FFFFFF`, `#F7F9F6`)
- Textos oscuros (`#1C1C1C`, `#5E5E5E`)
- Accentes verdes frescos
- Alto contraste para accesibilidad WCAG AA+

---

## Aplicación Visual

RecetaRápida combina la serenidad de los tonos verdes naturales con la calidez de serif clásicos para nombres de recetas, creando una experiencia que es a la vez moderna, profesional y acogedora. La densidad equilibrada asegura que la interfaz no se sienta abrumada pero tampoco vacía, respetando el tiempo limitado del usuario profesional.
