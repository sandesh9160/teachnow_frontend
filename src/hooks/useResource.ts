import { useState, useEffect } from "react";
import { getResourceBySlug, getResources } from "@/hooks/useHomepage";
import { ResourceData } from "@/types/homepage";

export function useResource(slug: string) {
  const [resource, setResource] = useState<ResourceData | null>(null);
  const [related, setRelated] = useState<ResourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResource = async () => {
      try {
        setLoading(true);
        setError(null);

        const found = await getResourceBySlug(slug);

        if (!found?.resource) {
          setError("Resource not found.");
          return;
        }

        setResource(found.resource);

        if (found.similar_resources?.length) {
          setRelated(found.similar_resources.slice(0, 3));
        } else {
          // Fallback: fetch related resources separately if not provided
          const allResources = await getResources();
          const relatedItems = allResources
            .filter((item: ResourceData) => item.slug !== slug)
            .slice(0, 3);

          setRelated(relatedItems);
        }
      } catch (err) {
        //console.error("Error loading resource:", err);
        setError("Failed to load this resource.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadResource();
    }
  }, [slug]);

  return { resource, related, loading, error };
}
