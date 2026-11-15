const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')

export function whatsappLink(message) {
  return /^[1-9]\d{6,14}$/.test(whatsappNumber)
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : null
}

export const contactLink = whatsappLink('Hello Lustria, I would like to inquire about your jewellery.')
export const customOrderLink = whatsappLink('Hello Lustria, I would like to discuss a custom jewellery order.')
