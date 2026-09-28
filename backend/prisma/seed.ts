import { PrismaClient, UserRole, ODReason, ApplicationStatus, ReviewDecision } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CampusOD database...');

  // Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.approvalReview.deleteMany();
  await prisma.uploadedDocument.deleteMany();
  await prisma.oDApplicationPeriod.deleteMany();
  await prisma.oDApplicationDate.deleteMany();
  await prisma.oDApplication.deleteMany();
  await prisma.event.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.oDPolicy.deleteMany();

  // Create Policy
  await prisma.oDPolicy.create({
    data: {
      maxDaysPerSemester: 15,
      deadlineHoursBeforeEvent: 24,
      requireAttachment: true,
    },
  });

  // Create Departments
  const cseDept = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Electronics and Communication Engineering',
    },
  });

  const mechDept = await prisma.department.create({
    data: {
      code: 'MECH',
      name: 'Mechanical Engineering',
    },
  });

  const itDept = await prisma.department.create({
    data: {
      code: 'IT',
      name: 'Information Technology',
    },
  });

  // Common Passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      fullName: 'Dr. Arthur Pendelton',
      phone: '+1 (555) 019-2831',
    },
  });

  // 2. Create Faculty Users
  const faculty1User = await prisma.user.create({
    data: {
      email: 'faculty.cs@campus.edu',
      passwordHash: facultyPasswordHash,
      role: UserRole.FACULTY,
      fullName: 'Dr. Evelyn Reed',
      phone: '+1 (555) 018-9281',
      facultyProfile: {
        create: {
          employeeId: 'FAC-CSE-001',
          departmentId: cseDept.id,
          designation: 'Professor & Head of Department',
        },
      },
    },
    include: { facultyProfile: true },
  });

  const faculty2User = await prisma.user.create({
    data: {
      email: 'faculty.ec@campus.edu',
      passwordHash: facultyPasswordHash,
      role: UserRole.FACULTY,
      fullName: 'Prof. Marcus Vance',
      phone: '+1 (555) 018-4729',
      facultyProfile: {
        create: {
          employeeId: 'FAC-ECE-002',
          departmentId: eceDept.id,
          designation: 'Associate Professor & Faculty Advisor',
        },
      },
    },
    include: { facultyProfile: true },
  });

  // 3. Create Student Users
  const student1User = await prisma.user.create({
    data: {
      email: 'student1@campus.edu',
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      fullName: 'Alex Morgan',
      phone: '+1 (555) 014-9921',
      studentProfile: {
        create: {
          registerNumber: '2026CS101',
          departmentId: cseDept.id,
          year: 3,
          section: 'A',
          rollNumber: 'CS-301',
        },
      },
    },
    include: { studentProfile: true },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student2@campus.edu',
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      fullName: 'Priya Sharma',
      phone: '+1 (555) 014-8832',
      studentProfile: {
        create: {
          registerNumber: '2026EC204',
          departmentId: eceDept.id,
          year: 2,
          section: 'B',
          rollNumber: 'EC-204',
        },
      },
    },
    include: { studentProfile: true },
  });

  const student3User = await prisma.user.create({
    data: {
      email: 'student3@campus.edu',
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      fullName: 'Liam Chen',
      phone: '+1 (555) 014-7743',
      studentProfile: {
        create: {
          registerNumber: '2026ME305',
          departmentId: mechDept.id,
          year: 4,
          section: 'A',
          rollNumber: 'ME-405',
        },
      },
    },
    include: { studentProfile: true },
  });

  // 4. Create Campus Events
  const now = new Date();
  const event1 = await prisma.event.create({
    data: {
      title: 'National AI & Cloud Computing Hackathon 2026',
      description: '36-hour inter-collegiate coding marathon tackling high-impact challenges in Edge AI, Distributed Systems, and Green Computing.',
      organizer: 'Centre for Intelligent Systems & ACM Chapter',
      venue: 'Auditorium Main Hall & Computing Labs 3 & 4',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      requiresDocument: true,
      isActive: true,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'State Inter-Collegiate Robotics & Mechatronics Conclave',
      description: 'Autonomous robotics showdown, line-follower league, and aerial drone obstacle course tournament.',
      organizer: 'Robotics & Automation Society (RAS)',
      venue: 'Mechatronics Indoor Arena & Workshop 2',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      requiresDocument: true,
      isActive: true,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Global Semiconductor & VLSI Design Symposium',
      description: 'Distinguished lecture series and paper presentations on sub-nanometer chip design, RISC-V architectures, and quantum computing.',
      organizer: 'Department of Electronics & Communication',
      venue: 'Sir C.V. Raman Convention Center',
      startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      requiresDocument: true,
      isActive: true,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Inter-University Track & Field Championship 2026',
      description: 'Annual athletics meet featuring 100m sprint, relays, high jump, and decathlon competitions.',
      organizer: 'Department of Physical Education & Sports',
      venue: 'University Athletics Stadium',
      startDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      requiresDocument: true,
      isActive: true,
    },
  });

  // 5. Seed Applications in different lifecycle states
  // Application 1: APPROVED (Alex Morgan)
  const app1 = await prisma.oDApplication.create({
    data: {
      applicationNumber: 'OD-2026-0841',
      studentProfileId: student1User.studentProfile.id,
      eventId: event1.id,
      reason: ODReason.EVENT,
      status: ApplicationStatus.APPROVED,
      verificationCode: 'VER-OD-9481-AK7X',
      declarationAccepted: true,
      dates: {
        create: [
          {
            date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            isFullDay: false,
            periods: {
              create: [{ periodNumber: 1 }, { periodNumber: 2 }, { periodNumber: 3 }],
            },
          },
          {
            date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
            isFullDay: false,
            periods: {
              create: [{ periodNumber: 4 }, { periodNumber: 5 }],
            },
          },
        ],
      },
      documents: {
        create: [
          {
            fileName: 'sample_invitation_hackathon.pdf',
            originalName: 'Hackathon_Selection_Letter.pdf',
            mimeType: 'application/pdf',
            fileSize: 420840,
            filePath: 'uploads/sample_invitation_hackathon.pdf',
          },
        ],
      },
      reviews: {
        create: [
          {
            reviewerId: faculty1User.id,
            role: UserRole.FACULTY,
            decision: ReviewDecision.FORWARDED_TO_ADMIN,
            remarks: 'Student has maintained 88% attendance and is representing the college in the national finals. Strongly recommended.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            reviewerId: adminUser.id,
            role: UserRole.ADMIN,
            decision: ReviewDecision.APPROVED,
            remarks: 'Final institutional permission granted. Attendance credit shall be awarded for the selected periods.',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Application 2: PENDING_FACULTY (Priya Sharma)
  const app2 = await prisma.oDApplication.create({
    data: {
      applicationNumber: 'OD-2026-0892',
      studentProfileId: student2User.studentProfile.id,
      eventId: event2.id,
      reason: ODReason.PRE_WORK,
      status: ApplicationStatus.PENDING_FACULTY,
      verificationCode: 'VER-OD-3819-B2QM',
      declarationAccepted: true,
      dates: {
        create: [
          {
            date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
            isFullDay: false,
            periods: {
              create: [{ periodNumber: 2 }, { periodNumber: 3 }, { periodNumber: 4 }],
            },
          },
        ],
      },
      documents: {
        create: [
          {
            fileName: 'sample_robotics_team_lead.pdf',
            originalName: 'Robotics_Arena_Setup_Duty.pdf',
            mimeType: 'application/pdf',
            fileSize: 312000,
            filePath: 'uploads/sample_robotics_team_lead.pdf',
          },
        ],
      },
    },
  });

  // Application 3: PENDING_ADMIN (Liam Chen - Reviewed by Faculty, awaiting Admin final approval)
  const app3 = await prisma.oDApplication.create({
    data: {
      applicationNumber: 'OD-2026-0914',
      studentProfileId: student3User.studentProfile.id,
      eventId: event3.id,
      reason: ODReason.EVENT,
      status: ApplicationStatus.PENDING_ADMIN,
      verificationCode: 'VER-OD-7201-LP8W',
      declarationAccepted: true,
      dates: {
        create: [
          {
            date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
            isFullDay: true,
            periods: {
              create: [
                { periodNumber: 1 }, { periodNumber: 2 }, { periodNumber: 3 }, { periodNumber: 4 },
                { periodNumber: 5 }, { periodNumber: 6 }, { periodNumber: 7 }, { periodNumber: 8 }
              ],
            },
          },
        ],
      },
      documents: {
        create: [
          {
            fileName: 'sample_paper_acceptance.pdf',
            originalName: 'IEEE_Paper_Acceptance.pdf',
            mimeType: 'application/pdf',
            fileSize: 580210,
            filePath: 'uploads/sample_paper_acceptance.pdf',
          },
        ],
      },
      reviews: {
        create: [
          {
            reviewerId: faculty2User.id,
            role: UserRole.FACULTY,
            decision: ReviewDecision.FORWARDED_TO_ADMIN,
            remarks: 'Paper accepted for oral presentation in technical session. Verified genuine acceptance letter.',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Application 4: RETURNED_FOR_CORRECTION (Alex Morgan)
  const app4 = await prisma.oDApplication.create({
    data: {
      applicationNumber: 'OD-2026-0782',
      studentProfileId: student1User.studentProfile.id,
      customEventTitle: 'Regional Autonomous Rover Challenge',
      customVenue: 'National Technology Institute, Block C',
      customOrganizer: 'Indian Society for Technical Education',
      reason: ODReason.POST_WORK,
      status: ApplicationStatus.RETURNED_FOR_CORRECTION,
      verificationCode: 'VER-OD-1194-RC4D',
      declarationAccepted: true,
      dates: {
        create: [
          {
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            isFullDay: false,
            periods: {
              create: [{ periodNumber: 6 }, { periodNumber: 7 }],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            reviewerId: faculty1User.id,
            role: UserRole.FACULTY,
            decision: ReviewDecision.RETURNED_FOR_CORRECTION,
            remarks: 'The uploaded file was corrupted and unreadable. Please re-upload the official event schedule signed by the coordinator.',
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // 6. Create Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1User.id,
        title: 'OD Approved by Administration',
        message: 'Your application OD-2026-0841 for National AI Hackathon has been granted final approval. Download your official OD letter.',
        type: 'ADMIN_APPROVED',
        link: `/applications/${app1.id}`,
        isRead: false,
      },
      {
        userId: student1User.id,
        title: 'Action Required: Application Returned',
        message: 'Faculty Dr. Evelyn Reed returned your application OD-2026-0782 with remarks: "Please re-upload readable document".',
        type: 'CORRECTION_REQUIRED',
        link: `/applications/${app4.id}`,
        isRead: false,
      },
      {
        userId: faculty1User.id,
        title: 'New OD Application for Review',
        message: 'Alex Morgan submitted an OD application for National AI Hackathon.',
        type: 'SUBMITTED',
        link: `/faculty/review/${app1.id}`,
        isRead: true,
      },
      {
        userId: adminUser.id,
        title: 'Application Awaiting Final Approval',
        message: 'Application OD-2026-0914 for Liam Chen has been forwarded by Prof. Marcus Vance and awaits your final sign-off.',
        type: 'PENDING_ADMIN',
        link: `/admin/review/${app3.id}`,
        isRead: false,
      },
    ],
  });

  console.log('CampusOD Database Seeding Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log('Credentials Summary:');
  console.log('Admin:   admin@campus.edu       | Admin@123');
  console.log('Faculty: faculty.cs@campus.edu  | Faculty@123 (Dr. Evelyn Reed, CSE)');
  console.log('Faculty: faculty.ec@campus.edu  | Faculty@123 (Prof. Marcus Vance, ECE)');
  console.log('Student: student1@campus.edu    | Student@123 (Alex Morgan, 2026CS101)');
  console.log('Student: student2@campus.edu    | Student@123 (Priya Sharma, 2026EC204)');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
