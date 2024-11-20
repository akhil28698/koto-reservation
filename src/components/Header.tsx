import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Button,
  useColorMode,
  Image,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated, 
  onLogout,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box 
      as="header" 
      borderBottom="1px" 
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
      backdropFilter="blur(10px)"
      backgroundColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 32, 44, 0.8)'}
    >
      <Container maxW="container.xl">
        <Flex py={4} justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              borderRadius="md"
              bg={colorMode === 'light' ? 'blue.500' : 'blue.200'}
              color={colorMode === 'light' ? 'white' : 'gray.800'}
              px={3}
              py={2}
              fontWeight="bold"
              fontSize="xl"
            >
              琴
            </Box>
            <VStack spacing={0} align="start">
              <Heading size="md">Koto Japanese Steakhouse</Heading>
              <Text fontSize="sm" color="gray.500">Reservation System</Text>
            </VStack>
          </HStack>

          {isAuthenticated && (
            <HStack spacing={4}>
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
                {isMobile ? '' : 'Logout'}
              </Button>
            </HStack>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
