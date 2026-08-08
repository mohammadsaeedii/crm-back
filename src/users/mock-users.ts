export type MockUser = {
  id: string;
  name: string;
  email: string;
};

/** Hardcoded users available in the "Add user to company" dropdown */
export const MOCK_USERS: MockUser[] = [
  { id: 'mock-1', name: 'Ali Rezaei', email: 'ali.rezaei@example.com' },
  { id: 'mock-2', name: 'Sara Karimi', email: 'sara.karimi@example.com' },
  { id: 'mock-3', name: 'Reza Mohammadi', email: 'reza.m@example.com' },
  { id: 'mock-4', name: 'Neda Ahmadi', email: 'neda.a@example.com' },
  { id: 'mock-5', name: 'Hossein Jafari', email: 'hossein.j@example.com' },
  { id: 'mock-6', name: 'Maryam Hosseini', email: 'maryam.h@example.com' },
];

export function findMockUser(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}
