export interface Chair {
  id: number;
  tableId: number;
  isReserved: boolean;
  position: number;
  displayNumber: number;
}

export interface Table {
  id: number;
  chairs: Chair[];
  position: {
    row: number;
    col: number;
  };
}

export interface ReservationFormData {
  name: string;
  email: string;
  phoneNumber: string;
  specialInstructions?: string;
  date?: string;
  time?: string;
  selectedChairs?: number[];
}
