import { StyleSheet } from 'react-native';

export const RADIO_SIZE = 18;
export const RADIO_INNER_SIZE = 10;
export const RADIO_BORDER = 2;
export const ROW_HEIGHT = 48;
export const GROUP_HEADER_HEIGHT = 44;
export const DRAG_HANDLE_WIDTH = 32;
export const RADIO_COL_WIDTH = 44;
export const CONFIRMATION_BAR_HEIGHT = 56;
export const ACCENT_COLOR = '#4F6EF7';
export const ACCENT_TINT = 'rgba(79,110,247,0.10)';

export const lightColors = { background:'#FFFFFF', headerBg:'rgba(0,0,0,0.06)', groupHeaderBg:'rgba(0,0,0,0.09)', rowSeparator:'rgba(0,0,0,0.1)', zebraOdd:'rgba(0,0,0,0.04)', text:'#1A1A1A', subText:'#6B7280', border:'rgba(0,0,0,0.12)', accent:ACCENT_COLOR, accentTint:ACCENT_TINT, modalOverlay:'rgba(0,0,0,0.4)', surface:'#FFFFFF', disabled:'#D1D5DB', confirmBg:'#FFFFFF' };
export const darkColors = { background:'#111827', headerBg:'rgba(255,255,255,0.06)', groupHeaderBg:'rgba(255,255,255,0.09)', rowSeparator:'rgba(255,255,255,0.1)', zebraOdd:'rgba(255,255,255,0.04)', text:'#F9FAFB', subText:'#9CA3AF', border:'rgba(255,255,255,0.12)', accent:ACCENT_COLOR, accentTint:ACCENT_TINT, modalOverlay:'rgba(0,0,0,0.6)', surface:'#1F2937', disabled:'#374151', confirmBg:'#1F2937' };
export type ColorScheme = typeof lightColors;

export const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: { flex:1, backgroundColor:colors.background },
  toolbar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingVertical:8, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
  toolbarLeft: { flexDirection:'row', alignItems:'center', gap:8 },
  toolbarRight: { flexDirection:'row', alignItems:'center', gap:12 },
  toolbarText: { fontSize:13, color:colors.subText },
  toolbarButton: { paddingHorizontal:8, paddingVertical:4, borderRadius:4 },
  toolbarButtonText: { fontSize:13, color:colors.accent, fontWeight:'500' },
  scrollContainer: { flex:1 },
  headerRow: { flexDirection:'row', backgroundColor:colors.headerBg, borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator },
  headerCell: { justifyContent:'center', paddingHorizontal:12 },
  headerCellActive: { backgroundColor:colors.accentTint },
  headerCellText: { fontWeight:'600', color:colors.text },
  headerSortIndicator: { fontSize:10, color:colors.accent, marginLeft:4 },
  row: { flexDirection:'row', borderBottomWidth:0.5, borderBottomColor:colors.rowSeparator, minHeight:ROW_HEIGHT, alignItems:'center' },
  rowEditing: { borderWidth:1.5, borderColor:colors.accent },
  cell: { justifyContent:'center', paddingHorizontal:12, paddingVertical:8 },
  cellText: { color:colors.text },
  dragHandle: { width:DRAG_HANDLE_WIDTH, alignItems:'center', justifyContent:'center' },
  dragHandleText: { fontSize:16, color:colors.subText },
  radioCol: { width:RADIO_COL_WIDTH, alignItems:'center', justifyContent:'center' },
  radio: { width:RADIO_SIZE, height:RADIO_SIZE, borderRadius:RADIO_SIZE/2, borderWidth:RADIO_BORDER, borderColor:colors.accent, alignItems:'center', justifyContent:'center' },
  radioInner: { width:RADIO_INNER_SIZE, height:RADIO_INNER_SIZE, borderRadius:RADIO_INNER_SIZE/2, backgroundColor:colors.accent },
  textInput: { flex:1, borderWidth:0, color:colors.text, paddingHorizontal:4, paddingVertical:2, fontSize:14 },
  inlineEditActions: { flexDirection:'row', alignItems:'center', gap:4 },
  inlineEditBtn: { padding:4 },
  inlineEditBtnText: { fontSize:16 },
});