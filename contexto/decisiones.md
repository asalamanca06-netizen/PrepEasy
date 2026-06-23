# Decisiones del Proyecto: PrepEasy

Este documento define los límites de autonomía del agente de IA y los criterios de éxito del proyecto. La IA debe consultar este archivo antes de proponer cambios estructurales.

---

## 🛑 QUÉ NO DELEGO (Lo decido yo, siempre)

* **Definición del "Nivel de Energía":** Las tres categorías (`Sin energía`, `Equilibrado`, `Desconexión`) y cómo afectan al prompt de Gemini (ej. "Sin energía" = menos de 15 minutos, menos de 4 ingredientes). El agente no puede inventar nuevos estados de ánimo sin aprobación.
* **Algoritmo de Priorización de la Despensa:** Los ingredientes con alertas de vencimiento *tienen* que ir primero en el prompt enviado a Gemini. El orden de relevancia de los ingredientes no se automatiza a ciegas.
* **Modelo de Datos y Privacidad:** Qué datos se guardan en el almacenamiento local (ingredientes, historial, ratings) y qué se envía a la API de Gemini. No se envían datos personales identificables a la API.
* **Flujo de Navegación Core:** La estructura de las 5 secciones (`Inicio`, `Despensa`, `Planificador`, `Recetas`, `Historial`) y cómo se comunican entre sí.
* **Cuál es el flujo principal y qué cuenta como éxito:** No cambies, ni agregues pasos adicionales al flujo.


---

## 🤖 QUÉ SÍ DELEGO (Autonomía del Agente)

* **Maquetación y Estilos CSS/Tailwind:** El diseño de la interfaz, la responsividad y la consistencia visual de las 5 secciones, asegurando que visualmente se sienta "fácil y relajante" para un usuario cansado.
* **Manejo de Estados Locales y Formularios:** La lógica para añadir/editar ingredientes en la Despensa, cambiar los filtros de energía en Recetas y registrar el rating en el Historial.
* **Generación de Datos Mock:** Creación de listas de ingredientes iniciales, fechas de vencimiento ficticias y recetas base para desarrollo local antes de conectar la API.
* **Refactorización y Optimización de Código:** Limpieza de componentes de React, separación de lógica en hooks personalizados y optimización de renders.
* **Estructura del Prompt Técnico:** La optimización de la redacción del prompt para la API de Gemini, asegurando que la IA devuelva las recetas en el formato JSON estructurado que necesita la app.

---

## 🎯 QUÉ CUENTA COMO ÉXITO EN ESTE PROYECTO

* **Flujo Principal Imbatible:** Que un usuario pueda entrar con "Sin energía", ver una receta sugerida basada en los 3 tomates que le quedan por vencer en su Despensa, marcarla como cocinada, y que esta aparezca correctamente en el Historial con su rating, sin que la app se rompa en ningún paso.
* **Gestión Limpia de la Despensa:** Que el sistema de alertas visuales por vencimiento funcione en tiempo real según la fecha actual.
* **Consumo Eficiente de la API:** Que las llamadas a Gemini se disparen solo cuando el usuario lo solicita explícitamente (o al cambiar drásticamente de estado), evitando peticiones duplicadas o innecesarias en el ciclo de vida de React.
