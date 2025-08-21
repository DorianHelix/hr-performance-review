// Shopify API Service
class ShopifyService {
  constructor() {
    this.credentials = this.loadCredentials();
  }

  // Load credentials from localStorage
  loadCredentials() {
    const stored = localStorage.getItem('shopify_credentials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing Shopify credentials:', e);
      }
    }
    return null;
  }

  // Save credentials to localStorage
  saveCredentials(storeDomain, accessToken) {
    const credentials = {
      storeDomain: storeDomain.replace('https://', '').replace('.myshopify.com', ''),
      accessToken,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('shopify_credentials', JSON.stringify(credentials));
    this.credentials = credentials;
    return credentials;
  }

  // Clear credentials
  clearCredentials() {
    localStorage.removeItem('shopify_credentials');
    localStorage.removeItem('shopify_products_cache');
    this.credentials = null;
  }

  // Check if credentials are set
  hasCredentials() {
    return !!this.credentials;
  }

  // Get formatted store URL
  getStoreUrl() {
    if (!this.credentials) return null;
    return `https://${this.credentials.storeDomain}.myshopify.com`;
  }

  // Fetch products from Shopify API through backend proxy
  async fetchProducts(options = {}) {
    if (!this.credentials) {
      throw new Error('Shopify credentials not configured');
    }

    try {
      // Call backend API which will proxy to Shopify
      const response = await fetch('http://localhost:3001/api/shopify/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeDomain: this.credentials.storeDomain,
          accessToken: this.credentials.accessToken,
          saveToDb: options.saveToDb || false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch products from Shopify');
      }

      const data = await response.json();
      
      // Transform Shopify products to our format
      const transformedProducts = this.transformShopifyProducts(data.products || []);
      
      // Cache the products
      localStorage.setItem('shopify_products_cache', JSON.stringify({
        products: transformedProducts,
        fetchedAt: new Date().toISOString()
      }));
      
      return transformedProducts;
    } catch (error) {
      console.error('Error fetching from Shopify:', error);
      
      // Try to return cached data if available
      const cache = localStorage.getItem('shopify_products_cache');
      if (cache) {
        const cached = JSON.parse(cache);
        console.log('Returning cached Shopify products');
        return cached.products;
      }
      
      throw error;
    }
  }

  // Transform Shopify product format to our internal format
  transformShopifyProducts(shopifyProducts) {
    return shopifyProducts.map(product => {
      const transformed = {
        id: `shopify-${product.id}`,
        shopifyId: product.id,
        handle: product.handle,
        name: product.title,
        description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '') : '',
        vendor: product.vendor,
        type: product.product_type,
        tags: product.tags ? product.tags.split(', ') : [],
        status: product.status,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        images: product.images ? product.images.map(img => img.src) : [],
        source: 'shopify_api'
      };

      // Handle variants
      if (product.variants && product.variants.length > 0) {
        if (product.variants.length === 1 && product.variants[0].title === 'Default Title') {
          // Single variant product (no real variants)
          const variant = product.variants[0];
          transformed.hasVariants = false;
          transformed.sku = variant.sku;
          transformed.barcode = variant.barcode;
          transformed.price = parseFloat(variant.price) || 0;
          transformed.comparePrice = parseFloat(variant.compare_at_price) || null;
          // Cost comes from the inventory_items endpoint (fetched by backend)
          transformed.cost = parseFloat(variant.cost) || 0;
          transformed.stock = variant.inventory_quantity || 0;
          transformed.weight = variant.weight;
          transformed.weightUnit = variant.weight_unit;
        } else {
          // Multiple variants
          transformed.hasVariants = true;
          transformed.variants = product.variants.map(variant => ({
            id: `var-${variant.id}`,
            shopifyId: variant.id,
            name: variant.title,
            sku: variant.sku,
            barcode: variant.barcode,
            price: parseFloat(variant.price) || 0,
            comparePrice: parseFloat(variant.compare_at_price) || null,
            // Cost comes from the inventory_items endpoint (fetched by backend)
            cost: parseFloat(variant.cost) || 0,
            stock: variant.inventory_quantity || 0,
            weight: variant.weight,
            weightUnit: variant.weight_unit,
            inventoryItemId: variant.inventory_item_id,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3
          }));
          
          // Calculate totals
          transformed.totalStock = transformed.variants.reduce((sum, v) => sum + v.stock, 0);
          
          // Set price range for display
          const prices = transformed.variants.map(v => v.price);
          transformed.priceMin = Math.min(...prices);
          transformed.priceMax = Math.max(...prices);
        }
      }

      // Use Shopify's product_category field if available
      // This is the standard Google product category taxonomy field
      let category = 'Uncategorized';
      
      // First priority: Use product_category if it exists
      if (product.product_category) {
        // Product category often comes as a path like "Apparel & Accessories > Clothing > Shirts"
        // Take the last part for simplicity, or the first main category
        const categoryParts = product.product_category.split('>').map(c => c.trim());
        category = categoryParts[0]; // Use the main category
      }
      // Second priority: Check custom metafields for category
      else if (product.metafields && Array.isArray(product.metafields)) {
        const categoryField = product.metafields.find(m => 
          m.key === 'category' || m.key === 'product_category'
        );
        if (categoryField && categoryField.value) {
          category = categoryField.value;
        }
      }
      // Third priority: Parse from tags
      else if (product.tags) {
        const categoryTag = product.tags.split(', ').find(tag => 
          tag.toLowerCase().startsWith('category:')
        );
        if (categoryTag) {
          category = categoryTag.split(':')[1].trim();
        }
      }
      // Fourth priority: Use product type if it seems like a category
      else if (product.product_type && product.product_type !== '') {
        category = product.product_type;
      }
      
      transformed.category = category;
      
      // Keep product_type as type for filtering
      transformed.type = product.product_type || '';
      
      return transformed;
    });
  }

  // Test connection to Shopify
  async testConnection() {
    if (!this.credentials) {
      throw new Error('No credentials configured');
    }

    try {
      const response = await fetch('http://localhost:3001/api/shopify/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeDomain: this.credentials.storeDomain,
          accessToken: this.credentials.accessToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Connection test failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  // Get cached products if available
  getCachedProducts() {
    const cache = localStorage.getItem('shopify_products_cache');
    if (cache) {
      const cached = JSON.parse(cache);
      return {
        products: cached.products,
        fetchedAt: cached.fetchedAt
      };
    }
    return null;
  }
}

// Export singleton instance
const shopifyService = new ShopifyService();
export default shopifyService;