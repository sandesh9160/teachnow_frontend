
export interface JsonLdProps<T> {
  schema: T | T[];
}

export function JsonLd<T extends Record<string, any>>({ schema }: JsonLdProps<T>) {
  // Prevent XSS attacks via JSON-LD
  const jsonLdString = JSON.stringify(schema).replace(/</g, '\\u003c');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}
