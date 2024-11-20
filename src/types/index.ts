export interface Chair {
  id: number;
  tableId: number;
  isReserved: boolean;
  position: number; // 1-8 for each table
}

export interface Table {
  id: number;
  chairs: Chair[];
  position: {
    row: number;
    col: number;
  };
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  name: string;
  phoneNumber: string;
  email?: string;
  specialInstructions?: string;
  selectedChairs: number[];
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface ReservationFormData {
  name: string;
  phoneNumber: string;
  email?: string;
  specialInstructions?: string;
  date: string;
  time: string;
  selectedChairs: number[];
}
