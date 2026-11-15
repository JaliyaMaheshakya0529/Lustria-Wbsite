import { useState } from 'react'
import { whatsappLink } from '../utils/inquiries'
import '../styles/CustomOrder.css'

export default function CustomOrder() {
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const fields = Object.fromEntries(['name', 'phone', 'address', 'ringSize', 'budget', 'description']
      .map(key => [key, String(data.get(key) ?? '').trim()]))
    if (!/^\+?[\d ().-]{7,30}$/.test(fields.phone) || !/^\d{7,15}$/.test(fields.phone.replace(/\D/g, ''))) {
      setError('Enter a WhatsApp number with 7 to 15 digits.')
      event.currentTarget.elements.namedItem('phone')?.focus()
      return
    }

    const message = [
      'Hello Lustria, I would like to request a custom ring.',
      '', 'Name: ' + fields.name, 'WhatsApp number: ' + fields.phone,
      'Delivery address: ' + fields.address, 'Ring size: ' + fields.ringSize,
      'Design brief: ' + fields.description, 'Budget (LKR): ' + (fields.budget || 'To discuss'),
    ].join('\n')
    const link = whatsappLink(message)
    if (!link) {
      setError('WhatsApp contact is temporarily unavailable. Please try again later.')
      return
    }
    window.location.assign(link)
  }
  return (
    <section className="bespoke-page" aria-labelledby="custom-order-title">
      <h1 id="custom-order-title">Custom Ring Request</h1>
        <form className="bespoke-form" onSubmit={submit}>
          <fieldset>
            <legend>Ring details</legend>
            <label>Design brief<textarea name="description" required maxLength={600} rows={4} placeholder="For example, an oval blue sapphire in a simple silver setting…" /></label>
            <div className="bespoke-grid">
              <label>Ring size<input name="ringSize" required maxLength={40} placeholder="US 7, 17 mm, or unsure" /><small>Include the sizing system if you know it.</small></label>
              <label><span>Budget in LKR <small>(optional)</small></span><input name="budget" maxLength={60} placeholder="15,000 – 25,000" /></label>
            </div>
            <p><small>Attach your reference image in WhatsApp after opening the chat.</small></p>
          </fieldset>
          <fieldset>
            <legend>Contact details</legend>
            <div className="bespoke-grid">
              <label>Full name<input name="name" autoComplete="name" required maxLength={90} /></label>
              <label>WhatsApp number<input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="+94 77 123 4567" /></label>
            </div>
            <label>Delivery address<textarea name="address" autoComplete="street-address" required maxLength={240} rows={2} /></label>
          </fieldset>
          {error && <p className="bespoke-error" role="alert">{error}</p>}
<button className="bespoke-submit" type="submit">Continue to WhatsApp</button>
          <p><small>Review your details in WhatsApp, attach an image if needed, then tap Send.</small></p>
        </form>
    </section>
  )
}
