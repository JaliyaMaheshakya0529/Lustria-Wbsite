import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/AdminBatchUpload.css';

const CATEGORIES = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Gemstones'];
const GEMSTONES = ['Blue Sapphire', 'Yellow Sapphire', 'Pink Sapphire', 'White Sapphire', 'Padparadscha', 'Blue Topaz', 'White Topaz', 'Amethyst', 'Garnet', 'Citrine', 'Peridot', 'Tourmaline', "Cat's Eye", 'Pearl', 'Black Coral', 'Nawarathna', 'Other'];
const METALS = ['925 Sterling Silver', 'Pure Sterling Silver', 'Gold-Plated Sterling Silver', 'Loose Natural Gemstone'];
const MAX_FILES = 50;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DEFAULTS = { category: 'Rings', gemstone: 'Blue Sapphire', metal: '925 Sterling Silver', description: '', price: '', available: true };
const BULK_FIELDS = ['category', 'gemstone', 'metal', 'price', 'description', 'available'];
const humanFileName = (name) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
const validItem = (item) => !!item.name.trim() && item.price !== '' && Number.isFinite(Number(item.price)) && Number(item.price) >= 0;

export default function AdminBatchUpload({ onClose, onPublish, featuredSlots = 0 }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [step, setStep] = useState('edit');
  const [bulk, setBulk] = useState(DEFAULTS);
  const [applyFields, setApplyFields] = useState(['category', 'gemstone', 'metal']);
  const [bulkTarget, setBulkTarget] = useState('selected');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [query, setQuery] = useState('');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const inputRef = useRef(null);
  const nextId = useRef(0);
  const urlsRef = useRef(new Set());
  const dialogRef = useRef(null);
  const editorRef = useRef(null);
  const itemsRef = useRef(items);
  const busyRef = useRef(busy);
  const onCloseRef = useRef(onClose);
  itemsRef.current = items;
  busyRef.current = busy;
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus({ preventScroll: true });
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busyRef.current) requestClose();
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
        .filter((element) => element.getClientRects().length && !element.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current.clear();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  const requestClose = () => {
    if (busyRef.current) return;
    if (itemsRef.current.length && !window.confirm('Discard this batch? Your product edits have not been published.')) return;
    onCloseRef.current();
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const invalid = incoming.filter((f) => !ACCEPTED.has(f.type) || f.size > MAX_BYTES);
    const valid = incoming.filter((f) => ACCEPTED.has(f.type) && f.size <= MAX_BYTES);
    const available = Math.max(0, MAX_FILES - itemsRef.current.length);
    const accepted = valid.slice(0, available);
    const newItems = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      return { id: ++nextId.current, file, url, name: humanFileName(file.name), ...DEFAULTS, featured: false };
    });
    setItems((current) => [...current, ...newItems]);
    setSelected((current) => [...current, ...newItems.map((item) => item.id)]);
    if (newItems.length) {
      setActiveId((id) => id ?? newItems[0].id);
      setStep('edit');
      setOnlyIssues(false);
      setNotice(`${newItems.length} image${newItems.length === 1 ? '' : 's'} added and selected.`);
    }
    const skipped = incoming.length - accepted.length;
    setError(skipped ? `${skipped} file(s) skipped. Only JPG, PNG and WebP under 5 MB are supported; maximum ${MAX_FILES} images per batch.` : '');
    if (inputRef.current) inputRef.current.value = '';
  };

  const update = (id, patch) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    setNotice('');
  };
  const remove = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelected((current) => current.filter((candidate) => candidate !== id));
    setActiveId((idNow) => idNow === id ? (itemsRef.current.find((item) => item.id !== id)?.id ?? null) : idNow);
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (item) { URL.revokeObjectURL(item.url); urlsRef.current.delete(item.url); }
    setError('');
  };
  const toggleSelect = (id) => setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const toggleField = (field) => setApplyFields((current) => current.includes(field) ? current.filter((x) => x !== field) : [...current, field]);
  const applyBulk = () => {
    const ids = new Set(bulkTarget === 'all' ? items.map((item) => item.id) : selected);
    if (!ids.size || !applyFields.length) return;
    const patch = Object.fromEntries(applyFields.map((field) => [field, bulk[field]]));
    setItems((current) => current.map((item) => ids.has(item.id) ? { ...item, ...patch } : item));
    setNotice(`Updated ${ids.size} product${ids.size === 1 ? '' : 's'} (${applyFields.join(', ')}).`);
    setError('');
    setShowBulk(false);
  };
  const featuredCount = items.filter((item) => item.featured).length;
  const invalidCount = items.filter((item) => !validItem(item)).length;
  const readyCount = items.length - invalidCount;
  const active = items.find((item) => item.id === activeId) || items[0];
  const visible = useMemo(() => items.filter((item) => {
    if (onlyIssues && validItem(item)) return false;
    return (item.name + ' ' + item.file.name).toLowerCase().includes(query.trim().toLowerCase());
  }), [items, onlyIssues, query]);

  const submit = () => {
    if (busy || !items.length || invalidCount || featuredCount > featuredSlots) return;
    setBusy(true);
    try {
      const jobs = items.map(({ file, name, category, gemstone, metal, description, price, available, featured }) => ({
        file,
        payload: {
          name: name.trim(), category, gemstone, metal, description: description.trim(),
          price: Number(price), available, featured,
        },
      }));
      onPublish(jobs);
      onClose();
    } catch (err) {
      setError(err?.message || 'Unable to add products to the upload queue.');
      setBusy(false);
    }
  };

  return (
    <div className="lbatch-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}>
      <section className="lbatch-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="lbatch-title" data-lenis-prevent>
        <header className="lbatch-header">
          <div><span className="lbatch-kicker">LUSTRIA · PRODUCT MANAGEMENT</span><h2 id="lbatch-title">Batch upload</h2><p>Prepare products together. Review details before publishing.</p></div>
          <button type="button" className="lbatch-close" onClick={requestClose} aria-label="Close batch uploader">×</button>
        </header>

        <div className="lbatch-progress" aria-label="Batch workflow">
          <button type="button" className={step === 'edit' ? 'is-active' : ''} onClick={() => setStep('edit')}><span>1</span> Prepare products</button>
          <span className="lbatch-progress-line" aria-hidden="true" />
          <button type="button" className={step === 'review' ? 'is-active' : ''} onClick={() => { setStep('review'); setError(''); }} disabled={!items.length}><span>2</span> Review & publish</button>
          <div className="lbatch-progress-count">{items.length}/{MAX_FILES} images</div>
        </div>

        <div className="lbatch-body" data-lenis-prevent>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          {step === 'edit' ? (
            <>
              <div className={`lbatch-dropzone ${dragging ? 'is-dragging' : ''}`} onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}>
                <div className="lbatch-drop-symbol" aria-hidden="true">↥</div>
                <div><strong>Drop jewellery photos here</strong><p>JPG, PNG or WebP · Max 5 MB each · Up to 50 products</p></div>
                <button type="button" className="lbatch-primary-light" onClick={() => inputRef.current?.click()}>+ Add images</button>
              </div>

              {items.length > 0 && (
                <>
                  <div className="lbatch-toolbar">
                    <div className="lbatch-metrics"><strong>{items.length} products</strong><span>{readyCount} ready</span>{invalidCount > 0 && <span className="is-warning">{invalidCount} need attention</span>}</div>
                    <div className="lbatch-toolbar-actions">
                      <button type="button" className="lbatch-outline" onClick={() => setShowBulk((value) => !value)} aria-expanded={showBulk}>Bulk edit {showBulk ? '−' : '+'}</button>
                      <button type="button" className="lbatch-outline" onClick={() => inputRef.current?.click()}>Add more</button>
                    </div>
                  </div>

                  {showBulk && (
                    <section className="lbatch-bulk">
                      <div className="lbatch-section-title"><div><h3>Bulk edit</h3><p>Only checked fields will be applied. Your other product details stay intact.</p></div><button type="button" className="lbatch-close lbatch-small-close" onClick={() => setShowBulk(false)} aria-label="Hide bulk edit">×</button></div>
                      <div className="lbatch-bulk-target" role="group" aria-label="Bulk edit scope">
                        <label><input type="radio" checked={bulkTarget === 'selected'} onChange={() => setBulkTarget('selected')} /> Selected ({selected.length})</label>
                        <label><input type="radio" checked={bulkTarget === 'all'} onChange={() => setBulkTarget('all')} /> All products ({items.length})</label>
                      </div>
                      <div className="lbatch-bulk-grid">
                        <BulkField field="category" title="Category" checked={applyFields.includes('category')} onToggle={toggleField}><select value={bulk.category} onChange={(e) => setBulk({ ...bulk, category: e.target.value })}>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></BulkField>
                        <BulkField field="gemstone" title="Gemstone" checked={applyFields.includes('gemstone')} onToggle={toggleField}><select value={bulk.gemstone} onChange={(e) => setBulk({ ...bulk, gemstone: e.target.value })}>{GEMSTONES.map((v) => <option key={v}>{v}</option>)}</select></BulkField>
                        <BulkField field="metal" title="Metal" checked={applyFields.includes('metal')} onToggle={toggleField}><select value={bulk.metal} onChange={(e) => setBulk({ ...bulk, metal: e.target.value })}>{METALS.map((v) => <option key={v} value={v}>{v}</option>)}</select></BulkField>
                        <BulkField field="price" title="Price (LKR)" checked={applyFields.includes('price')} onToggle={toggleField}><input type="number" min="0" step="0.01" placeholder="Price for selected items" value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} /></BulkField>
                        <BulkField field="description" title="Description" checked={applyFields.includes('description')} onToggle={toggleField} wide><textarea rows={2} value={bulk.description} placeholder="Common product description" onChange={(e) => setBulk({ ...bulk, description: e.target.value })} /></BulkField>
                        <BulkField field="available" title="Availability" checked={applyFields.includes('available')} onToggle={toggleField}><select value={String(bulk.available)} onChange={(e) => setBulk({ ...bulk, available: e.target.value === 'true' })}><option value="true">Available</option><option value="false">Unavailable</option></select></BulkField>
                      </div>
                      <div className="lbatch-bulk-actions"><span>{applyFields.length} fields chosen</span><button className="lbatch-dark" type="button" onClick={applyBulk} disabled={!applyFields.length || (bulkTarget === 'selected' && !selected.length)}>Apply to {bulkTarget === 'all' ? items.length : selected.length} products</button></div>
                    </section>
                  )}

                  <div className="lbatch-workbench">
                    <div className="lbatch-product-list">
                      <div className="lbatch-list-top"><strong>Products</strong><span>{selected.length} selected</span></div>
                      <div className="lbatch-list-controls"><input type="search" aria-label="Search products" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} /><label className="lbatch-checkbox-inline"><input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} /> Needs attention</label></div>
                      <div className="lbatch-selection-bar"><button type="button" onClick={() => setSelected(items.map((item) => item.id))}>Select all</button><button type="button" onClick={() => setSelected([])}>Clear</button></div>
                      <div className="lbatch-product-rows">
                        {visible.length === 0 && <p className="lbatch-noresults">No matching products.</p>}
                        {visible.map((item, index) => (
                          <div key={item.id} className={`lbatch-product-row ${active?.id === item.id ? 'is-current' : ''}`}>
                            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} aria-label={`Select ${item.name || item.file.name}`} />
                            <button type="button" className="lbatch-row-button" onClick={() => setActiveId(item.id)} aria-current={active?.id === item.id ? 'true' : undefined}>
                              <img src={item.url} alt="" /><span className="lbatch-row-info"><strong title={item.name}>{item.name || 'Untitled product'}</strong><small>{validItem(item) ? (item.available ? 'Ready · Available' : 'Ready · Unavailable') : 'Needs name / price'}</small></span>
                              <span className={`lbatch-status-dot ${validItem(item) ? 'is-ok' : 'is-bad'}`} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lbatch-detail-editor" ref={editorRef}>
                      {active && (
                        <>
                          <div className="lbatch-detail-header"><div><span className="lbatch-kicker">EDIT PRODUCT</span><h3>{active.name || 'Untitled product'}</h3><p title={active.file.name}>{active.file.name}</p></div><button type="button" className="lbatch-remove" onClick={() => remove(active.id)}>Remove</button></div>
                          <div className="lbatch-detail-overview"><img src={active.url} alt={`Preview of ${active.name}`} /><div><strong>Image ready</strong><span>{(active.file.size / 1024 / 1024).toFixed(2)} MB · {active.file.type.replace('image/', '').toUpperCase()}</span><span>{items.findIndex((item) => item.id === active.id) + 1} of {items.length}</span></div></div>
                          <div className="lbatch-item-grid">
                            <label className="lbatch-full">Product name <input aria-label="Product name" value={active.name} className={!active.name.trim() ? 'is-invalid' : ''} onChange={(e) => update(active.id, { name: e.target.value })} placeholder="e.g. Blue Sapphire Silver Ring" /></label>
                            <label>Price (LKR) <input type="number" min="0" step="0.01" className={active.price === '' || !Number.isFinite(Number(active.price)) || Number(active.price) < 0 ? 'is-invalid' : ''} value={active.price} placeholder="Required" onChange={(e) => update(active.id, { price: e.target.value })} /></label>
                            <label>Category <select value={active.category} onChange={(e) => update(active.id, { category: e.target.value })}>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></label>
                            <label>Gemstone <select value={active.gemstone} onChange={(e) => update(active.id, { gemstone: e.target.value })}>{GEMSTONES.map((v) => <option key={v}>{v}</option>)}</select></label>
                            <label>Metal <select value={active.metal} onChange={(e) => update(active.id, { metal: e.target.value })}>{METALS.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
                            <label className="lbatch-full">Description <textarea rows={3} value={active.description} onChange={(e) => update(active.id, { description: e.target.value })} placeholder="Materials, gemstone, design and other useful product details…" /></label>
                          </div>
                          <div className="lbatch-flags"><label><input type="checkbox" checked={active.available} onChange={(e) => update(active.id, { available: e.target.checked })} /> Available</label><label><input type="checkbox" checked={active.featured} disabled={!active.featured && featuredCount >= featuredSlots} onChange={(e) => update(active.id, { featured: e.target.checked })} /> Featured <small>({featuredCount}/{featuredSlots} slots)</small></label></div>
                          <div className="lbatch-editor-nav"><button className="lbatch-outline" type="button" disabled={items.findIndex((item) => item.id === active.id) === 0} onClick={() => setActiveId(items[items.findIndex((item) => item.id === active.id) - 1].id)}>← Previous</button><button className="lbatch-outline" type="button" disabled={items.findIndex((item) => item.id === active.id) === items.length - 1} onClick={() => setActiveId(items[items.findIndex((item) => item.id === active.id) + 1].id)}>Next →</button></div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              {!items.length && <div className="lbatch-empty"><strong>Start with your jewellery photographs</strong><p>You'll be able to rename products, edit them individually, and apply shared details to several products at once.</p></div>}
            </>
          ) : (
            <div className="lbatch-review">
              <div className="lbatch-review-title"><div><span className="lbatch-kicker">FINAL CHECK</span><h3>Review your products</h3><p>Check names, prices and images before adding them to the upload queue.</p></div><button type="button" className="lbatch-outline" onClick={() => setStep('edit')}>← Back to editing</button></div>
              <div className="lbatch-review-stats"><div><strong>{items.length}</strong><span>Total products</span></div><div><strong>{readyCount}</strong><span>Ready to upload</span></div><div className={invalidCount ? 'is-warning' : ''}><strong>{invalidCount}</strong><span>Need attention</span></div><div><strong>{featuredCount}/{featuredSlots}</strong><span>Featured slots</span></div></div>
              {(invalidCount > 0 || featuredCount > featuredSlots) && <div className="lbatch-review-warning" role="alert">{invalidCount > 0 ? `${invalidCount} product(s) are missing a valid name or price. ` : ''}{featuredCount > featuredSlots ? 'Featured selection exceeds available slots.' : ''} Fix the highlighted products before publishing.</div>}
              <div className="lbatch-review-list">{items.map((item) => <div key={item.id} className="lbatch-review-item"><img src={item.url} alt="" /><div><strong>{item.name || 'Untitled product'}</strong><span>{item.category} · {item.gemstone} · {item.available ? 'Available' : 'Unavailable'}{item.featured ? ' · Featured' : ''}</span></div><strong className="lbatch-review-price">{item.price !== '' && Number.isFinite(Number(item.price)) && Number(item.price) >= 0 ? `LKR ${Number(item.price).toLocaleString()}` : 'Price missing'}</strong><button type="button" className="lbatch-outline" onClick={() => { setActiveId(item.id); setStep('edit'); }}>Edit</button><span className={`lbatch-review-indicator ${validItem(item) ? 'is-ok' : 'is-bad'}`}>{validItem(item) ? 'Ready' : 'Fix required'}</span></div>)}</div>
              <p className="lbatch-review-note">Publishing queues all products together. Convex saves each product individually in the background; this is not an atomic transaction. Keep this admin tab open until uploads finish.</p>
            </div>
          )}
          {notice && !error && <p className="lbatch-notice" role="status">{notice}</p>}
          {error && <p className="lbatch-error" role="alert">{error}</p>}
        </div>
        <footer className="lbatch-footer"><div className="lbatch-footer-status"><strong>{readyCount} of {items.length} ready</strong><span>{featuredCount} Featured · {featuredSlots} slots available</span></div><div className="lbatch-footer-actions"><button type="button" className="lbatch-outline" onClick={requestClose}>Cancel</button>{step === 'edit' ? <button type="button" className="lbatch-dark" disabled={!items.length} onClick={() => { setStep('review'); setError(''); }}>Review {items.length} products →</button> : <button type="button" className="lbatch-dark" disabled={!items.length || invalidCount > 0 || featuredCount > featuredSlots || busy} onClick={submit}>{busy ? 'Adding to queue…' : `Publish ${items.length} products`}</button>}</div></footer>
      </section>
    </div>
  );
}

function BulkField({ field, title, checked, onToggle, wide = false, children }) {
  return <div className={`lbatch-bulk-field ${wide ? 'is-wide' : ''}`}><label className="lbatch-bulk-check"><input type="checkbox" checked={checked} onChange={() => onToggle(field)} /> {title}</label><div className={!checked ? 'is-muted' : ''}>{children}</div></div>;
}
