/**
 * Everdale Product Platform — Product Categories
 */

export const CATEGORIES = [
  {
    id: 'bathroom-vanities',
    name: 'Bathroom Vanities',
    slug: 'bathroom-vanities',
    description: 'Luxury freestanding and wall-mounted vanity combos with integrated stone tops and architectural finishes.',
    image: '/textures/warm_studio_1k.hdr',
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'kitchen-cabinets',
    name: 'Kitchen Cabinets',
    slug: 'kitchen-cabinets',
    description: 'Modular frameless base, wall, and tall cabinetry engineered to standard 3-inch increments.',
    image: null,
    displayOrder: 2,
    status: 'draft', // Draft status: not published to customer storefront until factory CAD and SKUs are onboarded
  },
];

export function getCategories(status = 'published') {
  if (!status) return CATEGORIES;
  return CATEGORIES.filter((c) => c.status === status);
}

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
