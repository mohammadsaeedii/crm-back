"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_USERS = void 0;
exports.findMockUser = findMockUser;
exports.MOCK_USERS = [
    { id: 'mock-1', name: 'Ali Rezaei', email: 'ali.rezaei@example.com' },
    { id: 'mock-2', name: 'Sara Karimi', email: 'sara.karimi@example.com' },
    { id: 'mock-3', name: 'Reza Mohammadi', email: 'reza.m@example.com' },
    { id: 'mock-4', name: 'Neda Ahmadi', email: 'neda.a@example.com' },
    { id: 'mock-5', name: 'Hossein Jafari', email: 'hossein.j@example.com' },
    { id: 'mock-6', name: 'Maryam Hosseini', email: 'maryam.h@example.com' },
];
function findMockUser(id) {
    return exports.MOCK_USERS.find((u) => u.id === id);
}
//# sourceMappingURL=mock-users.js.map