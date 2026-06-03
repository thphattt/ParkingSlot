const DataTable = ({ columns, data, loading, emptyMessage = 'Không có dữ liệu', emptyIcon: EmptyIcon }) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t border-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded-lg bg-muted" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-border p-12 text-center">
        {EmptyIcon && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <EmptyIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        )}
        <p className="font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Data table
  return (
    <div className="overflow-hidden rounded-3xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="border-t border-border transition-colors hover:bg-muted/30">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;