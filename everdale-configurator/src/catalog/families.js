/**
 * Everdale Product Platform — Product Families
 */

export const PRODUCT_FAMILIES = [
  {
    id: 'freestanding-vanity',
    categoryId: 'bathroom-vanities',
    name: 'Freestanding Bathroom Vanity',
    slug: 'freestanding-vanity',
    description: 'Floor-standing cabinetry supported by tapered solid wood legs, featuring undermount drawers and stone tops.',
    configurationType: 'single-assembly',
    sceneAdapter: 'VanitySceneAdapter',
    status: 'published',
  },
  {
    id: 'wall-mounted-vanity',
    categoryId: 'bathroom-vanities',
    name: 'Floating Wall-Mounted Vanity',
    slug: 'wall-mounted-vanity',
    description: 'Wall-hung floating vanity cabinetry suspended via structural French cleats.',
    configurationType: 'single-assembly',
    sceneAdapter: 'VanitySceneAdapter',
    status: 'draft',
  },
  {
    id: 'kitchen-base-cabinet',
    categoryId: 'kitchen-cabinets',
    name: 'Kitchen Base Cabinet',
    slug: 'kitchen-base-cabinet',
    description: 'Standard 24-inch deep floor modules with toe-kick recess and modular drawer/door combinations.',
    configurationType: 'modular-system',
    sceneAdapter: 'KitchenSceneAdapter',
    status: 'draft',
  },
  {
    id: 'kitchen-wall-cabinet',
    categoryId: 'kitchen-cabinets',
    name: 'Kitchen Wall Cabinet',
    slug: 'kitchen-wall-cabinet',
    description: 'Upper wall-mounted cabinetry in 30, 36, and 42-inch heights.',
    configurationType: 'modular-system',
    sceneAdapter: 'KitchenSceneAdapter',
    status: 'draft',
  },
  {
    id: 'kitchen-tall-cabinet',
    categoryId: 'kitchen-cabinets',
    name: 'Kitchen Tall Pantry Cabinet',
    slug: 'kitchen-tall-cabinet',
    description: 'Full-height 84, 90, and 96-inch pantry and appliance housings.',
    configurationType: 'modular-system',
    sceneAdapter: 'KitchenSceneAdapter',
    status: 'draft',
  },
];

export function getFamiliesByCategory(categoryId, status = 'published') {
  return PRODUCT_FAMILIES.filter(
    (f) => f.categoryId === categoryId && (!status || f.status === status)
  );
}

export function getFamilyById(id) {
  return PRODUCT_FAMILIES.find((f) => f.id === id) || null;
}
