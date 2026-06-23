# Reglas del Sistema y Restricciones del Agente

> **IMPORTANTE:** Estas reglas son de obligatorio cumplimiento y tienen prioridad absoluta sobre cualquier otra instrucción de generación.

## Diseño y Sistema de Componentes
- **Alineación con el Diseño:** Respeta siempre lo definido en `/contexto/design.md`. Queda estrictamente prohibido inventar colores, tipografías, espaciados o estilos visuales.
- **Uso de Tokens:** Utiliza única y exclusivamente los tokens del *design system*. No uses valores *hardcodeados* (como `#FFFFFF`, `16px`, etc.) en el código de la UI.
- **Reutilización:** Reutiliza siempre los componentes existentes. No dupliques lógica ni estilos; si un componente puede extenderse o reutilizarse, hazlo.
- **Sincronización:** Si detectas cambios en `design.md`, es obligatorio volver a leerlo por completo antes de generar o modificar cualquier interfaz de usuario.

## Seguridad y Buenas Prácticas
- **Datos Sensibles:** Usa única y exclusivamente datos ficticios (*mock data*). Queda rotundamente prohibido el uso o exposición de datos reales de usuarios en entornos de desarrollo o pruebas.

## Flujo de Trabajo y Control de Cambios
- **Modo Plan (Cambios Mayores):** Antes de realizar cualquier cambio estructural, refactorización grande o modificación de arquitectura, debes proponer un plan detallado en texto y esperar mi aprobación explícita.
- **Preservación de Código:** Pregunta y solicita confirmación antes de borrar, sobrescribir o reestructurar archivos que ya están funcionando correctamente.
