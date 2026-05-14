import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Badge, Form, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaStar, FaDisplay } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { vistaPerfilService, perfilesService } from '@/services/seguridad.service';

const GestionVistaPerfil = () => {
  const [perfiles, setPerfiles]                     = useState([]);
  const [empresas, setEmpresas]                     = useState([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
  const [searchPerfil, setSearchPerfil]             = useState('');
  const [vistas, setVistas]                         = useState([]); // [{empresa, vistas:[...]}]
  const [loading, setLoading]                       = useState(false);
  const [searchVista, setSearchVista]               = useState('');
  const [showModal, setShowModal]                   = useState(false);
  const [saving, setSaving]                         = useState(false);
  const [vistasModal, setVistasModal]               = useState([]);
  const [loadingModal, setLoadingModal]             = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [listaPerfiles, listaEmpresas] = await Promise.all([
          perfilesService.listar({ estado: 'A' }),
          vistaPerfilService.getEmpresas(),
        ]);
        setPerfiles(listaPerfiles);
        setEmpresas(listaEmpresas);
      } catch (err) {
        toast.error('Error al cargar datos: ' + err.message);
      }
    };
    cargarInicial();
  }, []);

  useEffect(() => {
    if (!perfilSeleccionado) { setVistas([]); return; }
    cargarVistas();
  }, [perfilSeleccionado]);

  const cargarVistas = async () => {
    try {
      setLoading(true);
      const lista = await vistaPerfilService.getByPerfil(perfilSeleccionado);
      setVistas(lista); // [{empresa, vistas:[...]}]
    } catch (err) {
      toast.error('Error al cargar vistas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

const handleEmpresaChange = async (empresa) => {
  if (!empresa || !perfilSeleccionado) return;
  try {
    setLoadingModal(true);
    setVistasModal([]);
    const lista = await vistaPerfilService.getDisponibles(perfilSeleccionado, empresa);
    setVistasModal(lista);
  } catch (err) { toast.error(err.message); }
  finally { setLoadingModal(false); }
};


  const handleAsignar = async (data) => {
    try {
      setSaving(true);
      const vistasSeleccionadas = Array.isArray(data.vistas) ? data.vistas : [data.vistas];
      for (const vista of vistasSeleccionadas) {
        await vistaPerfilService.asignar({
          empresa:         data.empresa,
          perfil:          parseInt(perfilSeleccionado),
          vista:           parseInt(vista),
          flagDefault:     '0',
          usuarioCreacion: 'ADMIN',
        });
      }
      toast.success(`${vistasSeleccionadas.length} vista(s) asignada(s) correctamente`);
      setShowModal(false);
      reset();
      await cargarVistas();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDesasignar = async (id, descripcion) => {
    try {
      await vistaPerfilService.desasignar(id);
      toast.success(`Vista "${descripcion}" desasignada`);
      await cargarVistas();
    } catch (err) { toast.error(err.message); }
  };

  const handleCambiarDefault = async (id) => {
    try {
      await vistaPerfilService.cambiarDefault(id);
      toast.success('Vista default actualizada');
      await cargarVistas();
    } catch (err) { toast.error(err.message); }
  };

  // Filtrar por búsqueda
  const vistasFiltradas = useMemo(() => {
    if (!searchVista) return vistas;
    const s = searchVista.toLowerCase();
    return vistas.map(grupo => ({
      ...grupo,
      vistas: grupo.vistas.filter(v =>
        v.descripcion?.toLowerCase().includes(s) ||
        String(v.vista).includes(s)
      )
    })).filter(grupo => grupo.vistas.length > 0);
  }, [vistas, searchVista]);

  const totalAsignadas = vistas.reduce((acc, g) => acc + g.vistas.length, 0);
  const perfilActual   = perfiles.find(p => p.perfilId === parseInt(perfilSeleccionado));

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Perfil — Vistas"
        subTitle1="Seguridad"
        subTitle2="Perfil Vistas"
        subText="Gestión de vistas de tarjeta vendedor por perfil."
      />

      <div className="main-content">

        {/* Buscador perfil */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Label className="fw-semibold">Buscar perfil</Form.Label>
            <div style={{ position: 'relative' }}>
              <div className="input-group">
                <input type="text" className="form-control"
                  placeholder="Escribir nombre del perfil..."
                  value={searchPerfil}
                  onChange={e => setSearchPerfil(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const found = perfiles.find(p => p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase()));
                      if (found) { setPerfilSeleccionado(String(found.perfilId)); setSearchPerfil(found.descripcion); }
                      else toast.warning('Perfil no encontrado');
                    }
                  }}
                />
                {perfilSeleccionado && (
                  <button className="btn btn-outline-secondary" onClick={() => {
                    setPerfilSeleccionado(''); setSearchPerfil(''); setVistas([]);
                  }}>✕</button>
                )}
              </div>
              {searchPerfil && !perfilSeleccionado && (
                <div className="border rounded mt-1" style={{
                  maxHeight: 180, overflowY: 'auto', position: 'absolute',
                  zIndex: 100, background: 'white', width: '100%'
                }}>
                  {perfiles
                    .filter(p => p.descripcion.toLowerCase().includes(searchPerfil.toLowerCase()))
                    .map(p => (
                      <div key={p.perfilId} className="px-3 py-2"
                        style={{ cursor: 'pointer', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        onClick={() => {
                          setSearchPerfil(p.descripcion);
                          setPerfilSeleccionado(String(p.perfilId));
                        }}>
                        {p.descripcion}
                        <span className="text-muted ms-2" style={{ fontSize: 11 }}>ID: {p.perfilId}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Col>
        </Row>

        {perfilSeleccionado && (
          <>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="mb-0 fw-semibold">
                  Vistas asignadas a <span style={{ color: '#185FA5' }}>{perfilActual?.descripcion}</span>
                </h6>
                <small className="text-muted">
                  {totalAsignadas} vista{totalAsignadas !== 1 ? 's' : ''} en {vistas.length} empresa{vistas.length !== 1 ? 's' : ''}
                </small>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <div className="input-group input-group-sm" style={{ width: 220 }}>
                  <span className="input-group-text px-2">
                    <svg width={12} height={12}><use href="/icons/sprite.svg#search"></use></svg>
                  </span>
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Buscar vista..."
                    value={searchVista}
                    onChange={e => setSearchVista(e.target.value)}/>
                  {searchVista && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchVista('')}>✕</button>
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={() => {
                  reset(); setVistasModal([]); setShowModal(true);
                }}>
                  <FaPlus size={11} className="me-1" /> Asignar vista
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : vistasFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <FaDisplay size={32} className="text-muted mb-2" />
                <p className="text-muted">No hay vistas asignadas a este perfil.</p>
              </div>
            ) : (
              vistasFiltradas.map(grupo => (
                <div key={grupo.empresa} className="mb-4">
                  {/* Header empresa */}
                  <div className="d-flex align-items-center gap-2 mb-2 pb-1"
                    style={{ borderBottom: '2px solid #185FA5' }}>
                    <span className="fw-bold text-uppercase" style={{ color: '#185FA5', fontSize: 12 }}>
                      {grupo.empresa}
                    </span>
                    <Badge bg="light" text="dark" style={{ border: '1px solid #bfdbfe', fontSize: 10 }}>
                      {grupo.vistas.length} vista{grupo.vistas.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Row className="g-3">
                    {grupo.vistas.map(v => (
                      <Col key={v.id} xs={12} sm={6} md={4} lg={3}>
                        <div className="card border-0 shadow-sm h-100"
                          style={{
                            borderRadius: 8,
                            borderLeft: v.flagVistaDefault === '1' ? '3px solid #3B6D11' : '3px solid #185FA5'
                          }}>
                          <div className="card-body py-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="fw-bold font-monospace" style={{ color: '#185FA5', fontSize: 13 }}>
                                  Vista {v.vista}
                                </span>
                                {v.flagVistaDefault === '1' && (
                                  <Badge bg="success" className="ms-1" style={{ fontSize: 9 }}>
                                    <FaStar size={8} className="me-1" />Default
                                  </Badge>
                                )}
                              </div>
                              <div className="d-flex gap-1">
                                <Button size="sm"
                                  variant={v.flagVistaDefault === '1' ? 'success' : 'outline-secondary'}
                                  title={v.flagVistaDefault === '1' ? 'Quitar default' : 'Marcar como default'}
                                  style={{ padding: '2px 6px' }}
                                  onClick={() => handleCambiarDefault(v.id)}>
                                  <FaStar size={10} />
                                </Button>
                                <Button size="sm" variant="outline-danger"
                                  style={{ padding: '2px 6px' }}
                                  onClick={() => handleDesasignar(v.id, v.descripcion)}>
                                  <FaTrash size={10} />
                                </Button>
                              </div>
                            </div>
                            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                              {v.descripcion ?? '—'}
                            </p>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </>
        )}

        {!perfilSeleccionado && (
          <div className="text-center py-5">
            <FaDisplay size={48} className="text-muted mb-3" />
            <p className="text-muted">Selecciona un perfil para ver sus vistas asignadas.</p>
          </div>
        )}
      </div>

      {/* Modal asignar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>Asignar vista — {perfilActual?.descripcion}</ModalTitle>
        </ModalHeader>
        <Form onSubmit={handleSubmit(handleAsignar)}>
          <ModalBody>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small">Empresa <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  {...register('empresa', { required: 'Requerido' })}
                  isInvalid={!!errors.empresa}
                  onChange={async (e) => {
                    const { onChange } = register('empresa');
                    onChange(e);
                    await handleEmpresaChange(e.target.value);
                  }}>
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map(e => (
                    <option key={e.empresaId} value={e.empresaId}>{e.empresaId} — {e.razonSocial}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.empresa?.message}</Form.Control.Feedback>
              </Col>
              <Col md={12}>
                <Form.Label className="small">Vistas <span className="text-danger">*</span></Form.Label>
                {loadingModal ? (
                  <div className="text-center py-2"><Spinner animation="border" size="sm" /></div>
                ) : vistasModal.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    {errors.empresa ? 'Selecciona una empresa primero.' : 'Todas las vistas ya están asignadas para esta empresa.'}
                  </p>
                ) : (
                  <Form.Select multiple style={{ height: 180 }}
                    {...register('vistas', { required: 'Selecciona al menos una vista' })}
                    isInvalid={!!errors.vistas}>
                    {vistasModal.map(v => (
                      <option key={v.vista} value={v.vista}>
                        Vista {v.vista} — {v.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Text className="text-muted" style={{ fontSize: 11 }}>
                  Mantén Ctrl para seleccionar varias
                </Form.Text>
                {errors.vistas && (
                  <div className="text-danger" style={{ fontSize: 12 }}>{errors.vistas.message}</div>
                )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving || vistasModal.length === 0}>
              {saving ? 'Guardando...' : 'Asignar vista'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionVistaPerfil;