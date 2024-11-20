import React, { useState } from 'react';
import {
  VStack,
  SimpleGrid,
  Button,
  Text,
  HStack,
  Circle,
  useToast,
  Box,
  Container,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';

interface PinPadProps {
  correctPin: string;
  onSuccess: () => void;
}

const PinPad: React.FC<PinPadProps> = ({ correctPin, onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleNumberClick = (number: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = () => {
    if (pin === correctPin) {
      toast({
        title: 'Access Granted',
        status: 'success',
        duration: 2000,
      });
      onSuccess();
    } else {
      toast({
        title: 'Incorrect PIN',
        description: 'Please try again',
        status: 'error',
        duration: 2000,
      });
      setPin('');
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          {/* Header */}
          <Flex align="center" gap={4}>
            <Box
              borderRadius="full"
              bg="accent.500"
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xl" fontWeight="bold" color="white">
                琴
              </Text>
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text 
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, accent.400, accent.600)"
                bgClip="text"
              >
                KOTO
              </Text>
              <Text fontSize="md" color="gray.600">
                Japanese Steak House
              </Text>
            </VStack>
          </Flex>

          {/* Login Box */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="lg"
            w="full"
            maxW="400px"
            boxShadow="sm"
          >
            <VStack spacing={6}>
              <Box p={2}>
                <FiLock size={24} />
              </Box>
              
              <Text fontSize="lg" fontWeight="medium">
                Enter PIN
              </Text>

              <HStack spacing={4} justify="center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Circle
                    key={i}
                    size="12px"
                    bg={i < pin.length ? 'brand.500' : 'gray.200'}
                  />
                ))}
              </HStack>

              <SimpleGrid columns={3} spacing={4} w="full">
                {numbers.map((num) => (
                  <Button
                    key={num}
                    h="60px"
                    fontSize="xl"
                    colorScheme={num === 'C' ? 'red' : num === '⌫' ? 'gray' : 'brand'}
                    variant={num === 'C' || num === '⌫' ? 'outline' : 'solid'}
                    onClick={() => {
                      if (num === 'C') handleClear();
                      else if (num === '⌫') handleDelete();
                      else handleNumberClick(num);
                    }}
                  >
                    {num}
                  </Button>
                ))}
              </SimpleGrid>

              <Button
                colorScheme="brand"
                size="lg"
                w="full"
                h="60px"
                isDisabled={pin.length !== 4}
                onClick={handleSubmit}
              >
                Login
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default PinPad;
