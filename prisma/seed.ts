import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_ENABLED !== "true") {
    console.log("SEED_ENABLED is not true. Skipping seed.");
    return;
  }

  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create admin users
  const admin = await prisma.user.upsert({
    where: { email: "admin@mucosa.ac.ug" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "MUCOSA",
      email: "admin@mucosa.ac.ug",
      registrationNumber: "ADMIN/001",
      course: "Computer Science",
      yearGroup: 4,
      role: "SUPER_ADMIN",
      membershipStatus: "ACTIVE",
      passwordHash,
    },
  });

  const president = await prisma.user.upsert({
    where: { email: "president@mucosa.ac.ug" },
    update: {},
    create: {
      firstName: "David",
      lastName: "Okello",
      email: "president@mucosa.ac.ug",
      registrationNumber: "2022/HD05/1001U",
      course: "Software Engineering",
      yearGroup: 3,
      role: "PRESIDENT",
      membershipStatus: "ACTIVE",
      passwordHash,
    },
  });

  const secretary = await prisma.user.upsert({
    where: { email: "secretary@mucosa.ac.ug" },
    update: {},
    create: {
      firstName: "Grace",
      lastName: "Nakamya",
      email: "secretary@mucosa.ac.ug",
      registrationNumber: "2022/HD05/1002U",
      course: "Information Technology",
      yearGroup: 3,
      role: "GENERAL_SECRETARY",
      membershipStatus: "ACTIVE",
      passwordHash,
    },
  });

  // Create member users
  const memberData = [
    { firstName: "John", lastName: "Mugisha", reg: "2023/HD05/2001U", course: "Computer Science", year: 2 },
    { firstName: "Sarah", lastName: "Achieng", reg: "2023/HD05/2002U", course: "Software Engineering", year: 2 },
    { firstName: "Peter", lastName: "Wasswa", reg: "2023/HD05/2003U", course: "Information Technology", year: 2 },
    { firstName: "Agnes", lastName: "Kirabo", reg: "2024/HD05/3001U", course: "Computer Science", year: 1 },
    { firstName: "Brian", lastName: "Ssekandi", reg: "2024/HD05/3002U", course: "Data Science", year: 1 },
    { firstName: "Faith", lastName: "Nabatanzi", reg: "2024/HD05/3003U", course: "Software Engineering", year: 1 },
    { firstName: "Emma", lastName: "Tumusiime", reg: "2022/HD05/4001U", course: "Computer Engineering", year: 3 },
    { firstName: "Daniel", lastName: "Kato", reg: "2022/HD05/4002U", course: "Computer Science", year: 3 },
    { firstName: "Mary", lastName: "Nantongo", reg: "2022/HD05/4003U", course: "Information Technology", year: 3 },
    { firstName: "Joseph", lastName: "Lwanga", reg: "2021/HD05/5001U", course: "Software Engineering", year: 4 },
    { firstName: "Rebecca", lastName: "Akello", reg: "2021/HD05/5002U", course: "Data Science", year: 4 },
    { firstName: "Isaac", lastName: "Opio", reg: "2021/HD05/5003U", course: "Computer Science", year: 4 },
    { firstName: "Diana", lastName: "Namutebi", reg: "2024/HD05/3004U", course: "Software Engineering", year: 1 },
    { firstName: "Mark", lastName: "Ssempijja", reg: "2023/HD05/2004U", course: "Computer Engineering", year: 2 },
    { firstName: "Lydia", lastName: "Birungi", reg: "2024/HD05/3005U", course: "Information Technology", year: 1 },
    { firstName: "Samuel", lastName: "Ochieng", reg: "2022/HD05/4004U", course: "Data Science", year: 3 },
    { firstName: "Esther", lastName: "Kisakye", reg: "2023/HD05/2005U", course: "Computer Science", year: 2 },
    { firstName: "Andrew", lastName: "Musoke", reg: "2021/HD05/5004U", course: "Software Engineering", year: 4 },
    { firstName: "Patricia", lastName: "Nakku", reg: "2024/HD05/3006U", course: "Computer Science", year: 1 },
    { firstName: "Charles", lastName: "Teefe", reg: "2023/HD05/2006U", course: "Information Technology", year: 2 },
  ];

  const members: any[] = [admin, president, secretary];
  for (const m of memberData) {
    const user = await prisma.user.upsert({
      where: { email: `${m.firstName.toLowerCase()}.${m.lastName.toLowerCase()}@mucosa.ac.ug` },
      update: {},
      create: {
        firstName: m.firstName,
        lastName: m.lastName,
        email: `${m.firstName.toLowerCase()}.${m.lastName.toLowerCase()}@mucosa.ac.ug`,
        registrationNumber: m.reg,
        course: m.course,
        yearGroup: m.year,
        role: "MEMBER",
        membershipStatus: "ACTIVE",
        passwordHash,
      },
    });
    members.push(user);
  }

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Introduction to AI/ML",
        category: "WORKSHOP",
        date: new Date("2025-02-15T14:00:00Z"),
        time: "2:00 PM",
        venue: "CEDAT Conference Hall",
        description: "An introductory workshop on Artificial Intelligence and Machine Learning concepts.",
        maxCapacity: 150,
        organizingCommunity: "AI/ML Community",
        createdById: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Friday Session: Tech Trends 2025",
        category: "FRIDAY_SESSION",
        date: new Date("2025-02-21T17:00:00Z"),
        time: "5:00 PM",
        venue: "Lecture Theatre 3",
        description: "Weekly Friday session discussing emerging technology trends.",
        maxCapacity: 300,
        organizingCommunity: "MUCOSA",
        createdById: president.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Build for Africa Hackathon",
        category: "HACKATHON",
        date: new Date("2025-03-01T08:00:00Z"),
        time: "8:00 AM",
        venue: "Innovation Hub, CEDAT",
        description: "48-hour hackathon focused on building solutions for African challenges.",
        maxCapacity: 200,
        organizingCommunity: "MUCOSA & Innovation Hub",
        createdById: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Community Meetup: Open Source",
        category: "COMMUNITY_MEETUP",
        date: new Date("2025-03-08T15:00:00Z"),
        time: "3:00 PM",
        venue: "Computer Science Block B",
        description: "Monthly community meetup discussing open source contributions.",
        maxCapacity: 100,
        organizingCommunity: "Open Source Community",
        createdById: secretary.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Research Symposium",
        category: "RESEARCH_EVENT",
        date: new Date("2025-03-15T09:00:00Z"),
        time: "9:00 AM",
        venue: "Main Hall",
        description: "Annual research symposium showcasing student projects and papers.",
        createdById: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Innovation Challenge: Smart Campus",
        category: "INNOVATION_CHALLENGE",
        date: new Date("2025-03-22T10:00:00Z"),
        time: "10:00 AM",
        venue: "Innovation Hub",
        description: "Challenge to design smart campus solutions.",
        maxCapacity: 120,
        organizingCommunity: "Innovation Committee",
        createdById: president.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Career Talk: Google Engineers",
        category: "CAREER_TALK",
        date: new Date("2025-03-29T14:00:00Z"),
        time: "2:00 PM",
        venue: "CEDAT Auditorium",
        description: "Google software engineers share career insights and interview tips.",
        maxCapacity: 250,
        createdById: secretary.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Web Development Workshop",
        category: "WORKSHOP",
        date: new Date("2025-04-05T10:00:00Z"),
        time: "10:00 AM",
        venue: "Computer Lab 1",
        description: "Hands-on workshop on modern web development with React and Next.js.",
        maxCapacity: 80,
        organizingCommunity: "Web Dev Community",
        createdById: admin.id,
      },
    }),
  ]);

  // Create attendance sessions for some events
  const sessions = [];
  for (const event of events.slice(0, 4)) {
    const session = await prisma.attendanceSession.create({
      data: {
        eventId: event.id,
        openedById: admin.id,
        isActive: event.id === events[1].id || event.id === events[3].id,
      },
    });
    sessions.push(session);
  }

  // Record some attendance
  for (const session of sessions) {
    const attendees = members.slice(0, 10 + Math.floor(Math.random() * 10));
    for (const member of attendees) {
      try {
        await prisma.attendanceRecord.create({
          data: {
            sessionId: session.id,
            memberId: member.id,
            scannedById: admin.id,
            status: "PRESENT",
          },
        });

        // Award points
        const event = events.find((e) => e.id === session.eventId);
        if (event) {
          const pointsMap: Record<string, number> = {
            FRIDAY_SESSION: 10, WORKSHOP: 15, HACKATHON: 30,
            COMMUNITY_MEETUP: 15, RESEARCH_EVENT: 25,
            INNOVATION_CHALLENGE: 40, CAREER_TALK: 10, OTHER: 5,
          };
          const pts = pointsMap[event.category] || 10;

          await prisma.pointsTransaction.create({
            data: {
              memberId: member.id,
              points: pts,
              reason: `${event.category.replace(/_/g, " ")} Attendance`,
              category: event.category as any,
              eventId: event.id,
              semester: "2024-S2",
            },
          });

          await prisma.user.update({
            where: { id: member.id },
            data: { totalPoints: { increment: pts } },
          });
        }
      } catch (e) {
        // Skip duplicates
      }
    }
  }

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: "Attendance Champion",
        description: "Awarded for achieving 90%+ attendance in a semester.",
        icon: "🥇",
        criteria: { type: "attendance_percentage", threshold: 90 },
      },
    }),
    prisma.badge.create({
      data: {
        name: "Semester Excellence Award",
        description: "Outstanding overall performance and engagement.",
        icon: "🏆",
        criteria: { type: "points_threshold", threshold: 200 },
      },
    }),
    prisma.badge.create({
      data: {
        name: "Innovation Contributor",
        description: "Active participation in innovation challenges.",
        icon: "🚀",
        criteria: { type: "innovation_participation", threshold: 1 },
      },
    }),
    prisma.badge.create({
      data: {
        name: "Research Enthusiast",
        description: "Participation in research events and symposiums.",
        icon: "💡",
        criteria: { type: "research_participation", threshold: 1 },
      },
    }),
    prisma.badge.create({
      data: {
        name: "Community Builder",
        description: "Active in community meetups and events.",
        icon: "🔥",
        criteria: { type: "community_participation", threshold: 2 },
      },
    }),
    prisma.badge.create({
      data: {
        name: "MUCOSA Ambassador",
        description: "Exceptional representation of MUCOSA values.",
        icon: "⭐",
        criteria: { type: "points_threshold", threshold: 300 },
      },
    }),
  ]);

  // Award some badges
  for (const member of members.slice(0, 8)) {
    await prisma.memberBadge.create({
      data: {
        memberId: member.id,
        badgeId: badges[0].id,
        semester: "2024-S2",
      },
    });
  }
  for (const member of members.slice(0, 3)) {
    await prisma.memberBadge.create({
      data: {
        memberId: member.id,
        badgeId: badges[1].id,
        semester: "2024-S2",
      },
    });
  }

  console.log(`Seeded: ${members.length} users, ${events.length} events, ${badges.length} badges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
