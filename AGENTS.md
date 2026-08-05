# Agent instructions for this repository

## Persistencia de datos (regla crítica)
- Esta aplicación NO debe usar botones de "Guardar/Desar" manuales para páginas de edición.
- Cada cambio del usuario (seleccionar una opción, editar un campo, marcar un checkbox, etc.) debe
  guardarse inmediatamente en la base de datos (Firestore, vía `POST /api/data/municipis/:slug/:page`),
  sin esperar a una acción explícita de guardado.
- Al añadir o modificar un formulario/tabla editable, usa `[ngModel]` + `(ngModelChange)` (no el shorthand
  `[(ngModel)]`) para poder actualizar el modelo y llamar a `saveData()` (u otro método de guardado) en el
  mismo evento. Ejemplo:
  ```html
  <select [ngModel]="valor" (ngModelChange)="valor = $event; saveData()">
  ```
- No añadir botones "Desar"/"Guardar" a nivel de página salvo que el usuario lo pida explícitamente.
