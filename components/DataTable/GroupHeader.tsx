import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GROUP_HEADER_HEIGHT, lightColors, darkColors } from './DataTable.styles';
type Props = { label: string; rowCount: number; collapsed: boolean; onToggle: () => void; fontSize: number; paddingH: number; children: React.ReactNode; };
export function GroupHeader({ label, rowCount, collapsed, onToggle, fontSize, paddingH, children }: Props) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const measuredHeight = useRef<number>(0);
  const height = useSharedValue(collapsed ? 0 : -1);
  const isFirstLayout = useRef(true);
  const onChildLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h === 0) return;
    measuredHeight.current = h;
    if (isFirstLayout.current) { isFirstLayout.current = false; height.value = collapsed ? 0 : h; }
  }, [collapsed, height]);
  const handleToggle = useCallback(() => {
    const target = collapsed ? measuredHeight.current : 0;
    height.value = withTiming(target, { duration:250 });
    onToggle();
  }, [collapsed, height, onToggle]);
  const animatedStyle = useAnimatedStyle(() => {
    const h = height.value;
    if (h === -1) return { overflow:'hidden' };
    return { height:h, overflow:'hidden' };
  });
  const styles = createStyles(colors);
  return (
    <View>
      <TouchableOpacity style={[styles.header, { paddingHorizontal:paddingH }]} onPress={handleToggle} activeOpacity={0.7}>
        <Text style={styles.chevron}>{collapsed ? '▶' : '▼'}</Text>
        <Text style={[styles.label, { fontSize }]}>{label}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{rowCount}</Text></View>
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        <View onLayout={onChildLayout}>{children}</View>
      </Animated.View>
    </View>
  );
}
function createStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    header: { height:GROUP_HEADER_HEIGHT, flexDirection:'row', alignItems:'center', backgroundColor:colors.groupHeaderBg, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator, gap:8 },
    chevron: { fontSize:11, color:colors.subText },
    label: { fontWeight:'700', color:colors.text, flex:1 },
    badge: { backgroundColor:colors.border, borderRadius:10, paddingHorizontal:8, paddingVertical:2 },
    badgeText: { fontSize:12, fontWeight:'600', color:colors.subText },
  });
}