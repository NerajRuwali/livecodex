/**
 * Helper function to generate a random alphanumeric room ID
 * Format: room-xxxxxx
 */
export const generateRoomId = () => {
    return 'room-' + Math.random().toString(36).substring(2, 8);
};
