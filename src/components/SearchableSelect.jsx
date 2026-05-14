import { useEffect, useMemo, useRef, useState } from 'react';

const normalize = (s) =>
  String(s).toLowerCase().replace(/[\s.\-_]/g, '');

/**
 * SearchableSelect — dropdown con búsqueda por escritura.
 *
 * Props:
 *   value       string              — valor seleccionado actualmente
 *   onChange    fn(value: string)   — callback al seleccionar
 *   options     string[] | { value: string, label: string }[]
 *   placeholder string
 *   size        'sm' | ''
 */
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  size = 'sm',
}) => {
  // Normaliza options siempre a [{ value, label }]
  const normalized = useMemo(() =>
    options.map(o =>
      typeof o === 'object' && o !== null
        ? { value: String(o.value), label: String(o.label) }
        : { value: String(o), label: String(o) }
    ), [options]);

  const labelOf = (val) =>
    normalized.find(o => o.value === val)?.label ?? val ?? '';

  const [text, setText] = useState(labelOf(value));
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Sincroniza si el valor cambia externamente
  useEffect(() => { setText(labelOf(value)); }, [value, normalized]);

  // Cierra al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!text) return normalized;
    const q = normalize(text);
    return normalized.filter(o =>
      normalize(o.label).includes(q) ||
      o.label.toLowerCase().includes(text.toLowerCase())
    );
  }, [normalized, text]);

  const select = (opt) => { onChange(opt.value); setText(opt.label); setOpen(false); };
  const clear  = ()    => { onChange('');        setText('');        setOpen(false); };

  const inputClass = size === 'sm' ? 'form-control form-control-sm' : 'form-control';
  const btnClass   = size === 'sm' ? 'btn btn-outline-secondary btn-sm px-2' : 'btn btn-outline-secondary px-2';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="input-group input-group-sm">
        <input
          className={inputClass}
          placeholder={placeholder}
          value={text}
          autoComplete="off"
          onChange={e => {
            setText(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setOpen(true)}
        />
        {text && (
          <button className={btnClass} type="button" onClick={clear} tabIndex={-1}>
            ×
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul style={{
          position:     'absolute',
          top:          '100%',
          left:         0,
          right:        0,
          zIndex:       1055,
          maxHeight:    220,
          overflowY:    'auto',
          margin:       0,
          padding:      0,
          listStyle:    'none',
          background:   '#fff',
          border:       '1px solid #dee2e6',
          borderRadius: '0 0 6px 6px',
          boxShadow:    '0 6px 16px rgba(0,0,0,.10)',
        }}>
          {/* Opción "Todos" */}
          <li
            onMouseDown={clear}
            style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem',
              color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            — Todos —
          </li>

          {filtered.map((o, i) => (
            <li
              key={`${o.value}-${i}`}
              onMouseDown={() => select(o)}
              style={{
                padding:    '6px 10px',
                cursor:     'pointer',
                fontSize:   '0.82rem',
                background: o.value === value ? '#e8f0fe' : undefined,
                fontWeight: o.value === value ? 600 : undefined,
              }}
              onMouseEnter={e => e.currentTarget.style.background = o.value === value ? '#dbe6fd' : '#f5f7ff'}
              onMouseLeave={e => e.currentTarget.style.background = o.value === value ? '#e8f0fe' : ''}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
