/**
 * Paginacion — navegación «‹ 1 2 3 ›» siempre visible cuando hay datos
 *
 * Props:
 *   page        number   — página actual (0-indexed)
 *   totalPages  number   — total de páginas
 *   total       number   — total de registros
 *   pageSize    number   — registros por página
 *   onPage      fn(n)    — callback al cambiar página
 *   entidad     string   — nombre del recurso (ej. "tiendas", "indicadores")
 */
const Paginacion = ({ page, totalPages, total, pageSize, onPage, entidad = 'registros' }) => {
  if (total === 0) return null;

  const desde = page * pageSize + 1;
  const hasta  = Math.min((page + 1) * pageSize, total);

  const btnBase = (disabled) => ({
    padding: '5px 10px', borderRadius: 6,
    border: '1px solid #e5e7eb', background: 'white',
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? '#d1d5db' : '#374151',
    fontSize: 12,
  });

  const pages = Array.from({ length: totalPages }, (_, i) => i)
    .filter(i => Math.abs(i - page) <= 2);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>
        Mostrando {desde}–{hasta} de {total} {entidad}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPage(0)} disabled={page === 0} style={btnBase(page === 0)}>«</button>
        <button onClick={() => onPage(page - 1)} disabled={page === 0} style={btnBase(page === 0)}>‹</button>

        {pages.map(i => (
          <button key={i} onClick={() => onPage(i)} style={{
            padding: '5px 11px', borderRadius: 6,
            border: '1px solid', cursor: 'pointer', fontSize: 12,
            borderColor: i === page ? '#185FA5' : '#e5e7eb',
            background:  i === page ? '#185FA5' : 'white',
            color:       i === page ? 'white'   : '#374151',
            fontWeight:  i === page ? 700       : 400,
          }}>
            {i + 1}
          </button>
        ))}

        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1} style={btnBase(page >= totalPages - 1)}>›</button>
        <button onClick={() => onPage(totalPages - 1)} disabled={page >= totalPages - 1} style={btnBase(page >= totalPages - 1)}>»</button>
      </div>
    </div>
  );
};

export default Paginacion;
