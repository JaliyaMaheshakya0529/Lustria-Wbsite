# Catalogue and uploads

- The homepage queries up to four available featured products. Collection filters and sorts on the backend and loads 24 products at a time. Category selection is represented by the `category` query parameter.
- Product URLs use permanent `LUS-` codes. Existing internal-ID and legacy product-code links continue to resolve for available products.
- The admin limits Featured to four products. If a product changes while an editor is open, reopen the product for the latest details before trying to save again.
- Batch upload saves each product independently. Retries reuse uploaded images for up to 24 hours. Convex removes expired staged images and removes replaced or deleted product images after the last catalogue reference is gone. Keep the admin tab open while uploads run.
- Images uploaded through an older deployment or interrupted before they could be staged are outside that automatic cleanup.

See [local setup](README.md#local-setup).
