import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { lightColors, darkColors } from './DataTable.styles';
type Props = { x: number; y: number; onYes: () => void; onNo: () => void; };
export function CellRadioPopover({ x, y, onYes, onNo }: Props) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  return (
    <View style={[styles.popover, { left:x, top:y, backgroundColor:colors.surface, borderColor:colors.border, shadowColor:'#000' }]}>
      <Text style={[styles.label, { color:colors.text }]}>Confirm selection?</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.yesBtn, { backgroundColor:colors.accent }]} onPress={onYes}><Text style={styles.yesBtnText}>Yes</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.noBtn, { borderColor:colors.border }]} onPress={onNo}><Text style={[styles.noBtnText, { color:colors.text }]}>No</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  popover: { position:'absolute', width:160, height:72, borderRadius:8, borderWidth:1, padding:8, shadowOffset:{width:0,height:2}, shadowOpacity:0.12, shadowRadius:6, elevation:8, zIndex:9999, justifyContent:'space-between' },
  label: { fontSize:12, fontWeight:'500' },
  actions: { flexDirection:'row', gap:6 },
  btn: { flex:1, paddingVertical:4, borderRadius:4, alignItems:'center' },
  yesBtn: {}, noBtn: { borderWidth:1 },
  yesBtnText: { fontSize:12, fontWeight:'600', color:'#FFFFFF' },
  noBtnText: { fontSize:12, fontWeight:'600' },
});