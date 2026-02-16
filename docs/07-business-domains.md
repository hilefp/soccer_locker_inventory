# Business Domains

A quick reference of what each module does and its key concepts.

## Products (`/products`)

Manages the product catalog.

**Key concepts:**
- **Product** — A base item (e.g., "Nike Soccer Cleats")
- **Variant** — A specific SKU with size/color/attributes (e.g., "Nike Cleats - Red - Size 10")
- **Category** — Product grouping (e.g., "Footwear", "Jerseys")
- **Brand** — Manufacturer (e.g., "Nike", "Adidas")
- **Attribute** — Custom properties for variants (e.g., "Size", "Color")

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| Product List | `/products` | Browse all products |
| Product Form | `/products/create`, `/products/:id/edit` | Create/edit a product |
| Product Detail | `/products/:id` | View product info and its variants |
| Variant Detail | `/products/:productId/variants/:variantId` | Variant pricing, attributes, stock |
| Categories | `/products/categories` | Manage categories |
| Brands | `/products/brands` | Manage brands |
| Attributes | `/products/attributes` | Manage variant attributes |

---

## Inventory (`/inventory`)

Tracks stock levels across warehouses.

**Key concepts:**
- **Warehouse** — A physical or virtual storage location
  - Types: `MAIN`, `SECONDARY`, `STORE`, `VIRTUAL`, `PRODUCTION`, `TRANSIT`
- **Stock Variant** — How much of a product variant is in a warehouse
  - Tracks: `total`, `reserved`, `available` quantities
  - Status: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`
- **Stock Entry** — A record of inventory intake (when new stock arrives)
- **Stock Movement** — A transaction log (adjustments, transfers, exits)

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| Stock Variants | `/inventory/stocks` | Overview of all stock levels |
| Stock Detail | `/inventory/stocks/:id` | Detailed view of a variant's stock |
| Stock Entry | `/inventory/stocks/entry` | Record new stock arrivals |
| Movements | `/inventory/movements` | Transaction history |
| Warehouses | `/inventory/warehouses` | Manage warehouse locations |
| Warehouse Form | `/inventory/warehouses/create` | Create/edit a warehouse |
| Warehouse Stats | `/inventory/warehouses/:id/statistics` | Warehouse analytics |

**Stock operations** (performed via drawer components):
- Adjust stock (manual correction)
- Increment stock (add inventory)
- Physical count (reconciliation)
- Register exit (record outgoing stock)

---

## Orders (`/orders`)

Manages customer orders from creation to delivery.

**Key concepts:**
- **Order** — A customer purchase with line items
- **Order Status Flow** — Orders progress through defined stages:

```
NEW → PRINT → PICKING_UP → PROCESSING → SHIPPING → DELIVERED
                                                        ↓
At any point (except DELIVERED): → MISSING or REFUND
MISSING can go back to → NEW
```

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| Order List | `/orders` | Browse, search, and filter orders |
| Order Detail | `/orders/:id` | View order info, update status, print invoice |
| Current Orders | `/orders/current` | Kanban board view of active orders |

**Features:**
- QR code generation per order
- Invoice and packing slip printing
- Export to Excel
- Kanban board for visual order tracking
- Advanced search with multiple filters

---

## Clubs (`/clubs`)

Manages soccer clubs/teams and their specific product configurations.

**Key concepts:**
- **Club** — A team or organization (e.g., "FC Barcelona Youth Academy")
- **Club Product** — Products with club-specific pricing, logos, or customization
- **Custom Fields** — Club-specific metadata

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| Club List | `/clubs` | Browse all clubs |
| Club Detail | `/clubs/:id` | View club info and linked products |
| Club Edit | `/clubs/:id/edit` | Edit club details |
| Club Product Edit | `/clubs/:id/products/:productId` | Edit club-specific product settings |

---

## Reports (`/reports`)

Analytics dashboards.

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| General Reports | `/reports` | Overview dashboard |
| Product Reports | `/reports/products` | Product performance analytics |
| Stock Reports | `/reports/stock` | Stock level analysis |
| Inventory Reports | `/reports/inventory` | Inventory health metrics |

Uses **Recharts** and **ApexCharts** for data visualization (bar charts, line charts, rankings).

---

## Shop (`/shop`)

Customer management.

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| Customer List | `/shop/customers` | Browse all customers |
| Customer Detail | `/shop/customers/:id` | Customer profile and order history |

---

## Settings (`/settings`)

Admin and system configuration.

**Pages:**
| Page | Path | Purpose |
|------|------|---------|
| User List | `/settings/users` | Manage inventory system users |

Features:
- Create/edit/deactivate users
- Role-based access control

---

## Dashboard (`/dashboard`)

The home page after login. Shows quick-access cards to each module with summary statistics.
