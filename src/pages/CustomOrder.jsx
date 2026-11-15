import { useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import '../styles/CustomOrder.css'

async function readImage(file) {
  if (!file?.size) return undefined
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error('Choose a JPG, PNG or WebP image under 10 MB.')
  }
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const image = canvas.toDataURL('image/jpeg', 0.65)
  if (image.length > 350000) throw new Error('This image has too much detail. Please choose a smaller reference.')
  return image
}

export default function CustomOrder() {
  const submitOrder = useMutation(api.orders.submit)
  const request = useRef(null)
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [image, setImage] = useState()
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const imageGeneration = useRef(0)
  const imageInput = useRef(null)

  async function selectImage(event) {
    const generation = ++imageGeneration.current
    const file = event.target.files[0]
    setImageBusy(true)
    setImageError('')
    setImage(undefined)
    try {
      const result = await readImage(file)
      if (generation === imageGeneration.current) setImage(result)
    } catch (err) {
      if (generation === imageGeneration.current) {
        setImageError(err.message || 'We could not open this image. Try another file.')
      }
    } finally {
      if (generation === imageGeneration.current) setImageBusy(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (busyRef.current || imageBusy || imageError) return
    setError('')
    const data = new FormData(event.currentTarget)
    const fields = Object.fromEntries(['name', 'phone', 'address', 'ringSize', 'budget', 'description']
      .map(key => [key, String(data.get(key) ?? '').trim()]))
    if (!/^\+?[\d ().-]{7,30}$/.test(fields.phone) || !/^\d{7,15}$/.test(fields.phone.replace(/\D/g, ''))) {
      setError('Enter a WhatsApp number with 7 to 15 digits.')
      event.currentTarget.elements.namedItem('phone')?.focus()
      return
    }
    busyRef.current = true
    setBusy(true)
    try {
      if (!request.current) request.current = crypto.randomUUID()
      const id = await submitOrder({ ...fields, requestId: request.current, ...(image ? { image } : {}) })
      setReceipt(id)
    } catch (err) {
      setError(typeof err.data === 'string' ? err.data : 'We could not confirm your request. Please try again.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  function removeImage() {
    setImage(undefined)
    setImageError('')
    imageInput.current.value = ''
  }

  return (
    <section className="bespoke-page" aria-labelledby="custom-order-title">
      <h1 id="custom-order-title">Custom Ring Request</h1>
      {receipt ? (
        <div className="bespoke-form bespoke-receipt" role="status">
          <h2>Request received</h2>
          <p>Your design request has been saved. Our team will contact you using the WhatsApp number you provided.</p>
          <p className="bespoke-reference">Your reference <strong>{receipt}</strong></p>
          <a href="/collection">Explore the collection →</a>
        </div>
      ) : (
        <form className="bespoke-form" onSubmit={submit}>
          <fieldset disabled={busy}>
            <legend>Ring details</legend>
            <label>Design brief<textarea name="description" required maxLength={600} rows={4} placeholder="For example, an oval blue sapphire in a simple silver setting…" /></label>
            <div className="bespoke-grid">
              <label>Ring size<input name="ringSize" required maxLength={40} placeholder="US 7, 17 mm, or unsure" /><small>Include the sizing system if you know it.</small></label>
              <label><span>Budget in LKR <small>(optional)</small></span><input name="budget" maxLength={60} placeholder="15,000 – 25,000" /></label>
            </div>
            <div className="bespoke-upload">
              <label htmlFor="design-image"><span>Reference image <small>(optional)</small></span></label>
              <small>JPG, PNG or WebP · up to 10 MB</small>
              <input ref={imageInput} id="design-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} disabled={imageBusy} />
              {imageBusy && <p role="status">Preparing your image…</p>}
              {imageError && <p className="bespoke-error" role="alert">{imageError}</p>}
              {(image || imageError) && (
                <div className="bespoke-preview">
                  {image && <img src={image} alt="Your ring design reference" />}
                  <button type="button" onClick={removeImage}>Remove image</button>
                </div>
              )}
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Contact details</legend>
            <div className="bespoke-grid">
              <label>Full name<input name="name" autoComplete="name" required maxLength={90} /></label>
              <label>WhatsApp number<input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="+94 77 123 4567" /></label>
            </div>
            <label>Delivery address<textarea name="address" autoComplete="street-address" required maxLength={240} rows={2} /></label>
          </fieldset>
          {error && <p className="bespoke-error" role="alert">{error}</p>}
          <button className="bespoke-submit" disabled={busy || imageBusy || Boolean(imageError)} type="submit">{busy ? 'Saving your request…' : 'Submit request'}</button>
        </form>
      )}
    </section>
  )
}
