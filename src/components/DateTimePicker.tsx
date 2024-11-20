import React from 'react';
import {
  VStack,
  Text,
  Box,
  Grid,
  Input,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, addDays, isToday, startOfDay, parseISO } from 'date-fns';

interface DateTimePickerProps {
  selectedDate: Date;
  selectedTime: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  seatAvailability: {
    [key: string]: {
      [key: string]: {
        availableSeats: number;
        totalSeats: number;
      }
    }
  }
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  seatAvailability,
}) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const availableTimeSlots = seatAvailability[dateStr] || {};
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateStr = e.target.value;
    const [year, month, day] = selectedDateStr.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    onDateSelect(startOfDay(newDate));
  };

  const isPastTime = (time: string) => {
    if (!isToday(selectedDate)) return false;

    const [timeHour, timeMinute] = time.split(':');
    const timePeriod = time.split(' ')[1];
    let timeHourNum = parseInt(timeHour);
    if (timePeriod === 'PM' && timeHourNum !== 12) timeHourNum += 12;
    if (timePeriod === 'AM' && timeHourNum === 12) timeHourNum = 0;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const timeInMinutes = timeHourNum * 60 + parseInt(timeMinute);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    return timeInMinutes <= currentTimeInMinutes;
  };

  return (
    <Card 
      variant="outline" 
      bg={cardBg} 
      borderColor={borderColor}
      shadow="sm"
    >
      <CardHeader pb={0}>
        <Heading size="md">Select Date & Time</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box>
            <Text mb={2} fontWeight="medium" color="gray.600">Date</Text>
            <Input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              size="md"
              borderRadius="md"
            />
          </Box>

          <Box>
            <Text mb={2} fontWeight="medium" color="gray.600">Available Time Slots</Text>
            <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={4}>
              {Object.entries(availableTimeSlots).map(([time, { availableSeats, totalSeats }]) => {
                const isDisabled = availableSeats === 0;
                const isPast = isPastTime(time);
                const availabilityColor = isDisabled ? 'red.500' : availableSeats <= 2 ? 'orange.500' : 'green.500';

                return (
                  <Box
                    key={time}
                    onClick={() => !isDisabled && !isPast && onTimeSelect(time)}
                    cursor={isDisabled || isPast ? 'not-allowed' : 'pointer'}
                    bg={selectedTime === time ? 'blue.500' : isPast ? 'gray.100' : 'white'}
                    color={selectedTime === time ? 'white' : isPast ? 'gray.500' : 'black'}
                    borderWidth={1}
                    borderColor={selectedTime === time ? 'blue.500' : isPast ? 'gray.300' : 'gray.200'}
                    borderRadius="md"
                    p={3}
                    transition="all 0.2s"
                    _hover={!isDisabled && !isPast ? {
                      transform: 'translateY(-2px)',
                      shadow: 'md',
                      borderColor: 'blue.500'
                    } : {}}
                    opacity={isPast ? 0.8 : 1}
                  >
                    <VStack spacing={1} align="center">
                      <Text fontWeight="medium">{time}</Text>
                      <Text 
                        fontSize="sm" 
                        color={selectedTime === time ? 'white' : isPast ? 'red.400' : availabilityColor}
                      >
                        {isPast ? 'Past Time' : isDisabled ? 'Full' : `${availableSeats} seats`}
                      </Text>
                    </VStack>
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default DateTimePicker;
