import React, { useEffect, useRef, useState } from 'react';
import '../styles/AdminBatchUpload.css';

const CATEGORIES = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Gemstones'];
const GEMSTONES = ['Blue Sapphire', 'Yellow Sapphire', 'Pink Sapphire', 'White Sapphire', 'Padparadscha', 'Blue Topaz', 'White Topaz', 'Amethyst', 'Garnet', 'Citrine', 'Peridot', 'Tourmaline', "Cat's Eye", 'Pearl', 'Black Coral', 'Nawarathna', 'Other'];
const MAX_FILES = 50;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function titleFromFile(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

const DEFAULT_BULK = {
  category: 'Rings', gemstone: 'Blue Sapphire', metal: '925 Sterling Silver',
  description: '', price: '', available: true,
};

export default function AdminBatchUpload({ onClose, onPublish, featuredSlots = 0 }) {
  const [items, setItems] = useState([]);
  const [bulk, setBulk] = useState(DEFAULT_BULK);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const nextId = useRef(0);
  const urls = useRef(new Set());
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape' && !busyRef.current) onCloseRef.current();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')]
        .filter((element) => element.getClientRects().length);
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault(); controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault(); controls[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      for (const url of urls.current) URL.revokeObjectURL(url);
      urls.current.clear();
    };
  }, []);

  const addFiles = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    const valid = incoming.filter((file) => ACCEPTED.has(file.type) && file.size <= MAX_BYTES);
    const invalid = incoming.length - valid.length;
    const remaining = Math.max(0, MAX_FILES - items.length);
    const chosen = valid.slice(0, remaining);
    if (invalid || chosen.length !== incoming.length) {
      setError(`${invalid ? `${invalid} unsupported/oversized file(s). ` : ''}Up to ${MAX_FILES} JPG, PNG or WebP images, maximum 5 MB each.`);
    } else setError('');
    setItems((current) => [...current, ...chosen.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.add(url);
      return {
        id: ++nextId.current, file, url,
        name: titleFromFile(file.name),
        ...bulk, featured: false,
      };
    })]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const updateItem = (id, patch) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const removeItem = (id) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) { URL.revokeObjectURL(item.url); urls.current.delete(item.url); }
      return current.filter((entry) => entry.id !== id);
    });
  };
  const applyToAll = () => {
    setItems((current) => current.map((item) => ({ ...item, ...bulk })));
    setError('');
  };

  const featuredSelected = items.filter((item) => item.featured).length;
  const submit = () => {
    if (busy || !items.length) return;
    const invalid = items.find((item) => !item.name.trim() || item.price === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0);
    if (invalid) {
      setError(`Check name and price for “${invalid.name || invalid.file.name}”. Every item needs a valid price (0 is allowed).`);
      return;
    }
    if (featuredSelected > featuredSlots) {
      setError(`Only ${featuredSlots} Featured slot(s) remain. Uncheck some Featured items first.`);
      return;
    }
    setBusy(true);
    try {
      onPublish(items.map(({ file, name, category, gemstone, metal, description, price, available, featured }) => ({
        file,
        payload: {
          name: name.trim(), category, gemstone, metal,
          description: description.trim(), price: Number(price),
          available, featured,
        },
      })));
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not queue products.');
      setBusy(false);
    }
  };

  return (
    <div className="lbatch-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <section className="lbatch-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="lbatch-title" data-lenis-prevent>
        <header className="lbatch-header">
          <div><span className="lbatch-kicker">PRODUCT MANAGEMENT</span><h2 id="lbatch-title">Batch Upload</h2><p>Upload images, edit each product, or apply details to every item.</p></div>
          <button type="button" className="lbatch-close" onClick={onClose} aria-label="Close batch editor">×</button>
        </header>

        <div className="lbatch-body" data-lenis-prevent>
          <div className={`lbatch-dropzone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            <span className="lbatch-drop-icon">＋</span>
            <strong>Drop your product photos here</strong>
            <span>JPG, PNG, WebP · 5 MB per image · Up to 50 products per batch</span>
            <button type="button" className="lbatch-outline" onClick={() => inputRef.current?.click()}>Browse images</button>
          </div>

          <div className="lbatch-bulk">
            <div className="lbatch-section-heading"><div><h3>Apply details to all</h3><p>These values will overwrite the corresponding fields on every item. Names stay individual.</p></div><button type="button" className="lbatch-outline" disabled={!items.length} onClick={applyToAll}>Apply to all</button></div>
            <div className="lbatch-bulk-grid">
              <label>Category<select value={bulk.category} onChange={(e) => setBulk({ ...bulk, category: e.target.value })}>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label>Gemstone<select value={bulk.gemstone} onChange={(e) => setBulk({ ...bulk, gemstone: e.target.value })}>{GEMSTONES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label>Metal<input value={bulk.metal} onChange={(e) => setBulk({ ...bulk, metal: e.target.value })} /></label>
              <label>Price (LKR)<input type="number" min="0" step="0.01" placeholder="Enter price" value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} /></label>
              <label className="lbatch-wide">Description<textarea rows={2} value={bulk.description} onChange={(e) => setBulk({ ...bulk, description: e.target.value })} placeholder="Description for all selected items" /></label>
              <label className="lbatch-check"><input type="checkbox" checked={bulk.available} onChange={(e) => setBulk({ ...bulk, available: e.target.checked })} /> Publish as available</label>
            </div>
          </div>

          <div className="lbatch-section-heading lbatch-items-heading"><div><h3>Products to upload <span>({items.length})</span></h3><p>Edit each product before publishing. Names are generated from filenames.</p></div></div>
          <div className="lbatch-items">
            {items.length === 0 && <p className="lbatch-empty">Choose images to start preparing your batch.</p>}
            {items.map((item, index) => (
              <article className="lbatch-item" key={item.id}>
                <img className="lbatch-preview" src={item.url} alt="" />
                <div className="lbatch-item-fields">
                  <div className="lbatch-item-heading"><strong>Product {index + 1}</strong><small title={item.file.name}>{item.file.name}</small></div>
                  <div className="lbatch-item-grid">
                    <label className="lbatch-name">Product name<input value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} /></label>
                    <label>Price (LKR)<input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, { price: e.target.value })} /></label>
                    <label>Category<select value={item.category} onChange={(e) => updateItem(item.id, { category: e.target.value })}>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></label>
                    <label>Gemstone<select value={item.gemstone} onChange={(e) => updateItem(item.id, { gemstone: e.target.value })}>{GEMSTONES.map((v) => <option key={v}>{v}</option>)}</select></label>
                    <label>Metal<input value={item.metal} onChange={(e) => updateItem(item.id, { metal: e.target.value })} /></label>
                    <label className="lbatch-description">Description<textarea rows={2} value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} /></label>
                  </div>
                  <div className="lbatch-item-bottom">
                    <label><input type="checkbox" checked={item.available} onChange={(e) => updateItem(item.id, { available: e.target.checked })} /> Available</label>
                    <label><input type="checkbox" checked={item.featured} disabled={!item.featured && featuredSelected >= featuredSlots} onChange={(e) => updateItem(item.id, { featured: e.target.checked })} /> Featured</label>
                    <button type="button" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {error && <p className="lbatch-error" role="alert">{error}</p>}
        </div>
        <footer className="lbatch-footer"><span>{items.length} ready · {featuredSelected} Featured · {featuredSlots} Featured slots available</span><div><button type="button" className="lbatch-outline" onClick={onClose}>Cancel</button><button type="button" className="lbatch-publish" disabled={!items.length || busy} onClick={submit}>{busy ? 'Queuing…' : `Publish ${items.length} Product${items.length === 1 ? '' : 's'}`}</button></div></footer>
      </section>
    </div>
  );
}
