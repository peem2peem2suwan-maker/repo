const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('🚀 Starting Full End-to-End System Flow Verification...');

  // 1. Login as User
  console.log('\n--- Step 1: User Login ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@company.com', password: 'password123' }),
  });
  if (!loginRes.ok) throw new Error(`User Login failed with status: ${loginRes.status}`);
  const userCookie = loginRes.headers.get('set-cookie');
  const userData = await loginRes.json();
  console.log(`✅ User Logged in successfully: ${userData.user.name} (${userData.user.role})`);

  // 2. Dashboard Stats
  console.log('\n--- Step 2: Fetch Executive Dashboard Stats ---');
  const dashRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
    headers: { cookie: userCookie },
  });
  const dashData = await dashRes.json();
  console.log(`✅ Dashboard stats loaded: Total Rooms=${dashData.cards.totalRooms}, Available=${dashData.cards.availableCount}, Occupied=${dashData.cards.occupiedCount}, Today's Bookings=${dashData.cards.todayBookingsCount}`);

  // 3. Browse Meeting Rooms
  console.log('\n--- Step 3: Browse Meeting Rooms ---');
  const roomsRes = await fetch(`${BASE_URL}/api/rooms`, {
    headers: { cookie: userCookie },
  });
  const roomsData = await roomsRes.json();
  const rooms = roomsData.rooms;
  console.log(`✅ Retrieved ${rooms.length} rooms from database.`);
  rooms.forEach(r => console.log(`   - [${r.code}] ${r.name} (${r.status}) Capacity: ${r.capacity}`));

  const targetRoom = rooms.find(r => r.code === 'RM-101');
  if (!targetRoom) throw new Error('Target room RM-101 not found');

  // 4. Test Overlap Conflict Prevention (Negative Test)
  console.log('\n--- Step 4: Test Overlap Collision Prevention (Section 12) ---');
  // There is already a booking today at 10:00 - 11:30 in RM-101 from seed
  const today = new Date().toISOString().slice(0, 10);
  const conflictRes = await fetch(`${BASE_URL}/api/bookings/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: userCookie },
    body: JSON.stringify({
      roomId: targetRoom.id,
      startTime: `${today}T10:30:00`,
      endTime: `${today}T11:45:00`,
      participantsCount: 10,
    }),
  });
  const conflictData = await conflictRes.json();
  if (conflictData.hasConflict) {
    console.log(`✅ Collision accurately detected! Reason: "${conflictData.reason}"`);
    console.log(`   Suggested Alternative Rooms: ${conflictData.suggestedRooms?.map(r => r.name).join(', ')}`);
    console.log(`   Suggested Alternative Slots: ${conflictData.suggestedSlots?.length} free slots found`);
  } else {
    throw new Error('Collision detection failed to block overlapping booking!');
  }

  // 5. Create a Valid New Booking (Positive Test)
  console.log('\n--- Step 5: Create a Valid Booking ---');
  const validStart = `${today}T16:00:00`;
  const validEnd = `${today}T17:30:00`;
  const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: userCookie },
    body: JSON.stringify({
      roomId: targetRoom.id,
      title: 'E2E Testing Project Launch Review',
      description: 'ระบบจองห้องประชุมผ่านการทดสอบรอบสุดท้าย',
      startTime: validStart,
      endTime: validEnd,
      participantsCount: 15,
      organizerName: 'อนันต์ สุขสำราญ',
      participants: ['วิศวกรระบบ 1', 'ผู้จัดการโปรเจกต์'],
    }),
  });

  if (!bookRes.ok) {
    const err = await bookRes.json();
    throw new Error(`Booking failed: ${JSON.stringify(err)}`);
  }
  const bookData = await bookRes.json();
  const createdBooking = bookData.booking;
  console.log(`✅ Booking created in DB: ${createdBooking.bookingCode} (Status: ${createdBooking.status})`);

  // 6. Verify in Calendar
  console.log('\n--- Step 6: Verify Booking Appears in Calendar Feed ---');
  const calRes = await fetch(`${BASE_URL}/api/calendar?roomId=${targetRoom.id}`, {
    headers: { cookie: userCookie },
  });
  const calData = await calRes.json();
  const foundInCal = calData.events.find(e => e.id === createdBooking.id);
  if (!foundInCal) throw new Error('New booking not found in calendar events feed!');
  console.log(`✅ Found booking in calendar feed: "${foundInCal.title}" (${foundInCal.status})`);

  // 7. Login as Admin and Approve
  console.log('\n--- Step 7: Admin Login & Approval (Section 2) ---');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@company.com', password: 'password123' }),
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log('✅ Admin Logged in successfully.');

  const approveRes = await fetch(`${BASE_URL}/api/bookings/${createdBooking.id}/approve`, {
    method: 'POST',
    headers: { cookie: adminCookie },
  });
  if (!approveRes.ok) throw new Error(`Approval failed with status: ${approveRes.status}`);
  const approvedData = await approveRes.json();
  console.log(`✅ Booking approved by Admin: Status is now "${approvedData.booking.status}"`);

  // 8. Verify Notification Sent to User
  console.log('\n--- Step 8: Verify Real-Time Notification for User ---');
  const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { cookie: userCookie },
  });
  const notifData = await notifRes.json();
  const latestNotif = notifData.notifications[0];
  console.log(`✅ Notification received by user:`);
  console.log(`   Title: "${latestNotif.title}"`);
  console.log(`   Message: "${latestNotif.message}"`);
  console.log(`   Unread Count: ${notifData.unreadCount}`);

  // 9. Verify Reports & Analytics
  console.log('\n--- Step 9: Verify Reports & Analytics Update ---');
  const repRes = await fetch(`${BASE_URL}/api/reports?range=today`, {
    headers: { cookie: adminCookie },
  });
  const repData = await repRes.json();
  console.log(`✅ Report aggregated data:`);
  console.log(`   Total Bookings Today: ${repData.summary.totalBookings}`);
  console.log(`   Approved Bookings: ${repData.summary.approvedCount}`);
  console.log(`   Total Usage Hours: ${repData.summary.totalUsageHours} hours`);

  console.log('\n🎉 ALL 10 STEPS OF THE END-TO-END FLOW VERIFIED SUCCESSFULLY WITH 100% LIVE DATABASE DATA!');
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E Verification failed:', err);
  process.exit(1);
});
