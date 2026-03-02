import pool from './db';

/**
 * Get provider by slug
 */
export async function getProviderBySlug(slug: string) {
  const result = await pool.query(
    `SELECT id, slug, name, business_name, service_type, email, phone,
            location, latitude, longitude, bio, avatar_url, theme_config,
            services, calendar_start_time, calendar_end_time, slot_duration,
            buffer_time, working_days, created_at
     FROM service_providers WHERE slug = $1`,
    [slug]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Get provider by slug or throw 404 error
 */
export async function getProviderOrThrow(slug: string) {
  const provider = await getProviderBySlug(slug);
  if (!provider) {
    throw new Error('Provider not found');
  }
  return provider;
}

/**
 * Get provider services (stored in JSONB column)
 */
export async function getProviderServices(providerId: number) {
  const result = await pool.query(
    'SELECT services FROM service_providers WHERE id = $1',
    [providerId]
  );
  return result.rows[0]?.services || [];
}

/**
 * Find service by ID from services array
 * Handles both "providerId_index" and legacy "index" formats
 */
export function findServiceById(services: any[], serviceId: string) {
  let serviceIndex: number;
  if (serviceId.includes('_')) {
    const parts = serviceId.split('_');
    serviceIndex = parseInt(parts[parts.length - 1]);
  } else {
    serviceIndex = parseInt(serviceId);
  }

  return services[serviceIndex] || null;
}

/**
 * Get default fallback service
 */
export function getDefaultService() {
  return {
    name: 'Service',
    duration: 30,
    price: 0,
    icon: '✂️',
    is_active: true
  };
}
