import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Badge, Form, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaStore } from 'react-icons/fa6';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { perfilTiendaService, perfilesService } from '@/services/seguridad.service';

const GestionPerfilTienda = () => {
  const [perfiles, setPerfiles]           = useState([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
  const [tiendas, setTiendas]             = useState([]);
  const [tiendasDisponibles, setTiendasDisponibles] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadingTiendas, setLoadingTiendas] = useState(false);
  const [searchTienda, setSearchTienda]   = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [searchDisponible, setSearchDisponible] = useState('');
  const [saving, setSaving]               = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [searchPerfil, setSearchPerfil] = useState('');

  useEffect(() => {
    const cargarPerfiles = async () => {
      try {
        const lista = await perfilesService.listar({ estado: 'A' });
        setPerfiles(lista);
      } catch (err) {
        toast.error('Error al cargar perfiles: ' + err.message);
      }
    };
    cargarPerfiles();
  }, []);

  useEffect(() => {
    if (!perfilSeleccionado) { setTiendas([]); setUsuarios([]); return; }
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [lista, listaUsuarios] = await Promise.all([
          perfilTiendaService.listarPorPerfil(perfilSeleccionado),
          perfilTiendaService.usuariosPerfil(perfilSeleccionado),
        ]);
        setTiendas(lista);
        setUsuarios(listaUsuarios);
      } catch (err) {
        toast.error('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [perfilSeleccionado]);


  const openModal = async () => {
    try {
      setLoadingTiendas(true);
      setShowModal(true);
      const lista = await perfilTiendaService.tiendasDisponibles(perfilSeleccionado);
      setTiendasDisponibles(lista.filter(t => !t.asignada));
    } catch (err) {
      toast.error('Error al cargar tiendas disponibles: ' + err.message);
    } finally {
      setLoadingTiendas(false);
    }
  };

  const handleAsignar = async (tiendaId) => {
    try {
      setSaving(true);
      await perfilTiendaService.asignar({
        perfil:  parseInt(perfilSeleccionado),
        tienda:  tiendaId,
        usuarioCreacion: 'ADMIN',
      });
      toast.success(`Tienda ${tiendaId} asignada correctamente`);
      const [lista, disponibles] = await Promise.all([
        perfilTiendaService.listarPorPerfil(perfilSeleccionado),
        perfilTiendaService.tiendasDisponibles(perfilSeleccionado),
      ]);
      setTiendas(lista);
      setTiendasDisponibles(disponibles.filter(t => !t.asignada));
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDesasignar = async (id, tiendaId) => {
    try {
      await perfilTiendaService.desasignar(id);
      toast.success(`Tienda ${tiendaId} desasignada correctamente`);
      const lista = await perfilTiendaService.listarPorPerfil(perfilSeleccionado);
      setTiendas(lista);
    } catch (err) { toast.error(err.message); }
  };

  // Filtros
  const tiendasFiltradas = useMemo(() => {
    if (!searchTienda) return tiendas;
    const s = searchTienda.toLowerCase();
    return tiendas.filter(t =>
      t.tienda.toLowerCase().includes(s) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(s))
    );
  }, [tiendas, searchTienda]);

  const disponiblesFiltradas = useMemo(() => {
    if (!searchDisponible) return tiendasDisponibles;
    const s = searchDisponible.toLowerCase();
    return tiendasDisponibles.filter(t =>
      t.tiendaId.toLowerCase().includes(s) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(s))
    );
  }, [tiendasDisponibles, searchDisponible]);

  const perfilActual = perfiles.find(p => p.perfilId === parseInt(perfilSeleccionado));

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Perfil — Tiendas"
        subTitle1="Seguridad"
        subTitle2="Perfil Tiendas"
        subText="Gestión de tiendas asignadas por perfil."
      />

      <div className="main-content">

        {/* Selector de perfil */}
        <Row className="mb-4">
          
            <Col md={4}>
              <Form.Label className="fw-semibold small">Buscar perfil</Form.Label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Escribir nombre del perfil..."
                  value={searchPerfil}
                  onChange={e => setSearchPerfil(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const found = perfiles.find(p => 
                        p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase())
                      );
                      if (found) {
                        setSearchPerfil(found.descripcion);
                        setPerfilSeleccionado(String(found.perfilId));
                      } else {
                        toast.warning('Perfil no encontrado');
                      }
                    }
                  }}
                />
                {perfilSeleccionado && (
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => {
                      setPerfilSeleccionado(''); 
                      setSearchPerfil(''); 
                      setTiendas([]); 
                      setUsuarios([]);
                      setSearchTienda('');
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sugerencias */}
              {searchPerfil && !perfilSeleccionado && (
                <div className="border rounded mt-1" style={{ 
                  maxHeight: 180, overflowY: 'auto', position: 'absolute', 
                  zIndex: 100, background: 'white', width: '100%' 
                }}>
                  {perfiles
                    .filter(p => p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase()))
                    .map(p => (
                      <div 
                        key={p.perfilId} 
                        className="px-3 py-2"
                        style={{ cursor: 'pointer', fontSize: 13 }}
                        onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.target.style.background = 'white'}
                        onClick={() => { 
                          setSearchPerfil(p.descripcion); 
                          setPerfilSeleccionado(String(p.perfilId)); 
                        }}
                      >
                        {p.descripcion} 
                        <span className="text-muted" style={{ fontSize: 11 }}> ID: {p.perfilId}</span>
                      </div>
                    ))}
                </div>
              )}
            </Col>
        </Row>
              
        {perfilSeleccionado && (
          <>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="mb-0 fw-semibold">
                  Tiendas asignadas a <span style={{ color: '#185FA5' }}>{perfilActual?.descripcion}</span>
                </h6>
                <small className="text-muted">{tiendas.length} tienda{tiendas.length !== 1 ? 's' : ''} asignada{tiendas.length !== 1 ? 's' : ''}</small>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <div className="input-group input-group-sm" style={{ width: 220 }}>
                  <span className="input-group-text px-2">
                    <svg width={12} height={12}><use href="/icons/sprite.svg#search"></use></svg>
                  </span>
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Buscar tienda..."
                    value={searchTienda}
                    onChange={e => setSearchTienda(e.target.value)}/>
                  {searchTienda && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchTienda('')}>✕</button>
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={openModal}>
                  <FaPlus size={11} className="me-1" /> Asignar tiendas
                </Button>
              </div>
            </div>
           {perfilSeleccionado && usuarios.length > 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header py-2" style={{ background: '#f3f4f6' }}>
              <span className="fw-semibold small text-uppercase" style={{ color: '#374151', fontSize: 11 }}>
                Usuarios en este perfil ({usuarios.length})
              </span>
            </div>
            <div className="card-body py-2">
              <div className="d-flex flex-wrap gap-2">
                {usuarios.map(u => (
                  <div key={u.usuarioId} className="d-flex align-items-center gap-1 px-2 py-1 rounded"
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <span className="fw-semibold font-monospace" style={{ color: '#185FA5', fontSize: 12 }}>
                      {u.usuarioId}
                    </span>
                    {u.nombreUsuario && (
                      <span className="text-muted" style={{ fontSize: 11 }}>— {u.nombreUsuario}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}         
            {/* Cards de tiendas */}
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : tiendasFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <FaStore size={32} className="text-muted mb-2" />
                <p className="text-muted">No hay tiendas asignadas a este perfil.</p>
              </div>
            ) : (
              <Row className="g-3">
                {tiendasFiltradas.map(t => (
                  <Col key={t.id} xs={12} sm={6} md={4} lg={3}>
                    <div className="card border-0 shadow-sm h-100"
                      style={{ borderLeft: '3px solid #185FA5 !important', borderRadius: 8 }}>
                      <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="fw-bold font-monospace" style={{ color: '#185FA5', fontSize: 14 }}>
                              {t.tienda}
                            </span>
                            <Badge bg="success" className="ms-2" style={{ fontSize: 9 }}>Activa</Badge>
                          </div>
                          <Button size="sm" variant="outline-danger"
                            onClick={() => handleDesasignar(t.id, t.tienda)}
                            style={{ padding: '2px 6px' }}>
                            <FaTrash size={10} />
                          </Button>
                        </div>
                        <p className="mb-1 text-muted" style={{ fontSize: 12 }}>
                          {t.descripcion ?? '—'}
                        </p>
                        {t.empresa && (
                          <Badge bg="light" text="dark" style={{ border: '1px solid #d1d5db', fontSize: 10 }}>
                            {t.empresa}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        {!perfilSeleccionado && (
          <div className="text-center py-5">
            <FaStore size={48} className="text-muted mb-3" />
            <p className="text-muted">Selecciona un perfil para ver sus tiendas asignadas.</p>
          </div>
        )}

      </div>

      {/* MODAL ASIGNAR TIENDAS */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setSearchDisponible(''); }} centered size="lg">
        <ModalHeader closeButton>
          <ModalTitle>Asignar tiendas — {perfilActual?.descripcion}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="input-group mb-3">
            <span className="input-group-text px-2">
              <svg width={14} height={14}><use href="/icons/sprite.svg#search"></use></svg>
            </span>
            <input type="text" className="form-control"
              placeholder="Buscar tienda disponible..."
              value={searchDisponible}
              onChange={e => setSearchDisponible(e.target.value)}/>
            {searchDisponible && (
              <button className="btn btn-outline-secondary" onClick={() => setSearchDisponible('')}>✕</button>
            )}
          </div>

          {loadingTiendas ? (
            <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
          ) : disponiblesFiltradas.length === 0 ? (
            <p className="text-muted text-center py-3">No hay tiendas disponibles para asignar.</p>
          ) : (
            <Row className="g-2" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {disponiblesFiltradas.map(t => (
                <Col key={t.tiendaId} xs={12} sm={6}>
                  <div className="d-flex align-items-center justify-content-between p-2 rounded"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div>
                      <span className="fw-semibold font-monospace" style={{ fontSize: 13, color: '#185FA5' }}>
                        {t.tiendaId}
                      </span>
                      <p className="mb-0 text-muted" style={{ fontSize: 11 }}>{t.descripcion ?? '—'}</p>
                      {t.empresa && <small className="text-muted">{t.empresa}</small>}
                    </div>
                    <Button size="sm" variant="outline-primary" disabled={saving}
                      onClick={() => handleAsignar(t.tiendaId)}>
                      <FaPlus size={10} className="me-1" /> Asignar
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={() => { setShowModal(false); setSearchDisponible(''); }}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default GestionPerfilTienda;