/**
 * Fichero de configuración global del entorno de tests.
 * Se ejecuta automáticamente antes de cada suite gracias a
 * la opción `setupFiles` de vitest/config.
 */

/**
 * Registra los matchers personalizados de @testing-library/jest-dom
 * (toBeInTheDocument, toHaveValue, toBeVisible, etc.) sobre el `expect`
 * de Vitest. Se usa la entrada específica `/vitest` del paquete para
 * evitar que la librería busque el `expect` global de Jest, que no existe
 * en este entorno.
 */
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Desmonta el árbol de componentes React renderizado tras cada test
 * y limpia el documento DOM.
 *
 * Sin este hook, los renders se acumulan entre tests dentro del mismo
 * fichero porque Vitest no expone `afterEach` como global (no se usa
 * `globals: true`), por lo que React Testing Library no puede registrar
 * el cleanup de forma automática.
 */
afterEach(cleanup);
