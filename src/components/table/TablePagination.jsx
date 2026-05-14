const TablePagination = ({
  totalItems,
  start,
  end,
  itemsName = 'registros',
  showInfo,
  previousPage,
  canPreviousPage,
  pageCount,
  pageIndex,
  setPageIndex,
  nextPage,
  canNextPage,
  pageSize,
  onPageSizeChange,
  showPageLimit,
}) => {
  return (
    <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top flex-wrap gap-2">
      {/* Info + navegación */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-sm btn-outline-secondary px-2 py-1"
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
          title="Primera página"
        >
          «
        </button>
        <button
          className="btn btn-sm btn-outline-secondary px-2 py-1"
          onClick={previousPage}
          disabled={!canPreviousPage}
        >
          ‹
        </button>

        <span className="small text-muted text-nowrap">
          {showInfo
            ? `${start}–${end} de ${totalItems} ${itemsName}`
            : `Pág ${pageIndex + 1} / ${pageCount || 1}`}
        </span>

        <button
          className="btn btn-sm btn-outline-secondary px-2 py-1"
          onClick={nextPage}
          disabled={!canNextPage}
        >
          ›
        </button>
        <button
          className="btn btn-sm btn-outline-secondary px-2 py-1"
          onClick={() => setPageIndex(Math.max(pageCount - 1, 0))}
          disabled={pageIndex >= pageCount - 1}
          title="Última página"
        >
          »
        </button>
      </div>

      {/* Selector de tamaño de página */}
      {showPageLimit && (
        <select
          className="form-select form-select-sm w-auto"
          value={pageSize}
          onChange={e => onPageSizeChange?.(Number(e.target.value))}
        >
          {[10, 15, 25, 50, 100].map(s => (
            <option key={s} value={s}>{s} por pág.</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TablePagination;
