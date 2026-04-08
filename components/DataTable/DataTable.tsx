import React, {
  useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, useColorScheme, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { DataTableProps, ColumnDef, SortDirection, SortState, EditState, CellRadioPopoverState } from './DataTable.types';
import { useBreakpoint } from './useBreakpoint';
import { createStyles as createBaseStyles, lightColors, darkColors, ROW_HEIGHT, DRAG_HANDLE_WIDTH, RADIO_COL_WIDTH, ACCENT_TINT } from './DataTable.styles';
import { ConfirmationBar } from './ConfirmationBar';
import { CellRadioPopover } from './CellRadioPopover';
import { GroupHeader } from './GroupHeader';
import { ColumnVisibilityModal } from './ColumnVisibilityModal';
import { EditModal } from './EditModal';

const DEFAULT_COL_WIDTH = 120;

function sortRows<T>(rows: T[], sort: SortState, columns: ColumnDef<T>[]): T[] {
  if (sort.direction === 'none') return rows;
  const col = columns.find(c => String(c.key) === sort.key);
  if (!col) return rows;
  return [...rows].sort((a, b) => {
    const av = a[col.key], bv = b[col.key];
    let cmp = 0;
    if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
    else if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
    else cmp = String(av).localeCompare(String(bv));
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

function nextSortDirection(current: SortDirection): SortDirection {
  if (current === 'none') return 'asc';
  if (current === 'asc') return 'desc';
  return 'none';
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value > 999 ? value.toLocaleString() : String(value);
  return String(value);
}

type DraggableRowProps<T extends { id: string }> = {
  row: T; rowIndex: number; visibleColumns: ColumnDef<T>[]; zebraStriping: boolean;
  isEditing: boolean; editState: EditState; selectedRowId: string | null;
  cellRadioValues: Record<string, Record<string, boolean>>; pendingCellRadio: CellRadioPopoverState;
  showRowRadio: boolean; colors: typeof lightColors; baseStyles: ReturnType<typeof createBaseStyles>;
  fontSize: number; paddingH: number; paddingV: number; colWidths: number[];
  onDragStart: (rowId: string) => void; onDragEnd: (rowId: string, translation: number) => void;
  onDragUpdate: (rowId: string, translation: number) => void; onRowRadioPress: (row: T) => void;
  onCellRadioPress: (rowId: string, colKey: string, radioGroup: string, x: number, y: number) => void;
  onCellPress: (row: T, col: ColumnDef<T>) => void; onEditConfirm: () => void;
  onEditCancel: () => void; onEditChange: (text: string) => void;
  isDragging: boolean; dragTranslation: number; shiftAmount: number;
};

function DraggableRow<T extends { id: string }>({
  row, rowIndex, visibleColumns, zebraStriping, isEditing, editState, selectedRowId,
  cellRadioValues, pendingCellRadio, showRowRadio, colors, baseStyles, fontSize, paddingH,
  paddingV, colWidths, onDragStart, onDragEnd, onDragUpdate, onRowRadioPress, onCellRadioPress,
  onCellPress, onEditConfirm, onEditCancel, onEditChange, isDragging, dragTranslation, shiftAmount,
}: DraggableRowProps<T>) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isDragging) {
      scale.value = withSpring(1.04); elevation.value = withTiming(8); shadowOpacity.value = withTiming(0.15);
    } else {
      scale.value = withSpring(1); elevation.value = withTiming(0); shadowOpacity.value = withTiming(0);
      translateY.value = withSpring(shiftAmount);
    }
  }, [isDragging, shiftAmount, scale, elevation, shadowOpacity, translateY]);

  useEffect(() => {
    if (isDragging) translateY.value = dragTranslation;
  }, [isDragging, dragTranslation, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    elevation: elevation.value, shadowOpacity: shadowOpacity.value,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, shadowColor: '#000',
    zIndex: isDragging ? 999 : 0,
  }));

  const longPress = Gesture.LongPress().minDuration(400).onStart(() => { runOnJS(onDragStart)(row.id); });
  const pan = Gesture.Pan().activateAfterLongPress(400)
    .onUpdate(e => { runOnJS(onDragUpdate)(row.id, e.translationY); })
    .onEnd(e => { runOnJS(onDragEnd)(row.id, e.translationY); });
  const composed = Gesture.Simultaneous(longPress, pan);

  const isSelected = selectedRowId === row.id;
  const zebraColor = zebraStriping && rowIndex % 2 === 0 ? colors.zebraOdd : 'transparent';
  const rowCellValues = cellRadioValues[row.id] ?? {};

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[baseStyles.row, { backgroundColor: zebraColor }, isEditing && baseStyles.rowEditing, animatedStyle]}>
        <View style={baseStyles.dragHandle}><Text style={baseStyles.dragHandleText}>☰</Text></View>
        {showRowRadio && (
          <TouchableOpacity style={baseStyles.radioCol} onPress={() => onRowRadioPress(row)}>
            <View style={baseStyles.radio}>{isSelected && <View style={baseStyles.radioInner} />}</View>
          </TouchableOpacity>
        )}
        {visibleColumns.map((col, ci) => {
          const key = String(col.key);
          const value = row[col.key];
          const isEditingThisCell = isEditing && editState?.rowId === row.id && editState?.columnKey === key;
          const hasPendingRadio = pendingCellRadio?.rowId === row.id && pendingCellRadio?.columnKey === key;

          return (
            <TouchableOpacity
              key={key}
              style={[baseStyles.cell, { width: colWidths[ci], paddingHorizontal: paddingH, paddingVertical: paddingV, minHeight: ROW_HEIGHT }, hasPendingRadio && { backgroundColor: ACCENT_TINT }]}
              onPress={() => onCellPress(row, col)}
              activeOpacity={col.editable || col.radioGroup ? 0.6 : 1}
            >
              {col.radioGroup ? (
                <View style={[baseStyles.radio, { alignSelf: 'center' }]}>
                  {rowCellValues[key] && <View style={baseStyles.radioInner} />}
                </View>
              ) : col.renderCell ? (
                col.renderCell(value, row)
              ) : isEditingThisCell && col.editType === 'text' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <TextInput
                    style={[baseStyles.textInput, { fontSize }]}
                    value={editState?.value ?? ''}
                    onChangeText={onEditChange}
                    autoFocus
                    selectTextOnFocus
                  />
                  <View style={baseStyles.inlineEditActions}>
                    <TouchableOpacity style={baseStyles.inlineEditBtn} onPress={onEditConfirm}><Text style={baseStyles.inlineEditBtnText}>✓</Text></TouchableOpacity>
                    <TouchableOpacity style={baseStyles.inlineEditBtn} onPress={onEditCancel}><Text style={baseStyles.inlineEditBtnText}>✕</Text></TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={[baseStyles.cellText, { fontSize }, col.editable && { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }]} numberOfLines={1}>
                  {formatCellValue(value)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

export function DataTable<T extends { id: string; name: string }>({
  columns, data, zebraStriping = false, groupBy, rowSelection = 'none',
  onRowSelect, onCellRadioChange, onCellEdit, onRowPress, tableStyle, headerStyle,
}: DataTableProps<T>) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const baseStyles = createBaseStyles(colors);
  const { fontSize, paddingH, paddingV } = useBreakpoint();

  const [sortState, setSortState] = useState<SortState>({ key: '', direction: 'none' });
  const [editState, setEditState] = useState<EditState>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalCol, setEditModalCol] = useState<ColumnDef<T> | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<T | null>(null);
  const [pendingCellRadio, setPendingCellRadio] = useState<CellRadioPopoverState>(null);
  const [cellRadioValues, setCellRadioValues] = useState<Record<string, Record<string, boolean>>>({});
  const [colModalVisible, setColModalVisible] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => new Set(columns.map(c => String(c.key))));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (!groupBy?.defaultCollapsed) return new Set();
    const keys = new Set<string>();
    data.forEach(row => keys.add(groupBy.getGroupKey(row)));
    return keys;
  });
  const [rowOrders, setRowOrders] = useState<Record<string, string[]>>(() => {
    if (groupBy) {
      const map: Record<string, string[]> = {};
      data.forEach(row => {
        const k = groupBy.getGroupKey(row);
        if (!map[k]) map[k] = [];
        map[k].push(row.id);
      });
      return map;
    }
    return { '__flat__': data.map(r => r.id) };
  });
  const [dragState, setDragState] = useState<{ rowId: string; groupKey: string } | null>(null);
  const [dragTranslation, setDragTranslation] = useState(0);

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const map = new Map<string, T[]>();
    data.forEach(row => {
      const k = groupBy.getGroupKey(row);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(row);
    });
    return map;
  }, [data, groupBy]);

  const visibleColumns = useMemo(() => columns.filter(c => visibleKeys.has(String(c.key))), [columns, visibleKeys]);

  const handleHeaderPress = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSortState(prev => ({
      key,
      direction: prev.key === key ? nextSortDirection(prev.direction) : 'asc',
    }));
  }, []);

  const handleRowRadioPress = useCallback((row: T) => { setPendingRow(row); }, []);
  const handleConfirmRowSelect = useCallback(() => {
    if (!pendingRow) return;
    setSelectedRowId(pendingRow.id);
    onRowSelect?.(pendingRow);
    setPendingRow(null);
  }, [pendingRow, onRowSelect]);
  const handleCancelRowSelect = useCallback(() => { setPendingRow(null); }, []);

  const handleCellRadioPress = useCallback((rowId: string, colKey: string, radioGroup: string, x: number, y: number) => {
    setPendingCellRadio({ rowId, columnKey: colKey, radioGroup, x, y });
  }, []);

  const confirmCellRadio = useCallback(() => {
    if (!pendingCellRadio) return;
    const { rowId, columnKey, radioGroup } = pendingCellRadio;
    setCellRadioValues(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(rid => {
        const rowCols = { ...next[rid] };
        columns.forEach(col => { if (col.radioGroup === radioGroup) rowCols[String(col.key)] = false; });
        next[rid] = rowCols;
      });
      next[rowId] = { ...(next[rowId] ?? {}), [columnKey]: true };
      return next;
    });
    onCellRadioChange?.(rowId, columnKey as keyof T, true);
    setPendingCellRadio(null);
  }, [pendingCellRadio, columns, onCellRadioChange]);

  const cancelCellRadio = useCallback(() => { setPendingCellRadio(null); }, []);

  const handleCellPress = useCallback((row: T, col: ColumnDef<T>) => {
    if (col.radioGroup) {
      handleCellRadioPress(row.id, String(col.key), col.radioGroup, 0, 0);
      return;
    }
    if (!col.editable) { onRowPress?.(row); return; }
    const strVal = formatCellValue(row[col.key]);
    if (col.editType === 'text') {
      setEditState({ rowId: row.id, columnKey: String(col.key), value: strVal });
    } else {
      setEditState({ rowId: row.id, columnKey: String(col.key), value: strVal });
      setEditModalCol(col);
      setEditModalVisible(true);
    }
  }, [handleCellRadioPress, onRowPress]);

  const handleEditConfirm = useCallback(() => {
    if (!editState) return;
    const row = data.find(r => r.id === editState.rowId);
    const oldVal = row ? formatCellValue(row[editState.columnKey as keyof T]) : '';
    onCellEdit?.(editState.rowId, editState.columnKey as keyof T, oldVal, editState.value);
    setEditState(null);
  }, [editState, data, onCellEdit]);

  const handleEditCancel = useCallback(() => { setEditState(null); setEditModalVisible(false); }, []);
  const handleEditChange = useCallback((text: string) => {
    setEditState(prev => prev ? { ...prev, value: text } : null);
  }, []);

  const commitEdit = useCallback((newValue: string) => {
    if (!editState) return;
    const row = data.find(r => r.id === editState.rowId);
    const oldVal = row ? formatCellValue(row[editState.columnKey as keyof T]) : '';
    onCellEdit?.(editState.rowId, editState.columnKey as keyof T, oldVal, newValue);
    setEditState(null); setEditModalVisible(false);
  }, [editState, data, onCellEdit]);

  const toggleColumnVisibility = useCallback((key: string) => {
    setVisibleKeys(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }, []);
  const resetColumnVisibility = useCallback(() => {
    setVisibleKeys(new Set(columns.map(c => String(c.key))));
  }, [columns]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }, []);
  const handleCollapseAll = useCallback(() => {
    if (groups) setCollapsedGroups(new Set(groups.keys()));
  }, [groups]);
  const handleExpandAll = useCallback(() => { setCollapsedGroups(new Set()); }, []);

  const handleDragStart = useCallback((rowId: string) => {
    const groupKey = groupBy ? (groups ? [...groups.entries()].find(([, rows]) => rows.some(r => r.id === rowId))?.[0] ?? '__flat__' : '__flat__') : '__flat__';
    setDragState({ rowId, groupKey });
  }, [groupBy, groups]);

  const handleDragUpdate = useCallback((rowId: string, translation: number) => {
    setDragTranslation(translation);
  }, []);

  const handleDragEnd = useCallback((rowId: string, translation: number) => {
    setRowOrders(prev => {
      const groupKey = dragState?.groupKey ?? '__flat__';
      const ids = [...(prev[groupKey] ?? data.map(r => r.id))];
      const fromIdx = ids.indexOf(rowId);
      const toIdx = Math.max(0, Math.min(ids.length - 1, fromIdx + Math.round(translation / ROW_HEIGHT)));
      ids.splice(fromIdx, 1); ids.splice(toIdx, 0, rowId);
      return { ...prev, [groupKey]: ids };
    });
    setDragState(null); setDragTranslation(0);
  }, [dragState, data]);

  const colWidths = useMemo(() => visibleColumns.map(c => c.width ?? DEFAULT_COL_WIDTH), [visibleColumns]);
  const totalWidth = DRAG_HANDLE_WIDTH + (rowSelection === 'radio' ? RADIO_COL_WIDTH : 0) + colWidths.reduce((a, b) => a + b, 0);

  const renderRows = useCallback((orderedIds: string[], rowMap: Map<string, T>, groupKey: string) => {
    const sortedIds = sortState.direction !== 'none'
      ? (() => { const rowsToSort = orderedIds.map(id => rowMap.get(id)).filter((r): r is T => r !== undefined); return sortRows(rowsToSort, sortState, columns).map(r => r.id); })()
      : orderedIds;

    return sortedIds.map((rowId, rowIndex) => {
      const row = rowMap.get(rowId);
      if (!row) return null;
      const isDragging = dragState?.rowId === rowId;
      const dragFromIdx = dragState ? orderedIds.indexOf(dragState.rowId) : -1;
      const currentIdx = orderedIds.indexOf(rowId);
      let shiftAmount = 0;
      if (dragState && dragState.groupKey === groupKey && !isDragging) {
        const toIdx = Math.max(0, Math.min(orderedIds.length - 1, dragFromIdx + Math.round(dragTranslation / ROW_HEIGHT)));
        if (dragFromIdx < toIdx && currentIdx > dragFromIdx && currentIdx <= toIdx) shiftAmount = -ROW_HEIGHT;
        else if (dragFromIdx > toIdx && currentIdx < dragFromIdx && currentIdx >= toIdx) shiftAmount = ROW_HEIGHT;
      }
      return (
        <DraggableRow key={rowId} row={row} rowIndex={rowIndex} visibleColumns={visibleColumns}
          zebraStriping={zebraStriping} isEditing={editState?.rowId === rowId} editState={editState}
          selectedRowId={selectedRowId} cellRadioValues={cellRadioValues} pendingCellRadio={pendingCellRadio}
          showRowRadio={rowSelection === 'radio'} colors={colors} baseStyles={baseStyles}
          fontSize={fontSize} paddingH={paddingH} paddingV={paddingV} colWidths={colWidths}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}
          onRowRadioPress={handleRowRadioPress} onCellRadioPress={handleCellRadioPress}
          onCellPress={handleCellPress} onEditConfirm={handleEditConfirm} onEditCancel={handleEditCancel}
          onEditChange={handleEditChange} isDragging={isDragging}
          dragTranslation={isDragging ? dragTranslation : 0} shiftAmount={shiftAmount}
        />
      );
    });
  }, [sortState, columns, dragState, dragTranslation, visibleColumns, zebraStriping, editState,
      selectedRowId, cellRadioValues, pendingCellRadio, rowSelection, colors, baseStyles,
      fontSize, paddingH, paddingV, colWidths, handleDragStart, handleDragEnd, handleDragUpdate,
      handleRowRadioPress, handleCellRadioPress, handleCellPress, handleEditConfirm, handleEditCancel, handleEditChange]);

  const renderHeader = () => (
    <View style={[baseStyles.headerRow, headerStyle, { width: totalWidth }]}>
      <View style={{ width: DRAG_HANDLE_WIDTH }} />
      {rowSelection === 'radio' && <View style={{ width: RADIO_COL_WIDTH }} />}
      {visibleColumns.map((col, ci) => {
        const key = String(col.key);
        const isActive = sortState.key === key && sortState.direction !== 'none';
        return (
          <TouchableOpacity key={key}
            style={[baseStyles.headerCell, { width: colWidths[ci], paddingHorizontal: paddingH, height: ROW_HEIGHT }, isActive && baseStyles.headerCellActive]}
            onPress={() => handleHeaderPress(key, col.sortable)} activeOpacity={col.sortable ? 0.7 : 1}>
            <Text style={[baseStyles.headerCellText, { fontSize }]}>
              {col.label}{isActive ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const rowMap = useMemo(() => { const m = new Map<string, T>(); for (const r of data) m.set(r.id, r); return m; }, [data]);
  const groupCount = groups ? groups.size : 0;
  const rowCountLabel = groups ? data.length + ' rows / ' + groupCount + ' groups' : data.length + ' rows';
  const handleScrollViewPress = useCallback(() => { if (pendingCellRadio) setPendingCellRadio(null); }, [pendingCellRadio]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={[baseStyles.container, tableStyle]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={baseStyles.toolbar}>
          <View style={baseStyles.toolbarLeft}><Text style={baseStyles.toolbarText}>{rowCountLabel}</Text></View>
          <View style={baseStyles.toolbarRight}>
            {groupBy && (
              <>
                <TouchableOpacity style={baseStyles.toolbarButton} onPress={handleCollapseAll}><Text style={baseStyles.toolbarButtonText}>Collapse all</Text></TouchableOpacity>
                <TouchableOpacity style={baseStyles.toolbarButton} onPress={handleExpandAll}><Text style={baseStyles.toolbarButtonText}>Expand all</Text></TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={baseStyles.toolbarButton} onPress={() => setColModalVisible(true)}><Text style={baseStyles.toolbarButtonText}>Columns</Text></TouchableOpacity>
          </View>
        </View>

        <ScrollView style={baseStyles.scrollContainer} onTouchStart={handleScrollViewPress}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: totalWidth }}>
              {renderHeader()}
              {!groups
                ? renderRows(rowOrders['__flat__'] ?? data.map(r => r.id), rowMap, '__flat__')
                : Array.from(groups.entries()).map(([groupKey, groupRows]) => {
                    const label = groupBy?.getGroupLabel ? groupBy.getGroupLabel(groupKey) : groupKey;
                    const isCollapsed = collapsedGroups.has(groupKey);
                    const orderedIds = rowOrders[groupKey] ?? groupRows.map(r => r.id);
                    return (
                      <GroupHeader key={groupKey} label={label} rowCount={groupRows.length}
                        collapsed={isCollapsed} onToggle={() => toggleGroup(groupKey)}
                        fontSize={fontSize} paddingH={paddingH}>
                        {renderRows(orderedIds, rowMap, groupKey)}
                      </GroupHeader>
                    );
                  })
              }
            </View>
          </ScrollView>
        </ScrollView>

        {pendingCellRadio && <CellRadioPopover x={pendingCellRadio.x + 40} y={pendingCellRadio.y + 80} onYes={confirmCellRadio} onNo={cancelCellRadio} />}
        {rowSelection === 'radio' && <ConfirmationBar row={pendingRow} onConfirm={handleConfirmRowSelect} onCancel={handleCancelRowSelect} />}
        <ColumnVisibilityModal visible={colModalVisible} columns={columns} visibleKeys={visibleKeys} onToggle={toggleColumnVisibility} onReset={resetColumnVisibility} onClose={() => setColModalVisible(false)} />
        <EditModal visible={editModalVisible} column={editModalCol} currentValue={editState?.value ?? ''} onSave={commitEdit} onCancel={handleEditCancel} />
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}