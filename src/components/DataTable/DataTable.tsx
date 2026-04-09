import React, { useState, useMemo, useCallback } from 'react';
import './DataTable.css';
import { DataTableProps, ColumnDef } from './DataTable.types';

type SortDir = 'none' | 'asc' | 'desc';

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v > 999 ? v.toLocaleString() : String(v);
  return String(v);
}

function StatusCell({ value }: { value: string }) {
  return (
    <span className="dt-status">
      <span className={`dt-status-dot ${value}`} />
      {value}
    </span>
  );
}

export function DataTable<T extends { id: string; name: string }>({
  columns, data, zebraStriping = false, groupBy,
  rowSelection = 'none', onRowSelect, onCellEdit,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<SortDir>('none');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<T | null>(null);
  const [editCell, setEditCell] = useState<{ rowId: string; key: string; value: string } | null>(null);

  const handleHeaderClick = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSortKey(prev => {
      const newDir: SortDir = prev === key ? (sortDir === 'none' ? 'asc' : sortDir === 'asc' ? 'desc' : 'none') : 'asc';
      setSortDir(newDir);
      return key;
    });
  }, [sortDir]);

  const sorted = useMemo(() => {
    if (sortDir === 'none' || !sortKey) return data;
    const col = columns.find(c => String(c.key) === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = a[col.key], bv = b[col.key];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const map = new Map<string, T[]>();
    sorted.forEach(row => {
      const k = groupBy.getGroupKey(row);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(row);
    });
    return map;
  }, [sorted, groupBy]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleRadioClick = (row: T) => { setPendingRow(row); };
  const handleConfirm = () => {
    if (!pendingRow) return;
    setSelectedId(pendingRow.id);
    onRowSelect?.(pendingRow);
    setPendingRow(null);
  };
  const handleCancel = () => setPendingRow(null);

  const startEdit = (row: T, col: ColumnDef<T>) => {
    if (!col.editable) return;
    setEditCell({ rowId: row.id, key: String(col.key), value: formatValue(row[col.key]) });
  };

  const commitEdit = (row: T, col: ColumnDef<T>, newVal: string) => {
    const old = formatValue(row[col.key]);
    onCellEdit?.(row.id, col.key, old, newVal);
    setEditCell(null);
  };

  const renderCell = (row: T, col: ColumnDef<T>, rowIndex: number) => {
    const key = String(col.key);
    const value = row[col.key];
    const isEditing = editCell?.rowId === row.id && editCell?.key === key;

    if (col.key === 'status' as keyof T) return <StatusCell value={String(value)} />;

    if (isEditing && col.editType === 'text') {
      return <input className="dt-edit-input" autoFocus value={editCell!.value}
        onChange={e => setEditCell(prev => prev ? { ...prev, value: e.target.value } : null)}
        onBlur={() => commitEdit(row, col, editCell!.value)}
        onKeyDown={e => { if (e.key === 'Enter') commitEdit(row, col, editCell!.value); if (e.key === 'Escape') setEditCell(null); }}
      />;
    }

    if (isEditing && col.editType === 'dropdown') {
      return <select className="dt-edit-select" autoFocus value={editCell!.value}
        onChange={e => commitEdit(row, col, e.target.value)}
        onBlur={() => setEditCell(null)}>
        {col.editOptions?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>;
    }

    if (isEditing && col.editType === 'date') {
      return <input className="dt-edit-input" type="date" autoFocus value={editCell!.value}
        onChange={e => setEditCell(prev => prev ? { ...prev, value: e.target.value } : null)}
        onBlur={() => commitEdit(row, col, editCell!.value)}
        onKeyDown={e => { if (e.key === 'Enter') commitEdit(row, col, editCell!.value); if (e.key === 'Escape') setEditCell(null); }}
      />;
    }

    return <span>{formatValue(value)}</span>;
  };

  const renderRows = (rows: T[]) => rows.map((row, i) => {
    const isSelected = selectedId === row.id;
    const isPending = pendingRow?.id === row.id;
    const zebra = zebraStriping && i % 2 === 0;
    return (
      <tr key={row.id} className={`dt-tr${zebra ? ' zebra' : ''}${isSelected ? ' selected' : ''}`}>
        {rowSelection === 'radio' && (
          <td className="dt-td dt-radio-cell">
            <div className={`dt-radio${isSelected || isPending ? ' checked' : ''}`}
              onClick={() => handleRadioClick(row)} />
          </td>
        )}
        {columns.map(col => (
          <td key={String(col.key)}
            className={`dt-td${col.editable ? ' editable' : ''}`}
            style={{ minWidth: col.width }}
            onClick={() => col.editable && startEdit(row, col)}>
            {renderCell(row, col, i)}
          </td>
        ))}
      </tr>
    );
  });

  const groupCount = groups?.size ?? 0;
  const label = groups ? `${data.length} rows · ${groupCount} groups` : `${data.length} rows`;

  return (
    <div className="dt-wrap">
      <div className="dt-toolbar">
        <div className="dt-toolbar-left">{label}</div>
        <div className="dt-toolbar-right">
          {groups && (
            <>
              <button className="dt-btn" onClick={() => setCollapsedGroups(new Set(groups.keys()))}>Collapse all</button>
              <button className="dt-btn" onClick={() => setCollapsedGroups(new Set())}>Expand all</button>
            </>
          )}
        </div>
      </div>
      <div className="dt-scroll">
        <table className="dt-table">
          <thead className="dt-thead">
            <tr>
              {rowSelection === 'radio' && <th className="dt-th" style={{ width: 44 }} />}
              {columns.map(col => {
                const key = String(col.key);
                const isActive = sortKey === key && sortDir !== 'none';
                return (
                  <th key={key} className={`dt-th${col.sortable ? ' sortable' : ''}${isActive ? ' active' : ''}`}
                    style={{ minWidth: col.width }}
                    onClick={() => handleHeaderClick(key, col.sortable)}>
                    {col.label}
                    {col.sortable && <span className="dt-sort-icon">{isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!groups ? renderRows(sorted) : Array.from(groups.entries()).map(([groupKey, rows]) => {
              const label = groupBy?.getGroupLabel ? groupBy.getGroupLabel(groupKey) : groupKey;
              const collapsed = collapsedGroups.has(groupKey);
              return (
                <React.Fragment key={groupKey}>
                  <tr className="dt-group-row">
                    <td colSpan={columns.length + (rowSelection === 'radio' ? 1 : 0)}
                      onClick={() => toggleGroup(groupKey)}>
                      <span className={`dt-group-chevron${!collapsed ? ' open' : ''}`}>▶</span>
                      {label}
                      <span className="dt-badge">{rows.length}</span>
                    </td>
                  </tr>
                  {!collapsed && renderRows(rows)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {rowSelection === 'radio' && pendingRow && (
        <div className="dt-confirm-bar">
          <span>Select <strong>{pendingRow.name}</strong>?</span>
          <div className="dt-confirm-actions">
            <button className="dt-confirm-btn cancel" onClick={handleCancel}>Cancel</button>
            <button className="dt-confirm-btn confirm" onClick={handleConfirm}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}