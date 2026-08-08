export type MockUser = {
    id: string;
    name: string;
    email: string;
};
export declare const MOCK_USERS: MockUser[];
export declare function findMockUser(id: string): MockUser | undefined;
