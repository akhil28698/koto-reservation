import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  Textarea,
  Text,
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ReservationFormData } from '../types';

interface ReservationFormProps {
  selectedDate: Date;
  selectedTime: string;
  selectedChairs: number[];
  onSubmit: (data: ReservationFormData) => void;
}

interface FormValues {
  name: string;
  email: string;
  phoneNumber: string;
  specialInstructions: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(
      /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Invalid phone number'
    ),
  specialInstructions: Yup.string(),
});

const ReservationForm: React.FC<ReservationFormProps> = ({
  selectedDate,
  selectedTime,
  selectedChairs,
  onSubmit,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const initialValues: FormValues = {
    name: '',
    email: '',
    phoneNumber: '',
    specialInstructions: '',
  };

  if (selectedChairs.length === 0) {
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="md" color="gray.600">
          Please select at least one seat to make a reservation
        </Text>
      </VStack>
    );
  }

  return (
    <Card 
      variant="outline" 
      bg={cardBg} 
      borderColor={borderColor}
      shadow="sm"
      width="100%"
    >
      <CardHeader pb={2}>
        <Heading size="md">Reservation Details</Heading>
      </CardHeader>
      <CardBody>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            onSubmit({
              ...values,
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime,
              selectedChairs,
            });
            actions.setSubmitting(false);
          }}
        >
          {(props: FormikProps<FormValues>) => (
            <Form>
              <VStack spacing={4} align="stretch">
                <Field name="name">
                  {({ field, form }: FieldProps<string, FormValues>) => (
                    <FormControl isInvalid={!!form.errors.name && !!form.touched.name}>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <Input {...field} id="name" placeholder="Enter your name" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="email">
                  {({ field, form }: FieldProps<string, FormValues>) => (
                    <FormControl isInvalid={!!form.errors.email && !!form.touched.email}>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input {...field} id="email" placeholder="Enter your email" />
                      <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="phoneNumber">
                  {({ field, form }: FieldProps<string, FormValues>) => (
                    <FormControl isInvalid={!!form.errors.phoneNumber && !!form.touched.phoneNumber}>
                      <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                      <Input {...field} id="phoneNumber" placeholder="Enter your phone number" />
                      <FormErrorMessage>{form.errors.phoneNumber}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="specialInstructions">
                  {({ field, form }: FieldProps<string, FormValues>) => (
                    <FormControl isInvalid={!!form.errors.specialInstructions && !!form.touched.specialInstructions}>
                      <FormLabel htmlFor="specialInstructions">Special Instructions (Optional)</FormLabel>
                      <Textarea
                        {...field}
                        id="specialInstructions"
                        placeholder="Any special requests?"
                        resize="vertical"
                      />
                      <FormErrorMessage>{form.errors.specialInstructions}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Text fontSize="sm" color="gray.600">
                  Selected Seats: {selectedChairs.map(id => `Table ${Math.floor((id - 1) / 8) + 1} Seat ${((id - 1) % 8) + 1}`).join(', ')}
                </Text>

                <Text fontSize="sm" color="gray.600">
                  Date: {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </Text>

                <Button
                  mt={4}
                  colorScheme="brand"
                  isLoading={props.isSubmitting}
                  type="submit"
                  width="100%"
                >
                  Complete Reservation
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
};

export default ReservationForm;
