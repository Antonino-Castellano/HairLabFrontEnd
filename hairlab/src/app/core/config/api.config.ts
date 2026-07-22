/**
 * Configurazione centralizzata degli endpoint HairLab.
 *
 * Prima di questo refactoring ogni Service conteneva:
 *
 * http://localhost:8080/hairlab/api/...
 *
 * In questo modo l'URL era duplicato in molti file.
 *
 * Ora il dominio/base path vive in un solo punto.
 * Quando passeremo da sviluppo locale a produzione
 * sarà sufficiente modificare questa configurazione.
 */
export const HAIRLAB_API_BASE_URL =
  'http://localhost:8080/hairlab/api';

/**
 * Costruisce un endpoint HairLab
 * evitando slash duplicati.
 *
 * Esempio:
 *
 * hairLabApi('customer')
 *
 * ->
 *
 * http://localhost:8080/hairlab/api/customer
 */
export function hairLabApi(
  path: string
): string {

  const normalizedPath =
    path.startsWith('/')
      ? path.substring(1)
      : path;

  return (
    `${HAIRLAB_API_BASE_URL}/${normalizedPath}`
  );
}
