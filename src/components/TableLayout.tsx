import React, { CSSProperties, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Circle,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Center,
  Card,
  CardHeader,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { format } from 'date-fns';

interface TableLayoutProps {
  selectedDate: Date;
  selectedTime: string;
  selectedChairs: number[];
  onChairSelect: (chairId: number) => void;
  reservations: Array<{
    date: string;
    time: string;
    selectedChairs: string[];
  }>;
}

interface Chair {
  id: number;
  displayNumber: number;
  isReserved: boolean;
  position: number;
  tableId: number;
}

interface Table {
  id: number;
  chairs: Chair[];
  position: {
    row: number;
    col: number;
  };
}

type TablePair = [Table, Table];

const TableLayout: React.FC<TableLayoutProps> = ({
  selectedDate,
  selectedTime,
  selectedChairs,
  onChairSelect,
  reservations,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const chairSize = "30px";

  // Get all reserved chairs for the current date and time
  const getReservedChairs = useCallback(() => {
    const selectedTimeComponents = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!selectedTimeComponents) return [];

    const [_, selectedHour, selectedMinute, selectedPeriod] = selectedTimeComponents;
    let hours = parseInt(selectedHour);
    if (selectedPeriod.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (selectedPeriod.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const selectedTimeInMinutes = hours * 60 + parseInt(selectedMinute);

    return reservations
      .filter(reservation => {
        // First check if it's the same date
        const sameDate = reservation.date === format(selectedDate, 'yyyy-MM-dd');
        if (!sameDate) return false;

        // Parse reservation time
        const resTimeComponents = reservation.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!resTimeComponents) return false;

        const [__, resHour, resMinute, resPeriod] = resTimeComponents;
        let resHours = parseInt(resHour);
        if (resPeriod.toUpperCase() === 'PM' && resHours !== 12) resHours += 12;
        if (resPeriod.toUpperCase() === 'AM' && resHours === 12) resHours = 0;
        const resTimeInMinutes = resHours * 60 + parseInt(resMinute);

        // Check if times overlap within 45-minute window
        const timeDiff = Math.abs(resTimeInMinutes - selectedTimeInMinutes);
        return timeDiff < 45;
      })
      .flatMap(res => res.selectedChairs);
  }, [selectedDate, selectedTime, reservations]);

  // Create tables data with React state to persist between renders
  const [tables, setTables] = useState<Table[]>(() => 
    Array.from({ length: 6 }, (_, tableIndex) => ({
      id: tableIndex + 1,
      chairs: Array.from({ length: 8 }, (_, chairIndex) => ({
        id: tableIndex * 8 + chairIndex + 1,
        displayNumber: chairIndex + 1,
        isReserved: false,
        position: chairIndex,
        tableId: tableIndex + 1
      })),
      position: {
        row: Math.floor(tableIndex / 2),
        col: tableIndex % 2
      }
    }))
  );

  // Update reserved chairs whenever dependencies change
  useEffect(() => {
    const reservedChairs = getReservedChairs();
    setTables(currentTables => 
      currentTables.map(table => ({
        ...table,
        chairs: table.chairs.map(chair => ({
          ...chair,
          isReserved: reservedChairs.includes(chair.id.toString())
        }))
      }))
    );
  }, [getReservedChairs, selectedDate, selectedTime, reservations]);

  // Group tables into pairs
  const tablePairs = useMemo(() => {
    const pairs: TablePair[] = [];
    for (let i = 0; i < tables.length; i += 2) {
      pairs.push([tables[i], tables[i + 1]] as TablePair);
    }
    return pairs;
  }, [tables]);

  const ChairComponent: React.FC<{
    chair: Chair;
    isSelected: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    tablePosition: number;
    chairIndex: number;
  }> = ({ chair, isSelected, position, tablePosition, chairIndex }) => {
    const getChairPosition = (): CSSProperties => {
      const basePosition = {
        position: 'absolute' as const,
        transition: 'all 0.2s'
      };

      // Calculate position based on chair index within its section (1-based)
      const spacing = 100 / 5; // Divide table width into 5 sections for 4 chairs

      switch (position) {
        case 'top':
        case 'bottom':
          // For top/bottom chairs (indices 0-3), use their position directly
          const horizontalPosition = chairIndex + 1;
          return {
            ...basePosition,
            [position]: '-35px',
            left: `${spacing * horizontalPosition}%`,
            transform: 'translateX(-50%)',
          };
        case 'left':
          // For left chairs (indices 4-5), map to vertical positions
          return {
            ...basePosition,
            left: '-35px',
            top: chairIndex === 4 ? '33%' : '66%',
            transform: 'translateY(-50%)',
          };
        case 'right':
          // For right chairs (indices 6-7), map to vertical positions
          return {
            ...basePosition,
            right: '-35px',
            top: chairIndex === 6 ? '33%' : '66%',
            transform: 'translateY(-50%)',
          };
        default:
          return basePosition;
      }
    };

    return (
      <Circle
        size={chairSize}
        bg={chair.isReserved ? "gray.500" : isSelected ? "accent.400" : "white"}
        border="2px solid"
        borderColor={chair.isReserved ? "gray.600" : isSelected ? "accent.500" : "brand.500"}
        cursor={chair.isReserved ? "not-allowed" : "pointer"}
        onClick={() => !chair.isReserved && onChairSelect(chair.id)}
        style={getChairPosition()}
        _hover={{
          transform: chair.isReserved ? "none" : "scale(1.1)",
          bg: chair.isReserved ? "gray.500" : isSelected ? "accent.400" : "gray.100"
        }}
        role="button"
        aria-label={`Chair ${chair.displayNumber}`}
        title={chair.isReserved ? "This seat is already reserved" : `Chair ${chair.displayNumber}`}
      >
        <Text fontSize="xs" fontWeight="bold">
          {chair.displayNumber}
        </Text>
      </Circle>
    );
  };

  const TableComponent: React.FC<{
    table: Table;
    isSecond?: boolean;
  }> = ({ table, isSecond = false }) => {
    return (
      <Box position="relative" w="300px" h="120px" mb={8}>
        <Box
          position="relative"
          w="100%"
          h="100%"
          borderWidth="2px"
          borderColor="brand.200"
          borderStyle="solid"
          borderRadius="sm"
          bg={useColorModeValue('white', 'gray.700')}
          _hover={{
            borderColor: 'brand.300',
            transform: 'translateY(-1px)',
            shadow: 'md',
          }}
          transition="all 0.2s"
        >
          <Text
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            fontSize="md"
            fontWeight="bold"
            color="gray.600"
          >
            Hibachi {table.id}
          </Text>
          <Center h="100%" fontSize="md" fontWeight="bold" color="brand.700">
            {/* Table {table.id} */}
          </Center>
        </Box>

        {/* Chairs */}
        {table.chairs.map((chair, index) => {
          let position: 'top' | 'bottom' | 'left' | 'right';
          if (index < 4) {
            position = isSecond ? 'bottom' : 'top';
          } else if (index < 6) {
            position = 'left';
          } else {
            position = 'right';
          }
          
          return (
            <ChairComponent
              key={chair.id}
              chair={chair}
              isSelected={selectedChairs.includes(chair.id)}
              position={position}
              tablePosition={table.id}
              chairIndex={index}
            />
          );
        })}
      </Box>
    );
  };

  const TablePairComponent: React.FC<{
    tables: TablePair;
  }> = ({ tables: [table1, table2] }) => (
    <Box
      position="relative"
      p={8}
      borderRadius="lg"
      _after={{
        content: '""',
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: '2px',
        bg: 'brand.100',
        transform: 'translateY(-50%)',
      }}
    >
      <VStack spacing={12}>
        <TableComponent table={table1} />
        <TableComponent table={table2} isSecond={true} />
      </VStack>
    </Box>
  );

  return (
    <Card variant="outline" bg={cardBg} borderColor={borderColor} shadow="sm">
      <CardHeader>
        <Heading size="md" textAlign="center">Select Your Seats</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={8} align="stretch">
          <Box overflow="visible" mx="auto" w="full">
            <VStack spacing={8}>
              <HStack spacing={4} align="flex-start" justify="center" w="full">
                <TablePairComponent tables={tablePairs[0]} />
                <TablePairComponent tables={tablePairs[1]} />
              </HStack>
              <Center w="full">
                <TablePairComponent tables={tablePairs[2]} />
              </Center>
            </VStack>
          </Box>

          {/* Legend */}
          <HStack spacing={8} justify="center" bg={useColorModeValue('white', 'gray.700')} p={4} borderRadius="md" shadow="sm">
            <HStack>
              <Circle size="16px" bg={useColorModeValue('white', 'gray.600')} border="2px solid" borderColor="brand.500" />
              <Text fontSize="sm">Available</Text>
            </HStack>
            <HStack>
              <Circle size="16px" bg="accent.400" />
              <Text fontSize="sm">Selected</Text>
            </HStack>
            <HStack>
              <Circle size="16px" bg="gray.400" />
              <Text fontSize="sm">Reserved</Text>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TableLayout;
