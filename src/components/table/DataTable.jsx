import { Fragment, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import * as XLSX from 'xlsx';

const DataTable = ({
  table,
  className = '',
  emptyMessage = 'Sin resultados.',
  showHeaders = true,
  renderSubComponent = null,
  showExport = true,
  exportFileName = 'datos',
}) => {
  const [copied, setCopied] = useState(false);
  const allColumns = table.getAllColumns();

  // Obtiene encabezados legibles (solo strings)
  const getHeaders = () =>
    table.getHeaderGroups()[0]?.headers.map(h => {
      const hDef = h.column.columnDef.header;
      return typeof hDef === 'string' ? hDef : (h.column.id ?? '');
    }) ?? [];

  // Obtiene valor crudo de cada celda
  const getRawRows = () =>
    table.getFilteredRowModel().rows.map(row =>
      row.getVisibleCells().map(cell => {
        const v = cell.getValue();
        return v == null ? '' : String(v);
      })
    );

  const handleExcel = () => {
    const headers = getHeaders();
    const rows = getRawRows();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Auto-ancho de columnas
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(
        h.length,
        ...rows.map(r => (r[i] ?? '').length)
      ) + 2,
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const handleCopy = () => {
    const headers = getHeaders().join('\t');
    const rows = getRawRows().map(r => r.join('\t')).join('\n');
    navigator.clipboard.writeText(headers + '\n' + rows).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`card border-0 shadow-sm ${className}`}>
      {/* Barra de exportación */}
      {showExport && (
        <div className="d-flex align-items-center justify-content-end gap-2 px-3 py-2 border-bottom bg-light bg-opacity-50">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleCopy}
            title="Copiar datos al portapapeles"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
          <button
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
            onClick={handleExcel}
            title="Exportar a Excel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Excel
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <table
          className="table table-sm table-hover align-middle mb-0"
          style={{ fontSize: '0.83rem' }}
        >
          {showHeaders && (
            <thead className="table-light">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        whiteSpace: 'nowrap',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="d-flex align-items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {header.column.getIsSorted() === 'asc'
                              ? '↑'
                              : header.column.getIsSorted() === 'desc'
                              ? '↓'
                              : '⇅'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          )}
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <Fragment key={row.id}>
                  <tr>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ whiteSpace: 'nowrap' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderSubComponent && row.getIsExpanded() && (
                    <tr className="bg-light bg-opacity-50">
                      <td colSpan={row.getVisibleCells().length} className="p-3">
                        {renderSubComponent({ row })}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="text-center text-muted py-5"
                >
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🔍</div>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
