import React from 'react';
import { Modal, View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { ColumnDef } from './DataTable.types';
import { lightColors, darkColors } from './DataTable.styles';
type Props<T> = { visible: boolean; columns: ColumnDef<T>[]; visibleKeys: Set<string>; onToggle: (key: string) => void; onReset: () => void; onClose: () => void; };
export function ColumnVisibilityModal<T>({ visible, columns, visibleKeys, onToggle, onReset, onClose }: Props<T>) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const styles = createStyles(colors);
  const visibleCount = columns.filter(c => visibleKeys.has(String(c.key))).length;
  const lastVisibleKey = visibleCount === 1 ? String(columns.find(c => visibleKeys.has(String(c.key)))?.key ?? '') : null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Columns</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.list}>
            {columns.map(col => {
              const key = String(col.key);
              const isVisible = visibleKeys.has(key);
              const isDisabled = lastVisibleKey === key;
              return (
                <View key={key} style={styles.row}>
                  <Text style={[styles.colLabel, isDisabled && styles.disabled]}>{col.label}</Text>
                  <Switch value={isVisible} onValueChange={() => !isDisabled && onToggle(key)} disabled={isDisabled} trackColor={{ false:colors.disabled, true:colors.accent }} thumbColor="#FFFFFF" />
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.footer}><TouchableOpacity style={styles.resetBtn} onPress={onReset}><Text style={[styles.resetBtnText, { color:colors.accent }]}>Reset</Text></TouchableOpacity></View>
        </View>
      </View>
    </Modal>
  );
}
function createStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    overlay: { flex:1, backgroundColor:colors.modalOverlay, justifyContent:'center', alignItems:'center' },
    sheet: { width:320, maxHeight:'70%', backgroundColor:colors.surface, borderRadius:12, overflow:'hidden' },
    header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
    title: { fontSize:17, fontWeight:'700', color:colors.text },
    closeBtn: { padding:4 }, closeBtnText: { fontSize:16, color:colors.subText },
    list: { flexGrow:0 },
    row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
    colLabel: { fontSize:15, color:colors.text }, disabled: { color:colors.subText },
    footer: { padding:16, alignItems:'flex-end' },
    resetBtn: { paddingHorizontal:16, paddingVertical:8 }, resetBtnText: { fontSize:14, fontWeight:'600' },
  });
}