import React, { useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { ColumnDef } from './DataTable.types';
import { lightColors, darkColors } from './DataTable.styles';

type Props<T> = { visible: boolean; column: ColumnDef<T>|null; currentValue: string; onSave: (newValue: string) => void; onCancel: () => void; };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function parseDateValue(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) { const now = new Date(); return { day:now.getDate(), month:now.getMonth()+1, year:now.getFullYear() }; }
  return { day:d.getUTCDate(), month:d.getUTCMonth()+1, year:d.getUTCFullYear() };
}
const ITEM_HEIGHT = 40;
type WheelProps = { items: string[]; selectedIndex: number; onSelect: (index: number) => void; colors: typeof lightColors; };
function Wheel({ items, selectedIndex, onSelect, colors }: WheelProps) {
  return (
    <ScrollView style={{ height:ITEM_HEIGHT*3 }} showsVerticalScrollIndicator={false} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" contentOffset={{ x:0, y:selectedIndex*ITEM_HEIGHT }} onMomentumScrollEnd={e => { const idx = Math.round(e.nativeEvent.contentOffset.y/ITEM_HEIGHT); onSelect(Math.max(0,Math.min(idx,items.length-1))); }}>
      {items.map((item,i) => (
        <TouchableOpacity key={i} style={[wStyles.item, i===selectedIndex && { backgroundColor:colors.accentTint }]} onPress={() => onSelect(i)}>
          <Text style={[wStyles.itemText, { color:i===selectedIndex ? colors.accent : colors.text }]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const wStyles = StyleSheet.create({ item:{ height:ITEM_HEIGHT, justifyContent:'center', alignItems:'center', paddingHorizontal:8 }, itemText:{ fontSize:15, fontWeight:'500' } });

export function EditModal<T>({ visible, column, currentValue, onSave, onCancel }: Props<T>) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const styles = createStyles(colors);
  const [selectedOption, setSelectedOption] = useState<string>(currentValue);
  const parsed = parseDateValue(currentValue);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length:30 }, (_,i) => String(currentYear-29+i));
  const days = Array.from({ length:31 }, (_,i) => String(i+1).padStart(2,'0'));
  const [dateDay, setDateDay] = useState(parsed.day-1);
  const [dateMonth, setDateMonth] = useState(parsed.month-1);
  const [dateYear, setDateYear] = useState(years.indexOf(String(parsed.year)));
  const handleSave = useCallback(() => {
    if (!column) return;
    if (column.editType === 'dropdown') { onSave(selectedOption); }
    else if (column.editType === 'date') {
      const y = years[Math.max(0,dateYear)]; const m = String(Math.min(dateMonth,11)+1).padStart(2,'0'); const d = String(Math.min(dateDay,30)+1).padStart(2,'0');
      onSave(y + '-' + m + '-' + d);
    }
  }, [column, selectedOption, dateDay, dateMonth, dateYear, years, onSave]);
  React.useEffect(() => {
    if (visible) {
      setSelectedOption(currentValue);
      const p = parseDateValue(currentValue);
      setDateDay(p.day-1); setDateMonth(p.month-1);
      setDateYear(years.indexOf(String(p.year)) >= 0 ? years.indexOf(String(p.year)) : years.length-1);
    }
  }, [visible]);
  if (!column) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}><Text style={styles.title}>Edit {column.label}</Text></View>
          {column.editType === 'dropdown' && (
            <ScrollView style={styles.optionList}>
              {(column.editOptions ?? []).map(opt => (
                <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => setSelectedOption(opt)}>
                  <View style={[styles.radioCircle, { borderColor:colors.accent }]}>{selectedOption===opt && <View style={[styles.radioFill, { backgroundColor:colors.accent }]} />}</View>
                  <Text style={[styles.optionText, { color:colors.text }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {column.editType === 'date' && (
            <View style={styles.datePickerRow}>
              <View style={styles.wheelContainer}><Text style={[styles.wheelLabel, { color:colors.subText }]}>Day</Text><Wheel items={days} selectedIndex={dateDay} onSelect={setDateDay} colors={colors} /></View>
              <View style={styles.wheelContainer}><Text style={[styles.wheelLabel, { color:colors.subText }]}>Month</Text><Wheel items={MONTHS} selectedIndex={dateMonth} onSelect={setDateMonth} colors={colors} /></View>
              <View style={styles.wheelContainer}><Text style={[styles.wheelLabel, { color:colors.subText }]}>Year</Text><Wheel items={years} selectedIndex={dateYear>=0?dateYear:years.length-1} onSelect={setDateYear} colors={colors} /></View>
            </View>
          )}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={[styles.cancelBtnText, { color:colors.text }]}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor:colors.accent }]} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function createStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    overlay: { flex:1, backgroundColor:colors.modalOverlay, justifyContent:'flex-end' },
    sheet: { backgroundColor:colors.surface, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:'70%' },
    header: { paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
    title: { fontSize:17, fontWeight:'700', color:colors.text },
    optionList: { flexGrow:0 },
    optionRow: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14, gap:12, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
    radioCircle: { width:18, height:18, borderRadius:9, borderWidth:2, alignItems:'center', justifyContent:'center' },
    radioFill: { width:10, height:10, borderRadius:5 },
    optionText: { fontSize:15 },
    datePickerRow: { flexDirection:'row', paddingHorizontal:8, paddingVertical:12, gap:4 },
    wheelContainer: { flex:1, alignItems:'center' },
    wheelLabel: { fontSize:12, fontWeight:'600', marginBottom:6 },
    footer: { flexDirection:'row', padding:16, gap:12, borderTopWidth:0.5, borderTopColor:colors.rowSeparator },
    cancelBtn: { flex:1, paddingVertical:12, alignItems:'center', borderRadius:8, borderWidth:1, borderColor:colors.border },
    cancelBtnText: { fontSize:15, fontWeight:'600' },
    saveBtn: { flex:1, paddingVertical:12, alignItems:'center', borderRadius:8 },
    saveBtnText: { fontSize:15, fontWeight:'600', color:'#FFFFFF' },
  });
}