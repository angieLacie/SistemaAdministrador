import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Form, Spinner, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaPen, FaToggleOn, FaToggleOff, FaChevronRight } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import { sistemasService, modulosService, opcionesService, funcionesService } from '@/services/seguridad.service';

const EstadoBadge = ({ estado }) => (
  <Badge bg={estado === 'A' ? 'success' : 'secondary'} style={{ fontSize: 10 }}>
    {estado === 'A' ? 'Activo' : 'Inactivo'}
  </Badge>
);

const ItemCard = ({ label, sublabel, estado, activo, onClick, onEdit, onToggle }) => (
  <div className="d-flex align-items-center justify-content-between p-2 rounded mb-1"
    style={{
      background: activo ? '#eff6ff' : 'var(--color-background-secondary)',
      border: activo ? '1px solid #bfdbfe' : '0.5px solid var(--color-border-tertiary)',
      cursor: 'pointer'
    }}
    onClick={onClick}>
    <div className="d-flex align-items-center gap-2">
      <FaChevronRight size={10} style={{ color: activo ? '#185FA5' : 'var(--color-text-secondary)' }} />
      <div>
        <div className="fw-semibold" style={{ fontSize: 12, color: activo ? '#185FA5' : 'var(--color-text-primary)' }}>
          {label}
        </div>
        {sublabel && <div className="text-muted font-monospace" style={{ fontSize: 10 }}>{sublabel}</div>}
      </div>
    </div>
    <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
      <EstadoBadge estado={estado} />
      <Button size="sm" variant="outline-secondary" style={{ padding: '1px 6px' }} onClick={onEdit}>
        <FaPen size={10} />
      </Button>
      <Button size="sm" variant={estado === 'A' ? 'outline-danger' : 'outline-success'}
        style={{ padding: '1px 6px' }} onClick={onToggle}>
        {estado === 'A' ? <FaToggleOff size={10} /> : <FaToggleOn size={10} />}
      </Button>
    </div>
  </div>
);

