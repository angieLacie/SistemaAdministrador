import { useState, useEffect } from 'react';
import { Row, Col, Form, Spinner, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaChevronDown, FaChevronRight, FaShield, FaCheck, FaXmark } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { accesosPerfilService, perfilesService, sistemasService } from '@/services/seguridad.service';
import { usePermisos } from '@/hooks/usePermisos';

const GestionUsuarios = () => {
  const { puedeInsertar, puedeEliminar } = usePermisos();

  return (
    <>
      {puedeInsertar && (
        <Button onClick={() => setShowModal(true)}>
          Nuevo usuario
        </Button>
      )}
    </>
  );
};

const PERMISOS = [
  { key: 'i', label: 'I', title: 'Insertar' },
  { key: 'm', label: 'M', title: 'Modificar' },
  { key: 'g', label: 'G', title: 'Grabar' },
  { key: 'c', label: 'C', title: 'Consultar' },
  { key: 'e', label: 'E', title: 'Eliminar' },
  { key: 'r', label: 'R', title: 'Reportes' },
  { key: 'b', label: 'B', title: 'Buscar' },
  { key: 'p', label: 'P', title: 'Imprimir' },
];

const PermisoBtn = ({ activo, disponible, titulo, onClick }) => {
  if (!disponible) return null;
  return (
    <button
      title={titulo}
      onClick={onClick}
      className={`btn btn-sm ${activo ? 'btn-success' : 'btn-outline-secondary'}`}
      style={{ width: 28, height: 28, padding: 0, fontSize: 10, fontWeight: 'bold' }}>
      {activo ? <FaCheck size={10} /> : titulo[0]}
    </button>
  );
};

const FuncionRow = ({ funcion, perfilId, onUpdate }) => {
const [saving, setSaving] = useState(false);
const [asignado, setAsignado] = useState(funcion.asignado);
const [acceso, setAcceso] = useState(funcion.acceso);

const toggleAsignado = async () => {
  try {
    setSaving(true);
    if (asignado) {
      await accesosPerfilService.quitar(funcion.opcionId, funcion.moduloId, funcion.funcionId, perfilId);
      setAsignado(false);  // ← actualizar local
      setAcceso(null);     // ← limpiar acceso
      toast.success('Acceso removido');
    } else {
      await accesosPerfilService.asignar({
        opcionId:  funcion.opcionId,
        moduloId:  funcion.moduloId,
        funcionId: funcion.funcionId,
        perfil:    perfilId,
        estado:    'A',
        i: funcion.io, m: funcion.mo, g: funcion.go, c: funcion.co,
        e: funcion.eo, r: funcion.ro, b: funcion.bo, p: funcion.po,
      });
      setAsignado(true);   // ← actualizar local
      toast.success('Acceso asignado');
    }
  } catch (err) { toast.error(err.message); }
  finally { setSaving(false); }
};

  const togglePermiso = async (permisoKey) => {
    if (!asignado) return;
    try {
      setSaving(true);
      const payload = {
        opcionId:  funcion.opcionId,
        moduloId:  funcion.moduloId,
        funcionId: funcion.funcionId,
        perfil:    perfilId,
        i: acceso?.i, m: acceso?.m, g: acceso?.g, c: acceso?.c,
        e: acceso?.e, r: acceso?.r, b: acceso?.b, p: acceso?.p,
        op1: acceso?.op1, op2: acceso?.op2, op3: acceso?.op3, op4: acceso?.op4, op5: acceso?.op5,
        op6: acceso?.op6, op7: acceso?.op7, op8: acceso?.op8, op9: acceso?.op9, op10: acceso?.op10,
        [permisoKey]: acceso?.[permisoKey] ? 0 : 1,
      };
      await accesosPerfilService.actualizarPermisos(payload);
      onUpdate();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // Opciones adicionales activas
  const opcionesAdicionales = [];
  for (let i = 1; i <= 10; i++) {
    const key = `op${i}`;
    const nombre = funcion[`nombre${String(i).padStart(2, '0')}`];
    if (funcion[`op${i}`]) {
      opcionesAdicionales.push({ key, nombre: nombre || `OP${i}` });
    }
  }

  return (
    <tr style={{ background: asignado ? '#f0fdf4' : '#fff' }}>
      <td style={{ paddingLeft: 32, fontSize: 12 }}>
        <div className="d-flex align-items-center gap-2">
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox"
              checked={asignado} onChange={toggleAsignado} disabled={saving}
              style={{ cursor: 'pointer' }}/>
          </div>
          <span className={asignado ? 'fw-semibold' : 'text-muted'}>{funcion.descripcion}</span>
          <Badge bg="light" text="dark" style={{ fontSize: 9, border: '1px solid #e5e7eb' }}>
            {funcion.funcionId}
          </Badge>
        </div>
      </td>
      <td>
        {asignado && (
          <div className="d-flex gap-1 flex-wrap">
            {PERMISOS.map(p => (
              funcion[`${p.key}O`] ? (
                <PermisoBtn key={p.key}
                  activo={!!acceso?.[p.key]}
                  disponible={!!funcion[`${p.key}O`]}
                  titulo={p.title}
                  onClick={() => togglePermiso(p.key)}
                />
              ) : null
            ))}
            {opcionesAdicionales.map(op => (
              <PermisoBtn key={op.key}
                activo={!!acceso?.[op.key]}
                disponible={true}
                titulo={op.nombre}
                onClick={() => togglePermiso(op.key)}
              />
            ))}
          </div>
        )}
      </td>
    </tr>
  );
};

const OpcionSection = ({ opcion, perfilId, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const tieneAsignados = opcion.funciones?.some(f => f.asignado);

  return (
    <>
      <tr style={{ background: '#f9fafb', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <td colSpan={2} style={{ paddingLeft: 16 }}>
          <div className="d-flex align-items-center gap-2">
            {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
            <span className="fw-semibold" style={{ fontSize: 12, color: '#374151' }}>
              {opcion.descripcion}
            </span>
            <Badge bg="light" text="dark" style={{ fontSize: 9, border: '1px solid #e5e7eb' }}>
              {opcion.opcionId}
            </Badge>
            {tieneAsignados && <Badge bg="success" style={{ fontSize: 9 }}>Activo</Badge>}
          </div>
        </td>
      </tr>
      {expanded && opcion.funciones?.map(f => (
        <FuncionRow key={f.funcionId} funcion={{ ...f, opcionId: opcion.opcionId, moduloId: opcion.moduloId }}
          perfilId={perfilId} onUpdate={onUpdate} />
      ))}
    </>
  );
};

const ModuloSection = ({ modulo, perfilId, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const tieneAsignados = modulo.opciones?.some(o => o.funciones?.some(f => f.asignado));

  return (
    <div className="card mb-2 border-0 shadow-sm">
      <div className="card-header py-2 d-flex align-items-center justify-content-between"
        style={{ background: '#eff6ff', cursor: 'pointer', borderBottom: '1px solid #bfdbfe' }}
        onClick={() => setExpanded(!expanded)}>
        <div className="d-flex align-items-center gap-2">
          {expanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          {modulo.icono && (
  <i className={modulo.icono} style={{ fontSize: 14, color: '#185FA5' }}></i>
)}
          <span className="fw-semibold" style={{ color: '#1e40af' }}>{modulo.descripcion}</span>
          <Badge bg="light" text="dark" style={{ fontSize: 9, border: '1px solid #bfdbfe', color: '#1e40af' }}>
            {modulo.moduloId}
          </Badge>
          {tieneAsignados && <Badge bg="primary" style={{ fontSize: 9 }}>Con accesos</Badge>}
        </div>
        <small className="text-muted" style={{ fontSize: 10 }}>
          {modulo.opciones?.length} opciones
        </small>
      </div>
      {expanded && (
        <div className="card-body p-0">
          <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '50%' }}>Opción / Función</th>
                <th>Permisos</th>
              </tr>
            </thead>
            <tbody>
              {modulo.opciones?.map(o => (
                <OpcionSection key={o.opcionId} opcion={{ ...o, moduloId: modulo.moduloId }}
                  perfilId={perfilId} onUpdate={onUpdate} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
 
const AccesosPerfil = () => {
const [perfiles, setPerfiles]             = useState([]);
const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
const [arbol, setArbol]                   = useState([]);
const [loading, setLoading]               = useState(false);
const [searchPerfil, setSearchPerfil] = useState('');
const [filterSistema, setFilterSistema] = useState('');
const [sistemas, setSistemas] = useState([]);

  
useEffect(() => {
Promise.all([
    perfilesService.listar({ estado: 'A' }),
    sistemasService.listar('A'),
]).then(([p, s]) => {
    setPerfiles(p);
    setSistemas(s);
}).catch(err => toast.error(err.message));
}, []);


  const cargarAccesos = async (perfilId) => {
    if (!perfilId) { setArbol([]); return; }
    try {
      setLoading(true);
      const data = await accesosPerfilService.getByPerfil(perfilId);
      setArbol(data);
    } catch (err) {
      toast.error('Error al cargar accesos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePerfilChange = (e) => {
    setPerfilSeleccionado(e.target.value);
    cargarAccesos(e.target.value);
  };

  const perfilActual = perfiles.find(p => p.perfilId === parseInt(perfilSeleccionado));

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Accesos por Perfil"
        subTitle1="Seguridad"
        subTitle2="Accesos"
        subText="Configuración de accesos y permisos por perfil."
      />

      <div className="main-content">

        {/* Selector perfil */}
        <Row className="mb-4 align-items-center">
          <Col md={4}>
                <Form.Label className="fw-semibold small">Buscar perfil</Form.Label>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="Escribir nombre del perfil..."
                    value={searchPerfil}
                    onChange={e => setSearchPerfil(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                        const found = perfiles.find(p => p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase()));
                        if (found) { setPerfilSeleccionado(String(found.perfilId)); cargarAccesos(found.perfilId); }
                        else toast.warning('Perfil no encontrado');
                        }
                    }}
                    />
                    {perfilSeleccionado && (
                    <button className="btn btn-outline-secondary" onClick={() => {
                        setPerfilSeleccionado(''); setSearchPerfil(''); setArbol([]); setFilterSistema('');
                    }}>✕</button>
                    )}
                </div>
                {/* Sugerencias */}
                {searchPerfil && !perfilSeleccionado && (
                    <div className="border rounded mt-1" style={{ maxHeight: 180, overflowY: 'auto', position: 'absolute', zIndex: 100, background: 'white', width: '100%' }}>
                    {perfiles.filter(p => p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase())).map(p => (
                        <div key={p.perfilId} className="px-3 py-2" style={{ cursor: 'pointer', fontSize: 13 }}
                        onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.target.style.background = 'white'}
                        onClick={() => { setSearchPerfil(p.descripcion); setPerfilSeleccionado(String(p.perfilId)); cargarAccesos(p.perfilId); }}>
                        {p.descripcion} <span className="text-muted" style={{ fontSize: 11 }}>ID: {p.perfilId}</span>
                        </div>
                    ))}
                    </div>
                )}
                </Col>

                {/* Filtro por sistema */}
                {perfilSeleccionado && (
                <Col md={3}>
                    <Form.Label className="fw-semibold small">Filtrar por sistema</Form.Label>
                    <Form.Select size="sm" value={filterSistema} onChange={e => setFilterSistema(e.target.value)}>
                    <option value="">Todos los sistemas</option>
                    {sistemas.map(s => <option key={s.sistemaId} value={s.sistemaId}>{s.nombre}</option>)}
                    </Form.Select>
                </Col>
                )}
          {perfilActual && (
            <Col md={4} className="mt-3">
              <div className="d-flex align-items-center gap-2">
                <FaShield size={16} style={{ color: '#185FA5' }} />
                <span className="fw-semibold" style={{ color: '#185FA5' }}>{perfilActual.descripcion}</span>
                <Badge bg="light" text="dark" style={{ border: '1px solid #bfdbfe', color: '#6b7280', fontSize: 10 }}>
                ID: {perfilActual.perfilId}
                </Badge>
              </div>
            </Col>
          )}
        </Row>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : !perfilSeleccionado ? (
          <div className="text-center py-5">
            <FaShield size={48} className="text-muted mb-3" />
            <p className="text-muted">Selecciona un perfil para configurar sus accesos.</p>
          </div>
        ) : arbol.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No hay sistemas configurados.</p>
          </div>
        ) : (
          arbol
            .filter(s => !filterSistema || s.sistemaId === filterSistema)
            .map(sistema => ( 
            <div key={sistema.sistemaId} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2 pb-2"
                style={{ borderBottom: '2px solid #185FA5' }}>
                <span className="fw-bold text-uppercase" style={{ color: '#185FA5', fontSize: 13 }}>
                  {sistema.nombre}
                </span>
                <Badge bg="light" text="dark" style={{ border: '1px solid #bfdbfe', color: '#185FA5', fontSize: 10 }}>
                  {sistema.sistemaId}
                </Badge>
                {sistema.tipoSistema && (
                  <Badge bg="secondary" style={{ fontSize: 9 }}>{sistema.tipoSistema}</Badge>
                )}
              </div>
              {sistema.modulos?.map(m => (
                <ModuloSection key={m.moduloId} modulo={m}
                  perfilId={parseInt(perfilSeleccionado)}
                  onUpdate={() => cargarAccesos(perfilSeleccionado)} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccesosPerfil;