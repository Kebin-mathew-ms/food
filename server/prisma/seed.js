import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Clean Database (Delete in reverse order of foreign key dependencies)
  console.log('🧹 Purging existing database records...');
  await prisma.feedback.deleteMany();
  await prisma.deliveries.deleteMany();
  await prisma.donation_requests.deleteMany();
  await prisma.donation_images.deleteMany();
  await prisma.food_donations.deleteMany();
  await prisma.ngos.deleteMany();
  await prisma.volunteers.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.complaints.deleteMany();
  await prisma.audit_logs.deleteMany();
  await prisma.system_settings.deleteMany();
  await prisma.users.deleteMany();

  // Hash standard password for all seeded users
  const passwordHash = await bcrypt.hash('password123', 10);

  // ==========================================
  // 2. SEED USERS
  // ==========================================
  console.log('👤 Seeding users...');
  
  // 1 Admin
  const adminUser = await prisma.users.create({
    data: {
      full_name: 'System Administrator',
      email: 'admin@foodshare.org',
      phone: '+15550100',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      city: 'Metropolis',
      country: 'USA',
      email_verified: true,
    },
  });

  // 2 NGOs
  const ngoUser1 = await prisma.users.create({
    data: {
      full_name: 'Hope Kitchen Coordinator',
      email: 'contact@hopekitchen.org',
      phone: '+15550201',
      password: passwordHash,
      role: 'NGO',
      status: 'ACTIVE',
      city: 'Metropolis',
      country: 'USA',
      email_verified: true,
    },
  });

  const ngoUser2 = await prisma.users.create({
    data: {
      full_name: 'Shelter Coordinator',
      email: 'info@cityshelter.org',
      phone: '+15550202',
      password: passwordHash,
      role: 'NGO',
      status: 'ACTIVE',
      city: 'Metropolis',
      country: 'USA',
      email_verified: true,
    },
  });

  // 3 Volunteers
  const volunteerUsers = [];
  for (let i = 1; i <= 3; i++) {
    const vol = await prisma.users.create({
      data: {
        full_name: `Volunteer Courier ${i}`,
        email: `volunteer${i}@foodshare.org`,
        phone: `+1555030${i}`,
        password: passwordHash,
        role: 'VOLUNTEER',
        status: 'ACTIVE',
        city: 'Metropolis',
        country: 'USA',
        email_verified: true,
      },
    });
    volunteerUsers.push(vol);
  }

  // 5 Donors
  const donorUsers = [];
  const businesses = ['Green Leaf Cafe', 'Baker Street Delights', 'Central Supermarket', 'Grand Plaza Hotel', 'Metro Pizza Bistro'];
  for (let i = 0; i < 5; i++) {
    const donor = await prisma.users.create({
      data: {
        full_name: `${businesses[i]} Owner`,
        email: `donor${i+1}@${businesses[i].toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1555040${i+1}`,
        password: passwordHash,
        role: 'DONOR',
        status: 'ACTIVE',
        city: 'Metropolis',
        country: 'USA',
        email_verified: true,
      },
    });
    donorUsers.push(donor);
  }

  // ==========================================
  // 3. SEED PROFILE EXTENSIONS (NGOs & Volunteers)
  // ==========================================
  console.log('🏛️ Seeding NGO profiles...');
  const ngoProfile1 = await prisma.ngos.create({
    data: {
      user_id: ngoUser1.id,
      organization_name: 'Hope Kitchen Foundation',
      registration_number: 'NGO-12345-HK',
      ngo_license: 'https://docs.foodshare.org/licenses/HK-9988.pdf',
      website: 'https://hopekitchen.org',
      description: 'Serving hot meals to urban homeless families daily.',
      verified: true,
      status: 'VERIFIED',
    },
  });

  const ngoProfile2 = await prisma.ngos.create({
    data: {
      user_id: ngoUser2.id,
      organization_name: 'Metropolis City Shelter',
      registration_number: 'NGO-67890-MCS',
      ngo_license: 'https://docs.foodshare.org/licenses/MCS-1122.pdf',
      website: 'https://cityshelter.org',
      description: 'Emergency overnight housing and meal distribution center.',
      verified: true,
      status: 'VERIFIED',
    },
  });

  const ngoProfiles = [ngoProfile1, ngoProfile2];

  console.log('🛵 Seeding volunteer profiles...');
  const volunteerProfiles = [];
  const vehicleTypes = ['BICYCLE', 'MOTORCYCLE', 'CAR'];
  const vehicleNumbers = ['BIKE-882', 'MC-1102', 'CAR-9932'];
  for (let i = 0; i < 3; i++) {
    const volProfile = await prisma.volunteers.create({
      data: {
        user_id: volunteerUsers[i].id,
        vehicle_type: vehicleTypes[i],
        vehicle_number: vehicleNumbers[i],
        availability: true,
        is_online: true,
        current_latitude: 40.7128 + (i * 0.005),
        current_longitude: -74.0060 - (i * 0.005),
      },
    });
    volunteerProfiles.push(volProfile);
  }

  // ==========================================
  // 4. SEED FOOD DONATIONS
  // ==========================================
  console.log('🍲 Seeding food donations...');
  const donations = [];
  const foodItems = [
    { name: 'Surplus Fresh Sandwiches', category: 'Prepared Meals', type: 'VEG' },
    { name: 'Artisan Pastries Assortment', category: 'Bakery', type: 'VEG' },
    { name: 'Organic Salad Trays', category: 'Salads', type: 'VEGAN' },
    { name: 'Roasted Chicken Legs', category: 'Prepared Meals', type: 'NON_VEG' },
    { name: 'Fresh Fruit Medley Packages', category: 'Produce', type: 'VEGAN' },
    { name: 'Wood-fired Margerita Pizza', category: 'Prepared Meals', type: 'VEG' },
    { name: 'Steamed Rice & Veggie Bowls', category: 'Prepared Meals', type: 'VEGAN' },
    { name: 'Slow Cooked Beef Stew', category: 'Prepared Meals', type: 'NON_VEG' },
  ];

  for (let i = 0; i < 20; i++) {
    const foodItem = foodItems[i % foodItems.length];
    const donor = donorUsers[i % donorUsers.length];
    
    // Status distribution
    let status = 'AVAILABLE';
    if (i >= 5 && i < 10) status = 'REQUESTED';
    if (i >= 10 && i < 13) status = 'APPROVED';
    if (i >= 13 && i < 15) status = 'PICKED_UP';
    if (i >= 15 && i < 18) status = 'DELIVERED';
    if (i === 18) status = 'EXPIRED';
    if (i === 19) status = 'CANCELLED';

    const donation = await prisma.food_donations.create({
      data: {
        donor_id: donor.id,
        food_name: `${foodItem.name} #${i + 1}`,
        food_category: foodItem.category,
        food_type: foodItem.type,
        description: `High-quality surplus food from our standard daily services. Packaged in sanitized containers.`,
        quantity: 5.0 + i,
        quantity_unit: 'kg',
        number_of_people: 10 + (i * 2),
        prepared_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        expiry_time: new Date(Date.now() + (6 + i) * 60 * 60 * 1000), // expires in 6+i hours
        pickup_address: `100 Ocean Ave, Suite ${i+1}`,
        pickup_city: 'Metropolis',
        pickup_state: 'NY',
        pickup_country: 'USA',
        pickup_latitude: 40.7128 + (i * 0.001),
        pickup_longitude: -74.0060 + (i * 0.001),
        special_instructions: 'Please call business owner upon arrival at side door.',
        status: status,
      },
    });
    donations.push(donation);
  }

  // ==========================================
  // 5. SEED DONATION IMAGES
  // ==========================================
  console.log('🖼️ Seeding donation images...');
  for (let i = 0; i < 20; i++) {
    await prisma.donation_images.create({
      data: {
        donation_id: donations[i].id,
        image_url: `https://images.foodshare.org/donations/donation-${i + 1}.jpg`,
        public_id: `donations/donation_raw_cloud_${i + 1}`,
        display_order: 0,
      },
    });
  }

  // ==========================================
  // 6. SEED DONATION REQUESTS
  // ==========================================
  console.log('📩 Seeding donation requests...');
  const requests = [];
  for (let i = 0; i < 20; i++) {
    const donation = donations[i];
    const ngo = ngoProfiles[i % ngoProfiles.length];
    
    let status = 'PENDING';
    // Match request status to donation status to remain logically consistent
    if (donation.status === 'AVAILABLE') status = 'PENDING';
    if (donation.status === 'REQUESTED') status = 'PENDING';
    if (['APPROVED', 'PICKED_UP', 'DELIVERED'].includes(donation.status)) status = 'APPROVED';
    if (donation.status === 'CANCELLED') status = 'REJECTED';

    const reqRecord = await prisma.donation_requests.create({
      data: {
        donation_id: donation.id,
        ngo_id: ngo.id,
        request_status: status,
        requested_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        approved_at: status === 'APPROVED' ? new Date() : null,
        rejected_at: status === 'REJECTED' ? new Date() : null,
        remarks: 'NGO request submitted matching target beneficiary nutritional guides.',
      },
    });
    requests.push(reqRecord);
  }

  // ==========================================
  // 7. SEED DELIVERIES
  // ==========================================
  console.log('🚚 Seeding deliveries...');
  const deliveries = [];
  // We need 10 deliveries (let's map to approved requests)
  const approvedRequests = requests.filter(r => r.request_status === 'APPROVED');

  for (let i = 0; i < Math.min(10, approvedRequests.length); i++) {
    const req = approvedRequests[i];
    const volunteer = volunteerProfiles[i % volunteerProfiles.length];
    
    // Status distribution
    let status = 'ASSIGNED';
    if (i >= 3 && i < 5) status = 'PICKED_UP';
    if (i >= 5 && i < 7) status = 'IN_TRANSIT';
    if (i >= 7) status = 'DELIVERED';

    const del = await prisma.deliveries.create({
      data: {
        donation_request_id: req.id,
        volunteer_id: volunteer.id,
        pickup_time: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(status) ? new Date() : null,
        delivery_time: status === 'DELIVERED' ? new Date() : null,
        completion_time: status === 'DELIVERED' ? new Date() : null,
        delivery_status: status,
        pickup_photo: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(status) ? `https://images.foodshare.org/pickups/pickup-${i + 1}.jpg` : null,
        delivery_photo: status === 'DELIVERED' ? `https://images.foodshare.org/deliveries/delivery-${i + 1}.jpg` : null,
        proof_signature: status === 'DELIVERED' ? `https://images.foodshare.org/signatures/sign-${i + 1}.png` : null,
        delivery_notes: 'Delivered packaging directly to clean cold-storage lockers.',
      },
    });
    deliveries.push(del);
  }

  // ==========================================
  // 8. SEED FEEDBACK
  // ==========================================
  console.log('⭐ Seeding feedbacks...');
  const deliveredDeliveries = deliveries.filter(d => d.delivery_status === 'DELIVERED');
  for (let i = 0; i < deliveredDeliveries.length; i++) {
    const del = deliveredDeliveries[i];
    await prisma.feedback.create({
      data: {
        delivery_id: del.id,
        rating: 4 + (i % 2), // ratings 4 or 5
        review: 'Excellent prompt transport courier services. Food was temperature-safe.',
      },
    });
  }

  // ==========================================
  // 9. SEED NOTIFICATIONS
  // ==========================================
  console.log('🔔 Seeding notifications...');
  const usersList = [ngoUser1, ngoUser2, adminUser, ...volunteerUsers];
  for (let i = 0; i < usersList.length; i++) {
    const user = usersList[i];
    await prisma.notifications.create({
      data: {
        user_id: user.id,
        title: 'Welcome to FoodShare Platform',
        message: `Hello ${user.full_name}, your account foundation is active. Welcome!`,
        type: 'SYSTEM',
        is_read: false,
      },
    });
  }

  // ==========================================
  // 10. SEED SYSTEM SETTINGS
  // ==========================================
  console.log('⚙️ Seeding system settings...');
  const settings = [
    { key: 'PLATFORM_NAME', value: 'Food Waste Redistribution Network' },
    { key: 'MAX_DONATION_RADIUS_KM', value: '25' },
    { key: 'COURIER_EXPIRY_THRESHOLD_MIN', value: '45' },
    { key: 'ALLOW_NON_VEG_DONATIONS', value: 'true' },
  ];

  for (const set of settings) {
    await prisma.system_settings.create({
      data: {
        setting_key: set.key,
        setting_value: set.value,
        description: `Default system parameters for: ${set.key}`,
      },
    });
  }

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
