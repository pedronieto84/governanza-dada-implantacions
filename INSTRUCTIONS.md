# Project Specification: Dashboard de Gobernanza de Datos

## 1. Contexto y Objetivo

[cite_start]El objetivo es construir una aplicaciÃ³n web para la gestiÃ³n y evaluaciÃ³n de la situaciÃ³n actual, inventario de activos de datos y un glosario corporativo[cite: 4, 14, 20]. [cite_start]La interfaz estarÃ¡ basada casi en su totalidad en visualizaciÃ³n y gestiÃ³n de datos mediante tablas[cite: 24].

## 2. Stack TecnolÃ³gico y Arquitectura

- [cite_start]**Backend (LÃ³gica centralizada en su propia carpeta):** NestJS (Ãºltima versiÃ³n compatible estrictamente con Node.js 22.17.1)[cite: 38].
- [cite_start]**Frontend:** Angular (Ãºltima versiÃ³n compatible estrictamente con Node.js 22.17.0)[cite: 40].
- [cite_start]**Estilos y UI:** TailwindCSS complementado con la librerÃ­a de componentes DaisyUI[cite: 40].
- [cite_start]**DiseÃ±o de API:** Crear una API RESTful[cite: 39]. [cite_start]Se debe diseÃ±ar como mÃ­nimo un endpoint por cada pÃ¡gina/tabla para manejar de forma independiente las acciones CRUD de cada vista[cite: 39].

## 3. Estructura de NavegaciÃ³n e Interfaz (UI/UX)

[cite_start]La aplicaciÃ³n debe contar con un menÃº de pestaÃ±as principal con una jerarquÃ­a de 3 niveles de profundidad, donde cada subpÃ¡gina estÃ¡ embebida en su vista superior[cite: 2, 3].

A continuaciÃ³n se detalla la estructura y las referencias visuales de las tablas a construir:

### [cite_start]PestaÃ±a 1: QÃ¼estionari d'avaluaciÃ³ de la situaciÃ³ actual [cite: 4]

- [cite_start]**Mapa Responsables** [cite: 5]
  - [cite_start]_Rols clau:_ ![Rols Clau](./assets/1.png) [cite: 6, 25]
  - [cite_start]_Ã€rees / Dominis:_ ![Arees Dominis](./assets/2.png) [cite: 7, 26]
  - [cite_start]_Processos clau:_ ![Processos Clau](./assets/3.png) [cite: 8, 27]
  - [cite_start]_Projectes estratÃ¨gics (p.ej. PAM, Dades Obertes, etc.):_ ![Projectes](./assets/4.png) [cite: 9, 28]
  - [cite_start]_Altres responsables:_ ![Altres Responsables](./assets/5.png) [cite: 10, 29]
- [cite_start]**Sistemas** [cite: 11]
  - [cite_start]![Sistemas](./assets/6.png) [cite: 30]
- [cite_start]**QÃ¼estionari** [cite: 12]
  - [cite_start]![Questionari](./assets/7.png) ![Questionari 2](./assets/8.png) ![Questionari 3](./assets/9.png) ![Questionari 4](./assets/10.png) ![Questionari 5](./assets/11.png) ![Questionari 6](./assets/12.png) [cite: 31]
- [cite_start]**Resultat** [cite: 13]
  - [cite_start]![Resultat](./assets/13.png) [cite: 32]

### [cite_start]PestaÃ±a 2: Plantilla dâ€™inventari dâ€™actius de dades [cite: 14]

- [cite_start]**Entitats** [cite: 15]
  - [cite_start]_Nota: Unir estas tablas de forma horizontal en la UI:_ ![Entitats](./assets/14.png) ![Entitats 2](./assets/15.png) ![Entitats 3](./assets/16.png) [cite: 33, 34]
- [cite_start]**Atributs** [cite: 16]
- **Rel. [cite_start]Atributs** [cite: 17]
  - [cite_start]![Rel Atributs](./assets/17.png) [cite: 35]
- [cite_start]**Llistes** [cite: 18]
- [cite_start]**Llegenda** [cite: 19]

### [cite_start]PestaÃ±a 3: Plantilla de glossari [cite: 20]

- [cite_start]**Glossari** [cite: 21]
  - [cite_start]![Glossari](./assets/18.png) [cite: 36]
- **Rel. [cite_start]Glossari** [cite: 22]
  - [cite_start]![Rel Glossari](./assets/19.png) [cite: 37]
- [cite_start]**Llegenda** [cite: 23]

## 4. Fases de EjecuciÃ³n del Agente

Agente, ejecuta este proyecto paso a paso, verificando cada fase antes de pasar a la siguiente:

1.  **Fase 1 (Setup):** Inicializa el monorepo o las carpetas separadas para Backend (NestJS) y Frontend (Angular). Configura Tailwind y DaisyUI.
2.  **Fase 2 (Core UI):** Crea la estructura base de enrutamiento en Angular para soportar los 3 niveles de navegaciÃ³n especificados.
3.  **Fase 3 (Backend & Modelado):** Genera los esquemas de datos, controladores y servicios CRUD en NestJS para cada una de las tablas.
4.  **Fase 4 (IntegraciÃ³n):** Desarrolla los componentes de tabla en Angular basÃ¡ndote en las imÃ¡genes de referencia y conÃ©ctalos con la API REST.
