# Everdale Architecture: Catalogue Data Access Specification
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Data Access Layer, Service Facade, Future PostgreSQL / Supabase Migration

---

## 1. Overview & Data Source Abstraction

To guarantee that the frontend configurator and 3D viewers remain completely agnostic to whether catalog data originates from bundled in-memory JSON modules, a local development mock, a headless CMS, or a cloud PostgreSQL/Supabase database, all catalog interactions are funneled through the unified **`CatalogService` Facade**.

```
+--------------------------------------------------------------+
|            Client Consumer (ConfigPanel, Viewport, App)       |
+------------------------------+-------------------------------+
                               │ (Method Invocations)
                               v
+--------------------------------------------------------------+
|                  CatalogService (Facade)                     |
|  getCategories(), getProduct(), getVariants(), getPricing()  |
+------------------------------+-------------------------------+
                               │
            +------------------+------------------+
            │                                     │
            v                                     v
+-----------------------+             +------------------------+
| Local In-Memory Provider |           | Remote API / Supabase  |
| (Active Phase 03 ESM)  |           | (Future Phase 04 / 05) |
+-----------------------+             +------------------------+
```

---

## 2. Service Interface Signatures

```typescript
interface ICatalogService {
  getCategories(status?: string): Category[];
  getCategory(id: string): Category | null;
  getFamilies(categoryId: string, status?: string): ProductFamily[];
  getFamily(id: string): ProductFamily | null;
  getProducts(status?: string): Product[];
  getProduct(id: string): Product | null;
  getVariants(productId: string): ProductVariant[];
  getVariant(id: string): ProductVariant | null;
  getModelAsset(variantId: string): ProductAsset | null;
  getRenders(productId: string, variantId?: string): ProductRender[];
  validateConfig(rawConfig: object): ValidationResult;
  calculatePrice(config: object, options?: object): PricingResult;
  evaluateEligibility(product: Product, variant: ProductVariant, config: object): EligibilityResult;
}
```

---

## 3. Future PostgreSQL / Supabase Relational Migration (DDL)

When moving to a dedicated database backend, the entities map directly to the normalized schema below:

```sql
-- 1. Categories
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product Families
CREATE TABLE product_families (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    configuration_type VARCHAR(64) NOT NULL,
    scene_adapter VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    family_id VARCHAR(64) REFERENCES product_families(id) ON DELETE RESTRICT,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(128) NOT NULL,
    master_sku VARCHAR(64),
    features JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    default_variant_id VARCHAR(64),
    pricing_mode VARCHAR(32) DEFAULT 'configurable',
    purchase_enabled BOOLEAN DEFAULT TRUE,
    quote_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(32) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Variants
CREATE TABLE product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(64) UNIQUE NOT NULL,
    label VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    dimensions JSONB NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    model_file_path TEXT NOT NULL,
    availability_status VARCHAR(32) DEFAULT 'in-stock',
    status VARCHAR(32) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Assets
CREATE TABLE product_assets (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
    asset_type VARCHAR(32) NOT NULL,
    file_path TEXT NOT NULL,
    format VARCHAR(16) NOT NULL,
    file_size_bytes INT,
    version VARCHAR(32) DEFAULT '1.0.0',
    validation_status VARCHAR(32) DEFAULT 'validated'
);

-- Indexes for high-frequency queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_assets_variant ON product_assets(variant_id);
```
