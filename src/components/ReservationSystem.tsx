import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorMode,
  Tabs,
  TabList,
  Tab,
  useToast,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';
import DateTimePicker from './DateTimePicker';
import TableLayout from './TableLayout';
import ReservationForm from './ReservationForm';
import PinPad from './PinPad';
import Reservations from './Reservations';
import Header from './Header';
import { format, startOfDay, parseISO, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { FiCalendar } from 'react-icons/fi';

interface SystemReservation {
  id: string;
  date: string;
  time: string;
  name: string;
  phoneNumber: string;
  email?: string;
  specialInstructions?: string;
  selectedChairs: string[];
}

interface ReservationFormData {
  name: string;
  email?: string;
  phoneNumber: string;
  specialInstructions?: string;
}

interface SeatAvailability {
  [date: string]: {
    [time: string]: {
      availableSeats: number;
      totalSeats: number;
    };
  };
}

const ReservationSystem: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedChairs, setSelectedChairs] = useState<number[]>([]);
  const [reservations, setReservations] = useState<SystemReservation[]>(() => {
    const savedReservations = localStorage.getItem('reservations');
    return savedReservations ? JSON.parse(savedReservations) : [];
  });
  const [seatAvailability, setSeatAvailability] = useState<SeatAvailability>({});
  const [viewDate, setViewDate] = useState<Date>(() => startOfDay(new Date()));
  const toast = useToast();

  // Reset form function
  const resetForm = () => {
    setSelectedChairs([]);
    setSelectedTime('');
  };

  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  const getBusinessHours = (date: Date) => {
    const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    switch (day) {
      case 0: // Sunday
        return [{ start: '12:00 PM', end: '9:30 PM' }];
      case 6: // Saturday
        return [{ start: '11:00 AM', end: '10:00 PM' }];
      case 5: // Friday
        return [
          { start: '11:00 AM', end: '2:30 PM' },
          { start: '4:30 PM', end: '10:00 PM' }
        ];
      case 1: // Monday
      case 2: // Tuesday
      case 3: // Wednesday
      case 4: // Thursday
        return [
          { start: '11:00 AM', end: '2:30 PM' },
          { start: '4:30 PM', end: '9:30 PM' }
        ];
      default:
        return [];
    }
  };

  const generateTimeSlots = (date: Date) => {
    const businessHours = getBusinessHours(date);
    const slots: string[] = [];

    businessHours.forEach(({ start, end }) => {
      let [startHour, startMinute] = start.split(':');
      const startPeriod = start.split(' ')[1];
      let currentHourNum = parseInt(startHour);
      let currentMinuteNum = parseInt(startMinute);

      const [endHour, endMinute] = end.split(':');
      const endPeriod = end.split(' ')[1];
      let endHourNum = parseInt(endHour);
      if (endPeriod === 'PM' && endHourNum !== 12) endHourNum += 12;
      if (endPeriod === 'AM' && endHourNum === 12) endHourNum = 0;
      if (startPeriod === 'PM' && currentHourNum !== 12) currentHourNum += 12;
      if (startPeriod === 'AM' && currentHourNum === 12) currentHourNum = 0;

      // Convert end time minutes to proper format
      const endMinuteNum = parseInt(endMinute);
      const endTimeInMinutes = endHourNum * 60 + endMinuteNum;

      while (true) {
        const currentTimeInMinutes = currentHourNum * 60 + currentMinuteNum;
        if (currentTimeInMinutes >= endTimeInMinutes) break;

        const timeString = format(
          new Date(2000, 0, 1, currentHourNum, currentMinuteNum),
          'hh:mm a'
        );

        slots.push(timeString);

        currentMinuteNum += 45;
        if (currentMinuteNum >= 60) {
          currentHourNum += Math.floor(currentMinuteNum / 60);
          currentMinuteNum %= 60;
        }
      }
    });

    // Sort slots chronologically
    return slots.sort((a, b) => {
      const timeA = new Date(`1/1/2000 ${a}`);
      const timeB = new Date(`1/1/2000 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });
  };

  useEffect(() => {
    const newAvailability: SeatAvailability = {};
    const TOTAL_SEATS = 48; // Total seats in the restaurant

    // Initialize availability for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      newAvailability[dateStr] = {};

      // Generate time slots for this date based on business hours
      const timeSlots = generateTimeSlots(date);
      timeSlots.forEach(time => {
        const reservationsForSlot = reservations.filter(
          r => r.date === dateStr && r.time === time
        );

        const reservedSeats = reservationsForSlot.reduce(
          (total, res) => total + res.selectedChairs.length,
          0
        );

        newAvailability[dateStr][time] = {
          availableSeats: TOTAL_SEATS - reservedSeats,
          totalSeats: TOTAL_SEATS
        };
      });
    }

    setSeatAvailability(newAvailability);
  }, [selectedDate, reservations]);

  const getReservedChairs = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return reservations
      .filter(res => {
        const resDate = new Date(res.date);
        const sameDate = 
          resDate.getFullYear() === selectedDate.getFullYear() &&
          resDate.getMonth() === selectedDate.getMonth() &&
          resDate.getDate() === selectedDate.getDate();

        // Parse times to compare
        const [resHours, resMinutes] = res.time.split(':').map(Number);
        const [selHours, selMinutes] = selectedTime.split(':').map(Number);
        
        // Check if times overlap (within 2 hours)
        const reservationTimeInMinutes = resHours * 60 + resMinutes;
        const selectedTimeInMinutes = selHours * 60 + selMinutes;
        const timeDifferenceInMinutes = Math.abs(reservationTimeInMinutes - selectedTimeInMinutes);
        const timeOverlaps = timeDifferenceInMinutes <= 120; // 2 hours

        return sameDate && timeOverlaps;
      })
      .flatMap(res => res.selectedChairs.map(Number));
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab(0);
    resetForm();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleChairSelect = (chairId: number) => {
    const reservedChairs = getReservedChairs();
    
    // If the chair is already reserved, don't allow selection
    if (reservedChairs.includes(chairId)) {
      toast({
        title: "Seat unavailable",
        description: "This seat is already reserved for this time slot.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedChairs(prevChairs => {
      if (prevChairs.includes(chairId)) {
        return prevChairs.filter(id => id !== chairId);
      } else {
        return [...prevChairs, chairId];
      }
    });
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setSelectedChairs([]); // Clear selected chairs when time changes
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedChairs([]); // Clear selected chairs when date changes
  };

  const handleSubmit = (formData: ReservationFormData) => {
    const newReservation: SystemReservation = {
      id: uuidv4(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      specialInstructions: formData.specialInstructions,
      selectedChairs: selectedChairs.map(String)
    };

    // Update reservations state and localStorage
    setReservations(prev => {
      const updatedReservations = [...prev, newReservation];
      localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      return updatedReservations;
    });

    // Update seat availability immediately
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setSeatAvailability(prev => {
      const newAvailability = { ...prev };
      if (!newAvailability[dateStr]) {
        newAvailability[dateStr] = {};
      }
      if (!newAvailability[dateStr][selectedTime]) {
        newAvailability[dateStr][selectedTime] = {
          availableSeats: 48 - selectedChairs.length,
          totalSeats: 48
        };
      } else {
        newAvailability[dateStr][selectedTime].availableSeats -= selectedChairs.length;
      }
      return newAvailability;
    });

    toast({
      title: "Reservation created.",
      description: "Your reservation has been successfully created.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Reset form and switch to view reservations
    setActiveTab(1);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setReservations(reservations.filter(r => r.id !== id));
  };

  const handleDateChange = (dateStr: string) => {
    setViewDate(parseISO(dateStr));
  };

  const renderContent = () => {
    if (activeTab === 0) {
      return (
        <Box>
          <DateTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            seatAvailability={seatAvailability}
          />
          {selectedDate && selectedTime && (
            <>
              <TableLayout
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedChairs={selectedChairs}
                onChairSelect={handleChairSelect}
                reservations={reservations.map(res => ({
                  date: res.date,
                  time: res.time,
                  selectedChairs: res.selectedChairs
                }))}
              />
              <ReservationForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedChairs={selectedChairs}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </Box>
      );
    } else {
      return (
        <Reservations
          selectedDate={format(viewDate, 'yyyy-MM-dd')}
          reservations={reservations}
          onDelete={handleDelete}
          onDateChange={handleDateChange}
        />
      );
    }
  };

  const markReservedChairs = (reservations: SystemReservation[]) => {
    const newAvailability: SeatAvailability = {};
    const TOTAL_SEATS = 48; // Total seats in the restaurant

    // Initialize availability for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      newAvailability[dateStr] = {};

      // Generate time slots for this date based on business hours
      const timeSlots = generateTimeSlots(date);
      timeSlots.forEach(time => {
        const reservationsForSlot = reservations.filter(
          r => r.date === dateStr && r.time === time
        );

        const reservedSeats = reservationsForSlot.reduce(
          (total, res) => total + res.selectedChairs.length,
          0
        );

        newAvailability[dateStr][time] = {
          availableSeats: TOTAL_SEATS - reservedSeats,
          totalSeats: TOTAL_SEATS
        };
      });
    }

    setSeatAvailability(newAvailability);
  };

  return (
    <>
      {isAuthenticated && <Header onLogout={handleLogout} />}
      <Container maxW="container.xl" py={8}>
        {!isAuthenticated ? (
          <PinPad 
            correctPin="1234" 
            onSuccess={() => setIsAuthenticated(true)} 
          />
        ) : (
          <VStack spacing={6} align="stretch">
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>Make Reservation</Tab>
                <Tab>View Reservations</Tab>
              </TabList>
            </Tabs>
            {renderContent()}
          </VStack>
        )}
      </Container>
    </>
  );
};

export default ReservationSystem;
