import type {Theme as NavigationTheme} from '@react-navigation/native';

const colors = {
  primary: '#1F3A5F',
  primarySoft: '#E7EEF5',
  accent: '#6B7A90',
  background: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  border: '#D7E0EA',
  borderStrong: '#B9C6D5',
  text: '#142033',
  textMuted: '#5B6B7F',
  textSoft: '#7B899B',
  success: '#D9F2E3',
  warning: '#F7E7BF',
  danger: '#C94F4F',
  successStrong: '#1F8A4D',
  warningStrong: '#A56A00',
  overlay: 'rgba(20, 32, 51, 0.28)',
  white: '#FFFFFF',
};

export const theme = {
  colors,
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
  typography: {
    title: 28,
    section: 22,
    cardTitle: 17,
    body: 15,
    caption: 12,
  },
  shadows: {
    card: {
      shadowColor: '#10233E',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: {width: 0, height: 6},
      elevation: 2,
    },
    soft: {
      shadowColor: '#10233E',
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 3},
      elevation: 1,
    },
  },
};

export const navigationTheme: NavigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400'},
    medium: {fontFamily: 'System', fontWeight: '500'},
    bold: {fontFamily: 'System', fontWeight: '700'},
    heavy: {fontFamily: 'System', fontWeight: '800'},
  },
};
