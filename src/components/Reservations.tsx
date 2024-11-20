import React, { useMemo, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Heading,
  Input,
  Select,
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Divider,
  Flex,
  ButtonGroup,
} from '@chakra-ui/react';
import { FiTrash2, FiUsers, FiPhone, FiMail, FiInfo, FiMapPin, FiCalendar, FiClock, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, parseISO, isBefore, isEqual, startOfDay, addDays, subDays } from 'date-fns';

interface ReservationsProps {
  reservations: Array<{
    id: string;
    date: string;
    time: string;
    name: string;
    phoneNumber: string;
    email?: string;
    specialInstructions?: string;
    selectedChairs: string[];
  }>;
  selectedDate: string;
  onDelete: (id: string) => void;
  onDateChange: (date: string) => void;
}

const Reservations: React.FC<ReservationsProps> = ({ 
  selectedDate, 
  reservations, 
  onDelete,
  onDateChange
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('white', 'gray.800');

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations].filter(res => res.date === selectedDate);

    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(res => {
        const isPast = isBefore(parseISO(res.date), startOfDay(now)) ||
          (isEqual(parseISO(res.date), startOfDay(now)) && res.time < format(now, 'hh:mm a'));
        return filterStatus === 'past' ? isPast : !isPast;
      });
    }

    return filtered.sort((a, b) => {
      const timeA = new Date(`1/1/2000 ${a.time}`);
      const timeB = new Date(`1/1/2000 ${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
  }, [reservations, selectedDate, filterStatus]);

  const getTableAndSeatNumbers = (chairs: string[]): string[] => {
    return chairs.map(chair => {
      const chairNum = parseInt(chair);
      const tableNum = Math.floor((chairNum - 1) / 8) + 1;
      const seatNum = (chairNum % 8) || 8;
      return `Hibachi ${tableNum}, Seat ${seatNum}`;
    });
  };

  const handleDelete = (id: string) => {
    setSelectedReservation(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (selectedReservation) {
      onDelete(selectedReservation);
      setSelectedReservation(null);
    }
    onClose();
  };

  const handlePreviousDay = () => {
    const prevDay = subDays(parseISO(selectedDate), 1);
    onDateChange(format(prevDay, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const nextDay = addDays(parseISO(selectedDate), 1);
    onDateChange(format(nextDay, 'yyyy-MM-dd'));
  };

  const handleTodayClick = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Box>
      {/* Header Section */}
      <Box 
        bg={headerBg} 
        p={6} 
        borderRadius="lg" 
        mb={6} 
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          {/* Date Selection */}
          <Flex 
            align="center" 
            justify="space-between"
            bg={cardBg}
            p={4}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              min={format(new Date(), 'yyyy-MM-dd')}
              w="auto"
            />
            <ButtonGroup size="sm" spacing={2}>
              <Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'upcoming' | 'past')}
                w="150px"
                size="sm"
              >
                <option value="all">All Reservations</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </Select>
            </ButtonGroup>
          </Flex>

          {/* Reservation Count and Filter Status */}
          <Flex 
            align="center" 
            justify="space-between"
            wrap="wrap"
            gap={4}
          >
            <HStack spacing={4}>
              <Badge 
                colorScheme={filteredReservations.length > 0 ? 'blue' : 'gray'}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="md"
                fontWeight="bold"
              >
                {filteredReservations.length} {filteredReservations.length === 1 ? 'Reservation' : 'Reservations'}
              </Badge>
              <Text 
                color={mutedColor} 
                fontSize="sm"
                fontWeight="medium"
              >
                {filterStatus === 'all' ? 'Showing all reservations' : 
                 filterStatus === 'upcoming' ? 'Showing upcoming reservations' : 
                 'Showing past reservations'}
              </Text>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Empty State */}
      {filteredReservations.length === 0 ? (
        <Box 
          textAlign="center" 
          py={12}
          px={6}
          bg={cardBg} 
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <Icon 
              as={FiCalendar} 
              boxSize={12} 
              color={accentColor} 
            />
            <VStack spacing={2}>
              <Heading size="md" color={textColor}>
                No Reservations Found
              </Heading>
              <Text color={mutedColor} maxW="md">
                {filterStatus === 'all' 
                  ? `There are no reservations scheduled for ${format(parseISO(selectedDate), 'MMMM d, yyyy')}` 
                  : `There are no ${filterStatus} reservations for this date`}
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                Try selecting a different date or adjusting the filter
              </Text>
            </VStack>
            <ButtonGroup size="sm" mt={4}>
              <Button
                colorScheme="blue"
                leftIcon={<FiCalendar />}
              >
                Pick Another Date
              </Button>
              {filterStatus !== 'all' && (
                <Button
                  variant="ghost"
                  onClick={() => setFilterStatus('all')}
                >
                  Show All Reservations
                </Button>
              )}
            </ButtonGroup>
          </VStack>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredReservations.map((reservation) => {
            const isPast = isBefore(parseISO(reservation.date), startOfDay(new Date())) ||
              (isEqual(parseISO(reservation.date), startOfDay(new Date())) && 
               reservation.time < format(new Date(), 'hh:mm a'));

            return (
              <Box
                key={reservation.id}
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={borderColor}
                bg={cardBg}
                position="relative"
                opacity={isPast ? 0.8 : 1}
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
              >
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FiClock} color={mutedColor} />
                        <Badge
                          colorScheme={isPast ? 'gray' : 'green'}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {reservation.time}
                        </Badge>
                      </HStack>
                      <Badge 
                        colorScheme={isPast ? 'gray' : 'blue'} 
                        variant="subtle"
                      >
                        {isPast ? 'Past Reservation' : 'Upcoming'}
                      </Badge>
                    </VStack>
                    <Tooltip label="Delete Reservation" hasArrow placement="top">
                      <IconButton
                        aria-label="Delete reservation"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(reservation.id)}
                      />
                    </Tooltip>
                  </HStack>

                  <Divider />

                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={FiUsers} color={mutedColor} />
                      <Text fontWeight="medium">{reservation.name}</Text>
                    </HStack>
                    
                    <Tooltip label="Phone Number" hasArrow>
                      <HStack>
                        <Icon as={FiPhone} color={mutedColor} />
                        <Text>{reservation.phoneNumber}</Text>
                      </HStack>
                    </Tooltip>

                    {reservation.email && (
                      <Tooltip label="Email" hasArrow>
                        <HStack>
                          <Icon as={FiMail} color={mutedColor} />
                          <Text>{reservation.email}</Text>
                        </HStack>
                      </Tooltip>
                    )}

                    <Box>
                      <HStack mb={2}>
                        <Icon as={FiMapPin} color={mutedColor} />
                        <Text fontWeight="medium">Seat Details</Text>
                      </HStack>
                      <VStack align="stretch" spacing={1} pl={6}>
                        {getTableAndSeatNumbers(reservation.selectedChairs).map((seat, index) => (
                          <Text key={index} fontSize="sm" color={textColor}>
                            {seat}
                          </Text>
                        ))}
                      </VStack>
                    </Box>

                    {reservation.specialInstructions && (
                      <Box>
                        <HStack mb={2}>
                          <Icon as={FiInfo} color={mutedColor} />
                          <Text fontWeight="medium">Special Instructions</Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor} pl={6}>
                          {reservation.specialInstructions}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Reservation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this reservation? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Reservations;
