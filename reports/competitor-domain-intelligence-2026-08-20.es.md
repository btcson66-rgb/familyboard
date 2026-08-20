# Dossier de inteligencia de dominio: FamilyBoard local-first

Fecha: 2026-08-20

## Contexto del sector

FamilyBoard se encuentra entre los gestores domésticos, inventarios del hogar y organizadores de mantenimiento. La ventaja diferencial no debe ser una nube más, sino una experiencia sin cuenta, bilingüe, utilizable sin conexión y con control explícito de los archivos de respaldo.

## Patrones comprobados en productos comparables

- Sortly acepta CSV/XLSX, mapea columnas, muestra errores antes de importar y entrega una confirmación o informe. Decisión para FamilyBoard: mantener un formato CSV propio, validar todas las filas, mostrar altas/actualizaciones antes de escribir y bloquear el archivo completo si hay errores. Fuente: https://help.sortly.com/hc/en-us/articles/360000735352-Bulk-Importing-New-Items-Folders
- Homebox usa una referencia de importación estable para deduplicar y actualizar registros existentes. Decisión para FamilyBoard: usar el `id` estable como referencia; ofrecer «merge» para actualizar y «append» para clonar con IDs nuevos, remapeando relaciones. Fuente: https://hay-kot.github.io/homebox/import-csv/
- HomeZada permite exportar el inventario como hoja de cálculo y guardar archivos/documentos aparte. Decisión para FamilyBoard: ofrecer una tabla maestra CSV legible, pero conservar JSON/encrypted JSON como copia integral de recuperación. Fuente: https://www.homezada.com/faq
- Los navegadores almacenan IndexedDB como best-effort por defecto; `navigator.storage.persist()` puede solicitar almacenamiento persistente. Decisión para FamilyBoard: mostrar el estado real, permitir solicitar persistencia y no prometer que sustituye una copia externa. Fuentes: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist y https://web.dev/articles/storage-for-the-web

## UX específica del nicho

1. Exportar primero, importar después: una importación debe generar automáticamente una instantánea JSON previa.
2. Previsualización comprensible: nombre del archivo, filas, registros nuevos, actualizaciones, descriptor del hogar omitido y errores por número de fila.
3. Dos intenciones distintas: actualizar por ID estable o añadir copias; nunca ocultar esta diferencia.
4. CSV para revisión humana; JSON cifrado para recuperación. El usuario no debe confundirlos.
5. Aviso de respaldo atrasado y solicitud explícita de almacenamiento persistente.
6. Archivo UTF-8 con BOM para que Excel preserve chino tradicional.

## Riesgos ocultos y controles

- Fórmulas maliciosas en hojas de cálculo: prefijar celdas que empiecen con `=`, `+`, `-`, `@`, tabulador o retorno de carro y revertir solamente la protección propia durante la reimportación.
- Datos huérfanos: bloquear relaciones a activos, miembros, contactos o tareas de mantenimiento inexistentes.
- Duplicados silenciosos: bloquear IDs repetidos dentro del archivo y usar IDs estables para merge.
- Consumo excesivo de memoria: límite de 5 MB y 5.000 filas.
- Archivos parciales: transacción única de IndexedDB; cualquier error impide la escritura.
- Confusión de privacidad: números de serie, contactos, notas y URLs permanecen en el dispositivo; no enviar CSV ni JSON a servicios externos.
- Falsa sensación de seguridad: la persistencia del navegador reduce la expulsión automática, pero el usuario todavía puede borrar datos; mantener recordatorios y copias descargables.

## Stack recomendado y adoptado

- IndexedDB + Dexie para datos estructurados y transacciones.
- Web Crypto PBKDF2-SHA-256 + AES-256-GCM para respaldos cifrados.
- CSV RFC 4180 compatible, sin dependencia pesada de hojas de cálculo.
- StorageManager `estimate()`, `persisted()` y `persist()` para estado de almacenamiento verificable.
- Vitest + fake-indexeddb para integridad y Playwright + axe para el ciclo real, teclado, móvil y accesibilidad.

## Próximas oportunidades, no incluidas sin evidencia de uso

- Filtros y vistas guardadas por habitación/categoría cuando el volumen real de activos lo justifique.
- Informe imprimible para seguros cuando existan valores y fotos suficientes.
- Historial de cambios local si los usuarios actualizan en masa con frecuencia.
- Lectura de códigos QR/barra solamente después de validar demanda y privacidad; no añadir IA externa por defecto.
