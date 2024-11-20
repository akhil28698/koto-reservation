import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f7fa',
      100: '#e4e7eb',
      200: '#cbd2d9',
      300: '#9aa5b1',
      400: '#7b8794',
      500: '#616e7c',
      600: '#52606d',
      700: '#3e4c59',
      800: '#323f4b',
      900: '#1f2933',
    },
    accent: {
      50: '#fff5f5',
      100: '#fed7d7',
      200: '#feb2b2',
      300: '#fc8181',
      400: '#f56565',
      500: '#e53e3e',
      600: '#c53030',
      700: '#9b2c2c',
      800: '#822727',
      900: '#63171b',
    },
  },
  fonts: {
    heading: '"Noto Sans JP", sans-serif',
    body: '"Open Sans", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
      },
    },
  },
});

export default theme;