// ── Modal genérico ────────────────────────────────────
const GenericModal = ({ show, onHide, onSave, title, fields, defaultValues, saving }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (show) reset(defaultValues); }, [show, defaultValues]);
  return (
    <Modal show={show} onHide={onHide} centered>
      <ModalHeader closeButton><ModalTitle>{title}</ModalTitle></ModalHeader>
      <Form onSubmit={handleSubmit(onSave)}>
        <ModalBody>
          <Row className="g-3">
            {fields.map(f => (
              <Col key={f.name} md={f.md || 12}>
                <Form.Label className="small fw-semibold">{f.label}{f.required && <span className="text-danger ms-1">*</span>}</Form.Label>
                {f.type === 'select' ? (
                  <Form.Select {...register(f.name, f.required ? { required: 'Campo requerido' } : {})}
                    isInvalid={!!errors[f.name]}>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type={f.type || 'text'}
                    {...register(f.name, f.required ? { required: 'Campo requerido' } : {})}
                    placeholder={f.placeholder}
                    isInvalid={!!errors[f.name]}
                    disabled={f.disabled}
                    className={f.mono ? 'font-monospace' : ''}
                  />
                )}
                {errors[f.name] && <Form.Control.Feedback type="invalid">{errors[f.name].message}</Form.Control.Feedback>}
              </Col>
            ))}
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// ── Columna genérica ──────────────────────────────────
const Columna = ({ titulo, items, selectedId, onSelect, onAdd, onEdit, onToggle, loading, getId, getLabel, getSublabel, getEstado }) => (
  <div className="h-100" style={{ minHeight: 400 }}>
    <div className="d-flex align-items-center justify-content-between mb-2">
      <span className="fw-semibold small text-uppercase" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{titulo}</span>
      <Button size="sm" variant="outline-primary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={onAdd}>
        <FaPlus size={9} className="me-1" /> Nuevo
      </Button>
    </div>
    {loading ? (
      <div className="text-center py-3"><Spinner animation="border" size="sm" variant="primary" /></div>
    ) : items.length === 0 ? (
      <p className="text-muted" style={{ fontSize: 12 }}>Sin registros</p>
    ) : items.map(item => (
      <ItemCard key={getId(item)}
        label={getLabel(item)}
        sublabel={getSublabel ? getSublabel(item) : null}
        estado={getEstado(item)}
        activo={selectedId === getId(item)}
        onClick={() => onSelect(item)}
        onEdit={() => onEdit(item)}
        onToggle={() => onToggle(item)}
      />
    ))}
  </div>
);

const GestionAccesos = () => {
  // Datos
  const [sistemas, setSistemas]   = useState([]);
  const [modulos, setModulos]     = useState([]);
  const [opciones, setOpciones]   = useState([]);
  const [funciones, setFunciones] = useState([]);

  // Seleccionados
  const [selSistema, setSelSistema] = useState(null);
  const [selModulo, setSelModulo]   = useState(null);
  const [selOpcion, setSelOpcion]   = useState(null);

  // Loading
  const [loadingSistemas, setLoadingSistemas] = useState(true);
  const [loadingModulos, setLoadingModulos]   = useState(false);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const [loadingFunciones, setLoadingFunciones] = useState(false);

  // Modals
  const [modal, setModal] = useState({ show: false, tipo: '', item: null });
  const [saving, setSaving] = useState(false);

  // ── Cargas ────────────────────────────────────────
  useEffect(() => {
    sistemasService.listar()
      .then(setSistemas)
      .catch(err => toast.error(err.message))
      .finally(() => setLoadingSistemas(false));
  }, []);

  const cargarModulos = async (sistemaId) => {
    setLoadingModulos(true);
    setModulos([]); setOpciones([]); setFunciones([]);
    setSelModulo(null); setSelOpcion(null);
    try { setModulos(await modulosService.listar({ sistema: sistemaId })); }
    catch (err) { toast.error(err.message); }
    finally { setLoadingModulos(false); }
  };

  const cargarOpciones = async (moduloId) => {
    setLoadingOpciones(true);
    setOpciones([]); setFunciones([]);
    setSelOpcion(null);
    try { setOpciones(await opcionesService.listar({ modulo: moduloId })); }
    catch (err) { toast.error(err.message); }
    finally { setLoadingOpciones(false); }
  };

  const cargarFunciones = async (opcionId, moduloId) => {
    setLoadingFunciones(true);
    setFunciones([]);
    try { setFunciones(await funcionesService.listar({ opcion: opcionId, modulo: moduloId })); }
    catch (err) { toast.error(err.message); }
    finally { setLoadingFunciones(false); }
  };

  // ── Handlers ──────────────────────────────────────
  const handleSelectSistema = (s) => { setSelSistema(s); cargarModulos(s.sistemaId); };
  const handleSelectModulo  = (m) => { setSelModulo(m); cargarOpciones(m.moduloId); };
  const handleSelectOpcion  = (o) => { setSelOpcion(o); cargarFunciones(o.opcionId, o.moduloId); };

  const handleToggle = async (tipo, item) => {
    try {
      const nuevoEstado = getEstadoItem(tipo, item) === 'A' ? 'I' : 'A';
      if (tipo === 'sistema') {
        await sistemasService.editar(item.sistemaId, { ...item, estadoSistema: nuevoEstado });
        setSistemas(prev => prev.map(s => s.sistemaId === item.sistemaId ? { ...s, estadoSistema: nuevoEstado } : s));
      } else if (tipo === 'modulo') {
        await modulosService.editar(item.moduloId, { ...item, estadoModulo: nuevoEstado });
        setModulos(prev => prev.map(m => m.moduloId === item.moduloId ? { ...m, estadoModulo: nuevoEstado } : m));
      } else if (tipo === 'opcion') {
        await opcionesService.editar(item.opcionId, item.moduloId, { ...item, estadoOpcion: nuevoEstado });
        setOpciones(prev => prev.map(o => o.opcionId === item.opcionId ? { ...o, estadoOpcion: nuevoEstado } : o));
      } else if (tipo === 'funcion') {
        await funcionesService.editar(item.opcionId, item.moduloId, item.funcionId, { ...item, estadoOpcion: nuevoEstado });
        setFunciones(prev => prev.map(f => f.funcionId === item.funcionId ? { ...f, estadoOpcion: nuevoEstado } : f));
      }
      toast.success('Estado actualizado');
    } catch (err) { toast.error(err.message); }
  };

  const getEstadoItem = (tipo, item) => {
    if (tipo === 'sistema') return item.estadoSistema;
    if (tipo === 'modulo')  return item.estadoModulo;
    return item.estadoOpcion;
  };

  const openModal = (tipo, item = null) => setModal({ show: true, tipo, item });
  const closeModal = () => setModal({ show: false, tipo: '', item: null });

  const handleSave = async (data) => {
    try {
      setSaving(true);
      const { tipo, item } = modal;
      const isEdit = !!item;

      if (tipo === 'sistema') {
        if (isEdit) await sistemasService.editar(item.sistemaId, data);
        else await sistemasService.crear(data);
        setSistemas(await sistemasService.listar());
      } else if (tipo === 'modulo') {
        const payload = { ...data, sistemaId: selSistema?.sistemaId };
        if (isEdit) await modulosService.editar(item.moduloId, payload);
        else await modulosService.crear(payload);
        setModulos(await modulosService.listar({ sistema: selSistema?.sistemaId }));
      } else if (tipo === 'opcion') {
        const payload = { ...data, moduloId: selModulo?.moduloId };
        if (isEdit) await opcionesService.editar(item.opcionId, item.moduloId, payload);
        else await opcionesService.crear(payload);
        setOpciones(await opcionesService.listar({ modulo: selModulo?.moduloId }));
      } else if (tipo === 'funcion') {
        const payload = { ...data, opcionId: selOpcion?.opcionId, moduloId: selOpcion?.moduloId };
        if (isEdit) await funcionesService.editar(item.opcionId, item.moduloId, item.funcionId, payload);
        else await funcionesService.crear(payload);
        setFunciones(await funcionesService.listar({ opcion: selOpcion?.opcionId, modulo: selOpcion?.moduloId }));
      }
      toast.success(`${tipo} ${isEdit ? 'actualizado' : 'creado'} correctamente`);
      closeModal();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  // ── Campos por tipo ───────────────────────────────
  const getFields = () => {
    const { tipo, item } = modal;
    const isEdit = !!item;

    if (tipo === 'sistema') return [
      { name: 'sistemaId', label: 'Código', required: true, disabled: isEdit, mono: true, md: 6, placeholder: 'Ej: MON000', defaultValue: item?.sistemaId },
      { name: 'nombre',    label: 'Nombre',  required: true, md: 6, placeholder: 'Nombre del sistema' },
      { name: 'tipoSistema', label: 'Tipo', md: 6, placeholder: 'Ej: WEB' },
      { name: 'estadoSistema', label: 'Estado', type: 'select', md: 6, options: [{ value: 'A', label: 'Activo' }, { value: 'I', label: 'Inactivo' }] },
    ];

    if (tipo === 'modulo') return [
      { name: 'moduloId',    label: 'Código',      required: true, disabled: isEdit, mono: true, md: 6, placeholder: 'Ej: MON001' },
      { name: 'descripcion', label: 'Descripción', required: true, md: 6, placeholder: 'Nombre del módulo' },
      { name: 'icono',       label: 'Icono',       md: 6, placeholder: 'Ej: fal fa-chart-pie' },
      { name: 'pagina',      label: 'Página',      md: 6, placeholder: 'Ej: /dashboard' },
      { name: 'estadoModulo', label: 'Estado', type: 'select', md: 6, options: [{ value: 'A', label: 'Activo' }, { value: 'I', label: 'Inactivo' }] },
    ];

    if (tipo === 'opcion') return [
      { name: 'opcionId',    label: 'Código',      required: true, disabled: isEdit, mono: true, md: 6, placeholder: 'Ej: OPC001' },
      { name: 'descripcion', label: 'Descripción', required: true, md: 6, placeholder: 'Nombre de la opción' },
      { name: 'orden',       label: 'Orden',       type: 'number', md: 3, placeholder: '1' },
      { name: 'pagina',      label: 'Página',      md: 9, placeholder: 'Ej: /dashboard/ventas' },
      { name: 'icono',       label: 'Icono',       md: 6, placeholder: 'Ej: fal fa-chart-bar' },
      { name: 'estadoOpcion', label: 'Estado', type: 'select', md: 6, options: [{ value: 'A', label: 'Activo' }, { value: 'I', label: 'Inactivo' }] },
    ];

    if (tipo === 'funcion') return [
      { name: 'funcionId',   label: 'Código',      required: true, disabled: isEdit, mono: true, md: 6, placeholder: 'Ej: FUN001' },
      { name: 'descripcion', label: 'Descripción', required: true, md: 6, placeholder: 'Nombre de la función' },
      { name: 'orden',       label: 'Orden',       type: 'number', md: 3, placeholder: '1' },
      { name: 'estadoOpcion', label: 'Estado', type: 'select', md: 3, options: [{ value: 'A', label: 'Activo' }, { value: 'I', label: 'Inactivo' }] },
      { name: 'iO', label: 'Insertar',  type: 'number', md: 2, placeholder: '0' },
      { name: 'mO', label: 'Modificar', type: 'number', md: 2, placeholder: '0' },
      { name: 'gO', label: 'Grabar',    type: 'number', md: 2, placeholder: '0' },
      { name: 'cO', label: 'Consultar', type: 'number', md: 2, placeholder: '0' },
      { name: 'eO', label: 'Eliminar',  type: 'number', md: 2, placeholder: '0' },
      { name: 'rO', label: 'Reportes',  type: 'number', md: 2, placeholder: '0' },
      { name: 'bO', label: 'Buscar',    type: 'number', md: 2, placeholder: '0' },
      { name: 'pO', label: 'Imprimir',  type: 'number', md: 2, placeholder: '0' },
    ];

    return [];
  };

  const getDefaultValues = () => {
    const { tipo, item } = modal;
    if (!item) {
      if (tipo === 'sistema') return { estadoSistema: 'A' };
      if (tipo === 'modulo')  return { estadoModulo: 'A' };
      if (tipo === 'opcion')  return { estadoOpcion: 'A', orden: 1 };
      if (tipo === 'funcion') return { estadoOpcion: 'A', orden: 1, iO: 0, mO: 0, gO: 0, cO: 0, eO: 0, rO: 0, bO: 0, pO: 0 };
    }
    return item;
  };

  const getModalTitle = () => {
    const { tipo, item } = modal;
    const accion = item ? 'Editar' : 'Nuevo';
    const nombres = { sistema: 'sistema', modulo: 'módulo', opcion: 'opción', funcion: 'función' };
    return `${accion} ${nombres[tipo] || ''}`;
  };

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title="Gestión de Accesos"
        subTitle1="Seguridad"
        subTitle2="Accesos"
        subText="Mantenimiento de sistemas, módulos, opciones y funciones."
      />

      <div className="main-content">

        {/* Breadcrumb de navegación */}
        {(selSistema || selModulo || selOpcion) && (
          <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded"
            style={{ background: 'var(--color-background-secondary)', fontSize: 12 }}>
            <span className="text-muted">Navegando:</span>
            {selSistema && <Badge bg="primary">{selSistema.nombre}</Badge>}
            {selModulo  && <><FaChevronRight size={9} className="text-muted" /><Badge bg="secondary">{selModulo.descripcion}</Badge></>}
            {selOpcion  && <><FaChevronRight size={9} className="text-muted" /><Badge bg="secondary">{selOpcion.descripcion}</Badge></>}
          </div>
        )}

        <Row className="g-3">
          {/* Sistemas */}
          <Col md={3}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <Columna
                  titulo="Sistemas"
                  items={sistemas}
                  selectedId={selSistema?.sistemaId}
                  onSelect={handleSelectSistema}
                  onAdd={() => openModal('sistema')}
                  onEdit={(item) => openModal('sistema', item)}
                  onToggle={(item) => handleToggle('sistema', item)}
                  loading={loadingSistemas}
                  getId={s => s.sistemaId}
                  getLabel={s => s.nombre ?? s.sistemaId}
                  getSublabel={s => s.sistemaId}
                  getEstado={s => s.estadoSistema}
                />
              </div>
            </div>
          </Col>

          {/* Módulos */}
          <Col md={3}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                {selSistema ? (
                  <Columna
                    titulo={`Módulos — ${selSistema.nombre}`}
                    items={modulos}
                    selectedId={selModulo?.moduloId}
                    onSelect={handleSelectModulo}
                    onAdd={() => openModal('modulo')}
                    onEdit={(item) => openModal('modulo', item)}
                    onToggle={(item) => handleToggle('modulo', item)}
                    loading={loadingModulos}
                    getId={m => m.moduloId}
                    getLabel={m => m.descripcion ?? m.moduloId}
                    getSublabel={m => m.moduloId}
                    getEstado={m => m.estadoModulo}
                  />
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted" style={{ fontSize: 12 }}>Selecciona un sistema</p>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Opciones */}
          <Col md={3}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                {selModulo ? (
                  <Columna
                    titulo={`Opciones — ${selModulo.descripcion}`}
                    items={opciones}
                    selectedId={selOpcion?.opcionId}
                    onSelect={handleSelectOpcion}
                    onAdd={() => openModal('opcion')}
                    onEdit={(item) => openModal('opcion', item)}
                    onToggle={(item) => handleToggle('opcion', item)}
                    loading={loadingOpciones}
                    getId={o => o.opcionId}
                    getLabel={o => o.descripcion ?? o.opcionId}
                    getSublabel={o => o.opcionId}
                    getEstado={o => o.estadoOpcion}
                  />
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted" style={{ fontSize: 12 }}>Selecciona un módulo</p>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Funciones */}
          <Col md={3}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                {selOpcion ? (
                  <Columna
                    titulo={`Funciones — ${selOpcion.descripcion}`}
                    items={funciones}
                    selectedId={null}
                    onSelect={() => {}}
                    onAdd={() => openModal('funcion')}
                    onEdit={(item) => openModal('funcion', item)}
                    onToggle={(item) => handleToggle('funcion', item)}
                    loading={loadingFunciones}
                    getId={f => f.funcionId}
                    getLabel={f => f.descripcion ?? f.funcionId}
                    getSublabel={f => f.funcionId}
                    getEstado={f => f.estadoOpcion}
                  />
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted" style={{ fontSize: 12 }}>Selecciona una opción</p>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <GenericModal
        show={modal.show}
        onHide={closeModal}
        onSave={handleSave}
        title={getModalTitle()}
        fields={getFields()}
        defaultValues={getDefaultValues()}
        saving={saving}
      />
    </div>
  );
};

export default GestionAccesos;