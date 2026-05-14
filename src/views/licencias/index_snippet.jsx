// ─────────────────────────────────────────────────────────────
// AGREGAR en index.jsx — imports al inicio:
// ─────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router';
import { FaEye } from 'react-icons/fa6';

// ─────────────────────────────────────────────────────────────
// AGREGAR dentro del componente GestionLicencias:
// ─────────────────────────────────────────────────────────────
const navigate = useNavigate();

// ─────────────────────────────────────────────────────────────
// REEMPLAZAR la columna de acciones en columns[]:
// ─────────────────────────────────────────────────────────────
columnHelper.display({
  id: 'acciones',
  header: 'Acciones',
  cell: ({ row }) => (
    <div className="d-flex gap-1">
      <Button
        size="sm"
        variant="outline-info"
        title="Ver detalle"
        onClick={() => navigate(`/licencias/${row.original.idOficina}`)}
      >
        <FaEye size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-primary"
        title="Cambiar usuario"
        onClick={() => { setSelectedLic(row.original); setShowCambioModal(true); }}
      >
        <FaUserPen size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        title="Editar"
        onClick={() => { setSelectedLic(row.original); setShowLicModal(true); }}
      >
        <FaPen size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline-danger"
        title="Eliminar"
        onClick={() => { setSelectedLic(row.original); setShowDeleteModal(true); }}
      >
        <FaTrash size={12} />
      </Button>
    </div>
  ),
})
