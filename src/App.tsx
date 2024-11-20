import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import ReservationSystem from './components/ReservationSystem';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ReservationSystem />
    </ChakraProvider>
  );
}

export default App;
