import type { ReactNode } from "react";
import { TableSkeleton } from "./LoadingState";
import { EmptyState } from "./EmptyState";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Rendered as the primary line in the mobile card view */
  mobilePrimary?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return <TableSkeleton cols={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const primaryCol = columns.find((c) => c.mobilePrimary) ?? columns[0];
  const restCols = columns.filter((c) => c.key !== primaryCol.key);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 dark:border-ink-600">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left font-medium text-ink-400 px-4 py-3 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={
                  "border-b border-ink-100/60 dark:border-ink-600/60 last:border-0 transition-colors " +
                  (onRowClick ? "cursor-pointer hover:bg-ivory-100 dark:hover:bg-ink-600/20" : "")
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className={"px-4 py-3 align-middle " + (col.className ?? "")}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        {data.map((row) => (
          <div
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={
              "rounded-xl border border-ink-100 dark:border-ink-600 bg-white dark:bg-ink-800/60 p-4 space-y-2 " +
              (onRowClick ? "cursor-pointer active:bg-ivory-100 dark:active:bg-ink-600/20" : "")
            }
          >
            <div className="font-medium text-ink-800 dark:text-ivory-100">{primaryCol.render(row)}</div>
            <div className="grid grid-cols-2 gap-2">
              {restCols.map((col) => (
                <div key={col.key} className="text-xs">
                  <span className="text-ink-400">{col.header}: </span>
                  <span className="text-ink-600 dark:text-ivory-200">{col.render(row)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
