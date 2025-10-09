import 'swagger-ui-dist/swagger-ui.css';

export async function loadSwaggerUI(element: HTMLElement, url: string) {
  const options = {
    url,
    domNode: element,
    deepLinking: true,
    docExpansion: 'list' as const,
    defaultModelExpandDepth: 3,
    displayOperationId: false,
    defaultModelsExpandDepth: -1,
  };
  
  // Use the bundle version which includes all required dependencies
  const SwaggerUI = (await import('swagger-ui-dist/swagger-ui-bundle')).default;
  SwaggerUI(options);
}