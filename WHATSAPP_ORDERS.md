# Custom order notifications

The website saves submissions in the private Convex customOrders table and schedules orders:notify. Customers receive confirmation after the database save. The notification status records queued, sending, configuration_required, accepted, rejected or needs_review. Accepted means Meta accepted the message. Delivery receipts are not implemented.

Configure these variables in the Convex dashboard, never in VITE variables.

- WHATSAPP_TOKEN — Meta system user access token with WhatsApp messaging permissions.
- WHATSAPP_SENDER_ID — registered Cloud API phone number ID for the internal sender.
- WHATSAPP_RECIPIENT — the father's opted-in WhatsApp number in international digits.

The sender defaults to Graph API `v25.0`, English (`en`), and the template names `lustria_order_alert` for text and `lustria_order_alert_image` for image orders. If your Meta setup uses different values, set `WHATSAPP_API_VERSION`, `WHATSAPP_TEMPLATE_LANGUAGE`, `WHATSAPP_TEMPLATE`, or `WHATSAPP_IMAGE_TEMPLATE` as needed.

Both templates need seven body parameters in this order.

1. Order reference
2. Customer name
3. Customer phone
4. Address
5. Ring size
6. Design brief
7. Budget

The image template uses the same body and the uploaded reference image as its header. Images are resized in the browser and stored with the order. No public query exposes customer records.

Deploy the backend with npx convex dev for development or npx convex deploy for production, then deploy the frontend. Test with Meta's test sender and an allowed recipient before configuring the production sender. Production template messaging may incur Meta charges.

Requests remain saved if notification configuration is missing or Meta rejects a send. After resolving the cause, an operator can set a configuration_required or rejected record back to queued in the Convex dashboard and run the internal orders:notify action with its ID. For sending or needs_review, confirm the message was not already sent before retrying. Automatic retries are deliberately omitted because an ambiguous network failure could duplicate an order notification.

The public endpoint caps intake at ten submissions per minute sitewide. Stronger bot protection and delivery receipt webhooks are still needed for a high-traffic deployment.
