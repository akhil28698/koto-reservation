import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f7ff',
      100: '#e4eaff',
      200: '#d1dcff',
      300: '#a6bbff',
      400: '#7b9aff',
      500: '#4c76ff',  // primary brand color
      600: '#3d5ecc',
      700: '#2e4799',
      800: '#1f2f66',
      900: '#101833',
    },
    accent: {
      50: '#fff7f5',
      100: '#ffe4e0',
      200: '#ffd1cc',
      300: '#ffa699',
      400: '#ff7b66',
      500: '#ff4c33',  // accent color
      600: '#cc3d29',
      700: '#992e1f',
      800: '#661f14',
      900: '#33100a',
    },
    success: {
      50: '#f0fff4',
      100: '#c6f6d5',
      200: '#9ae6b4',
      300: '#68d391',
      400: '#48bb78',
      500: '#38a169',
      600: '#2f855a',
      700: '#276749',
      800: '#22543d',
      900: '#1c4532',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Badge: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
      },
    }),
  },
});

export default theme;
