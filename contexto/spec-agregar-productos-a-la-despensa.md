# Spec: Agregar Ingredientes a la Despensa (`spec-agregar-ingredientes.md`)
# SPEC — AGREGAR INGREDIENTES A LA DESPENSA

FEATURE: Agregar nuevos ingredientes a la despensa virtual con cantidad, unidad y categoría.

POR QUÉ (el valor): El usuario necesita registrar lo que tiene en su cocina para poder gestionar su inventario y planificar sus comidas semanales.

ALCANCE — qué SÍ hago hoy:
- Se agrega un botón principal ("Añadir Ingrediente") en la vista de la despensa.
- Al hacer clic, se despliega un formulario (o sección dedicada) con los campos: Nombre (texto), Cantidad (número > 0), Unidad de medida (selector: g, kg, ml, L, unidades) y Categoría (selector: Carnes, Verduras, Granos, Lácteos, etc.).
- Al presionar "Guardar", el ingrediente se valida y se renderiza inmediatamente en la lista de la despensa actualizando la vista.
- Datos: MOCK, realistas (ej: "Arroz", 1, "kg", "Granos"). Sin backend ni base de datos real.

FUERA DE ALCANCE — qué NO debes tocar:
- No toques el flujo de la S4 (visualización general, navegación principal o layouts existentes).
- La paleta, la tipografía y los componentes del design system.
- Nada de login, autenticación, alertas de caducidad, ni integración con recetas en esta fase.

RESTRICCIONES:
- Respeta ESTRICTAMENTE el design system (abajo). No inventes colores ni tipografías.
- Reutiliza los componentes existentes; no dupliques.
- No rompas el flujo que ya funcionaba (el de la S4).

LISTO CUANDO (criterio de éxito verificable):
- Puedo abrir el formulario, rellenar los datos de un ingrediente, hacer clic en guardar y ver cómo se añade a la lista visual de la despensa con el formato correcto de inmediato y sin recargar la página. Si intento poner cantidad 0 o dejar el nombre vacío, el sistema me muestra un error visual sin romper la UI.

