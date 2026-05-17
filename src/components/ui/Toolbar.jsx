import { Row, Col } from 'react-bootstrap';
import { FaXmark } from 'react-icons/fa6';

/**
 * Toolbar — barra de búsqueda + filtros + acciones
 *
 * Props:
 *   buscar       string     — valor del input de búsqueda
 *   onBuscar     fn(str)    — callback al escribir
 *   placeholder  string     — placeholder del input
 *   filters      ReactNode  — filtros adicionales (SearchableSelect, etc.)
 *   actions      ReactNode  — botones derechos (Nuevo, Excel, toggle vista...)
 */
const Toolbar = ({ buscar, onBuscar, placeholder = 'Buscar...', filters, actions }) => (
  <div className="card border-0 shadow-sm mb-3">
    <div className="card-body py-2 px-3">
      <Row className="g-2 align-items-center">

        {/* Búsqueda */}
        <Col xs={12} md={4}>
          <div style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14,
            }} />
            <input
              type="text"
              value={buscar}
              onChange={e => onBuscar(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', padding: '7px 36px 7px 32px',
                border: '1.5px solid #dde1e7', borderRadius: 8,
                fontSize: 13, outline: 'none', background: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#185FA5'}
              onBlur={e  => e.target.style.borderColor = '#dde1e7'}
            />
            {buscar && (
              <button
                onClick={() => onBuscar('')}
                style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#9ca3af',
                  padding: 2, display: 'flex',
                }}
              >
                <FaXmark size={12} />
              </button>
            )}
          </div>
        </Col>

        {/* Filtros adicionales */}
        {filters}

        {/* Acciones (derecha) */}
        {actions && (
          <Col xs="auto" className="ms-auto">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {actions}
            </div>
          </Col>
        )}

      </Row>
    </div>
  </div>
);

export default Toolbar;
