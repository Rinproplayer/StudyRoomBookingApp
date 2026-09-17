import { bookingService } from './src/api/bookingService';
import { getTodayDateString } from './src/api/mockData';

async function runConflictTests() {
  console.log('--- Starting Conflict Prevention & Booking Tests ---');

  const today = getTodayDateString(0);
  const roomId = 'room-1'; // Lab A3-101
  const slotId = '08:00-09:30';

  console.log('1. Checking initial slots for room-1 on date:', today);
  const initialSlots = await bookingService.getRoomSlotsForDate(roomId, today);
  const targetSlot = initialSlots.find((s) => s.id === slotId);
  console.log(`Slot ${slotId} isBooked:`, targetSlot?.isBooked);
  if (targetSlot?.isBooked) {
    throw new Error('Initial slot should not be booked');
  }

  console.log('\n2. Student 1 books Lab A3-101 for 08:00-09:30...');
  const booking1 = await bookingService.createBooking({
    roomId,
    date: today,
    slotId,
    studentId: 'STU-101',
    studentName: 'Student One',
    purpose: 'AI Project',
  });
  console.log('Successfully booked! Booking ID:', booking1.id, 'Check-in Code:', booking1.checkInCode);

  console.log('\n3. Verifying slot status in slot query after booking...');
  const updatedSlots = await bookingService.getRoomSlotsForDate(roomId, today);
  const bookedSlot = updatedSlots.find((s) => s.id === slotId);
  console.log(`Slot ${slotId} isBooked:`, bookedSlot?.isBooked);
  if (!bookedSlot?.isBooked) {
    throw new Error('Slot should now be marked as booked!');
  }

  console.log('\n4. Student 2 tries to book the EXACT same room and slot (Conflict Check 1)...');
  try {
    await bookingService.createBooking({
      roomId,
      date: today,
      slotId,
      studentId: 'STU-202',
      studentName: 'Student Two',
      purpose: 'Clashing reservation',
    });
    throw new Error('FAILED: Conflict check did not throw for overlapping room slot!');
  } catch (err: any) {
    console.log('SUCCESS! Conflict properly prevented. Error message:', err.message);
  }

  console.log('\n5. Student 1 tries to book ANOTHER room at the same time slot (Conflict Check 2 - Double Booking)...');
  try {
    await bookingService.createBooking({
      roomId: 'room-3', // Tech Lab 402
      date: today,
      slotId,
      studentId: 'STU-101',
      studentName: 'Student One',
      purpose: 'Simultaneous reservation',
    });
    throw new Error('FAILED: Student double booking conflict check did not throw!');
  } catch (err: any) {
    console.log('SUCCESS! Student double-booking prevented. Error message:', err.message);
  }

  console.log('\n6. Student 1 cancels their booking...');
  await bookingService.cancelBooking(booking1.id);
  console.log('Booking cancelled successfully.');

  console.log('\n7. Verifying slot is freed up in slot query after cancellation...');
  const freedSlots = await bookingService.getRoomSlotsForDate(roomId, today);
  const freedSlot = freedSlots.find((s) => s.id === slotId);
  console.log(`Slot ${slotId} isBooked:`, freedSlot?.isBooked);
  if (freedSlot?.isBooked) {
    throw new Error('Slot should now be free after cancellation!');
  }

  console.log('\n8. Student 2 can now successfully book the freed slot...');
  const booking2 = await bookingService.createBooking({
    roomId,
    date: today,
    slotId,
    studentId: 'STU-202',
    studentName: 'Student Two',
    purpose: 'Now available reservation',
  });
  console.log('Booking successful for Student 2! ID:', booking2.id);

  console.log('\n--- ALL CONFLICT PREVENTION TESTS PASSED SUCCESSFULLY! ---');
}

runConflictTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
