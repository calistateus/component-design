import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CONFIRMATION_BAR_HEIGHT, ACCENT_COLOR, lightColors, darkColors } from './DataTable.styles';
type Props<T extends { id: string; name: string }> = { row: T|null; onConfirm: () => void; onCancel: () => void; };
export function ConfirmationBar<T extends { id: string; name: string }>({ row, onConfirm, onCancel }: Props<T>) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const translateY = useSharedValue(CONFIRMATION_BAR_HEIGHT);
  useEffect(() => { translateY.value = withTiming(row ? 0 : CONFIRMATION_BAR_HEIGHT, { duration:250 }); }, [row, translateY]);
  const animatedStyle = useAnimatedStyle(() => ({ transform:[{ translateY:translateY.value }] }));
  const styles = createStyles(colors);
  return (
    <Animated.View style={[styles.bar, animatedStyle]}>
      <Text style={styles.message}>{row ? `Select ${row.name}?` : ''}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={[styles.btnText, { color:colors.accent, borderColor:colors.accent }]}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor:colors.accent }]} onPress={onConfirm}><Text style={[styles.btnText, { color:'#FFFFFF' }]}>Confirm</Text></TouchableOpacity>
      </View>
    </Animated.View>
  );
}
function createStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    bar: { position:'absolute', bottom:0, left:0, right:0, height:CONFIRMATION_BAR_HEIGHT, backgroundColor:colors.confirmBg, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, borderTopWidth:0.5, borderTopColor:colors.rowSeparator, shadowColor:'#000', shadowOffset:{width:0,height:-2}, shadowOpacity:0.08, shadowRadius:4, elevation:4 },
    message: { fontSize:15, fontWeight:'500', color:colors.text, flex:1 },
    actions: { flexDirection:'row', gap:8 },
    cancelBtn: { paddingHorizontal:16, paddingVertical:8, borderRadius:6, borderWidth:1, borderColor:ACCENT_COLOR },
    confirmBtn: { paddingHorizontal:16, paddingVertical:8, borderRadius:6 },
    btnText: { fontSize:14, fontWeight:'600' },
  });
}