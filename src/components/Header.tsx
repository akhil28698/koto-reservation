import React from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
  useColorMode,
  IconButton,
  useColorModeValue,
  Spacer,
  HStack,
} from '@chakra-ui/react';
import { FiMoon, FiSun, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      as="header" 
      bg={bg} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
      shadow="sm"
    >
      <Flex 
        maxW="container.xl" 
        mx="auto" 
        px={4} 
        py={4} 
        align="center"
      >
        <Heading 
          size="md" 
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          Koto Reservations
        </Heading>
        <Spacer />
        <HStack spacing={2}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
          />
          <Button
            leftIcon={<FiLogOut />}
            onClick={onLogout}
            variant="ghost"
            colorScheme="red"
            size="md"
          >
            Logout
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
