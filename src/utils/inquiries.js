const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')
const hasWhatsappNumber = /^[1-9]\d{6,14}$/.test(whatsappNumber)

export function whatsappLink(message) {
  return hasWhatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : null
}

export const contactLink = whatsappLink('Hello Lustria, I would like to inquire about your jewellery.')
export const customOrderLink = '/custom-order'
