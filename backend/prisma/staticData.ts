import { PrismaClient, Role, AssetStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  console.log("🌱 Seeding database...");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ActivityLog",
      "Notification",
      "AuditItem",
      "AuditCycleAuditor",
      "AuditCycle",
      "MaintenanceRequest",
      "Booking",
      "AllocationRequest",
      "Allocation",
      "Asset",
      "AssetCategory",
      "User",
      "Department"
    RESTART IDENTITY CASCADE;
  `);

  /*
  =====================================
  PASSWORD
  =====================================
  */

  const passwordHash = await bcrypt.hash("Password@123", 10);

  /*
  =====================================
  DEPARTMENTS
  =====================================
  */

  const engineering = await prisma.department.create({
    data: {
      name: "Engineering"
    }
  });

  const hr = await prisma.department.create({
    data: {
      name: "Human Resources"
    }
  });

  const finance = await prisma.department.create({
    data: {
      name: "Finance"
    }
  });

  const marketing = await prisma.department.create({
    data: {
      name: "Marketing"
    }
  });

  const it = await prisma.department.create({
    data: {
      name: "IT Support"
    }
  });

  console.log("✅ Departments Created");

  /*
  =====================================
  USERS
  =====================================
  */

  const admin = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "admin@assetflow.com",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: "Priya Shah",
      email: "manager@assetflow.com",
      passwordHash,
      role: Role.ASSET_MANAGER,
      departmentId: it.id
    }
  });

  const engHead = await prisma.user.create({
    data: {
      name: "Vikram Rao",
      email: "vikram@assetflow.com",
      passwordHash,
      role: Role.DEPARTMENT_HEAD,
      departmentId: engineering.id
    }
  });

  const hrHead = await prisma.user.create({
    data: {
      name: "Neha Kapoor",
      email: "neha@assetflow.com",
      passwordHash,
      role: Role.DEPARTMENT_HEAD,
      departmentId: hr.id
    }
  });

  const rahul = await prisma.user.create({
    data: {
      name: "Rahul Mehta",
      email: "rahul@assetflow.com",
      passwordHash,
      departmentId: engineering.id
    }
  });

  const sneha = await prisma.user.create({
    data: {
      name: "Sneha Gupta",
      email: "sneha@assetflow.com",
      passwordHash,
      departmentId: engineering.id
    }
  });

  const arjun = await prisma.user.create({
    data: {
      name: "Arjun Nair",
      email: "arjun@assetflow.com",
      passwordHash,
      departmentId: finance.id
    }
  });

  const aditi = await prisma.user.create({
    data: {
      name: "Aditi Singh",
      email: "aditi@assetflow.com",
      passwordHash,
      departmentId: hr.id
    }
  });

  const rohan = await prisma.user.create({
    data: {
      name: "Rohan Patel",
      email: "rohan@assetflow.com",
      passwordHash,
      departmentId: it.id
    }
  });

  const karan = await prisma.user.create({
    data: {
      name: "Karan Verma",
      email: "karan@assetflow.com",
      passwordHash,
      departmentId: marketing.id
    }
  });

  const aman = await prisma.user.create({
    data: {
      name: "Aman Khanna",
      email: "aman@assetflow.com",
      passwordHash,
      departmentId: marketing.id
    }
  });

  const isha = await prisma.user.create({
    data: {
      name: "Isha Joshi",
      email: "isha@assetflow.com",
      passwordHash,
      departmentId: finance.id
    }
  });

  console.log("✅ Users Created");

  /*
  =====================================
  DEPARTMENT HEADS
  =====================================
  */

  await prisma.department.update({
    where: {
      id: engineering.id
    },
    data: {
      headId: engHead.id
    }
  });

  await prisma.department.update({
    where: {
      id: hr.id
    },
    data: {
      headId: hrHead.id
    }
  });

  console.log("✅ Department Heads Assigned");

  /*
  =====================================
  CATEGORIES
  =====================================
  */

  const laptop = await prisma.assetCategory.create({
    data: {
      name: "Laptop"
    }
  });

  const monitor = await prisma.assetCategory.create({
    data: {
      name: "Monitor"
    }
  });

  const projector = await prisma.assetCategory.create({
    data: {
      name: "Projector"
    }
  });

  const meetingRoom = await prisma.assetCategory.create({
    data: {
      name: "Meeting Room"
    }
  });

  const printer = await prisma.assetCategory.create({
    data: {
      name: "Printer"
    }
  });

  const vehicle = await prisma.assetCategory.create({
    data: {
      name: "Vehicle"
    }
  });

  console.log("✅ Categories Created");

  /*
  =====================================
  ASSETS
  =====================================
  */

  await prisma.asset.createMany({
    data: [

      {
        assetTag: "AF-001",
        name: "Dell Latitude 5440",
        categoryId: laptop.id,
        serialNumber: "DL5440-1001",
        location: "Engineering",
        condition: "Excellent",
        status: AssetStatus.ALLOCATED
      },

      {
        assetTag: "AF-002",
        name: "HP EliteBook 840",
        categoryId: laptop.id,
        serialNumber: "HP840-2001",
        location: "Engineering",
        condition: "Good",
        status: AssetStatus.AVAILABLE
      },

      {
        assetTag: "AF-003",
        name: "MacBook Pro M3",
        categoryId: laptop.id,
        serialNumber: "MBP3001",
        location: "Engineering",
        condition: "Excellent",
        status: AssetStatus.ALLOCATED
      },

      {
        assetTag: "AF-004",
        name: "Lenovo ThinkPad X1",
        categoryId: laptop.id,
        serialNumber: "LTX1004",
        location: "IT Support",
        condition: "Battery Issue",
        status: AssetStatus.UNDER_MAINTENANCE
      },

      {
        assetTag: "AF-005",
        name: "Dell 27 Monitor",
        categoryId: monitor.id,
        location: "Engineering",
        condition: "Excellent",
        status: AssetStatus.AVAILABLE
      },

      {
        assetTag: "AF-006",
        name: "LG UltraWide Monitor",
        categoryId: monitor.id,
        location: "Finance",
        condition: "Good",
        status: AssetStatus.ALLOCATED
      },

      {
        assetTag: "AF-007",
        name: "Epson Projector",
        categoryId: projector.id,
        location: "Conference Room",
        isBookable: true,
        status: AssetStatus.AVAILABLE
      },

      {
        assetTag: "AF-008",
        name: "Sony Projector",
        categoryId: projector.id,
        location: "Board Room",
        isBookable: true,
        status: AssetStatus.RESERVED
      },

      {
        assetTag: "AF-009",
        name: "Meeting Room Alpha",
        categoryId: meetingRoom.id,
        location: "First Floor",
        isBookable: true,
        status: AssetStatus.AVAILABLE
      },

      {
        assetTag: "AF-010",
        name: "Meeting Room Beta",
        categoryId: meetingRoom.id,
        location: "Second Floor",
        isBookable: true,
        status: AssetStatus.RESERVED
      },

      {
        assetTag: "AF-011",
        name: "Canon Laser Printer",
        categoryId: printer.id,
        location: "HR",
        status: AssetStatus.AVAILABLE
      },

      {
        assetTag: "AF-012",
        name: "Toyota Innova",
        categoryId: vehicle.id,
        location: "Parking",
        isBookable: true,
        status: AssetStatus.AVAILABLE
      }

    ]
  });

  console.log("✅ Assets Created");

}

async function seedRelations() {

/*
=====================================
FETCH USERS
=====================================
*/

const users = await prisma.user.findMany();

const adminUser = users.find(u => u.role === Role.ADMIN)!;
const managerUser = users.find(u => u.role === Role.ASSET_MANAGER)!;

const rahul = users.find(u => u.email === "rahul@assetflow.com")!;
const sneha = users.find(u => u.email === "sneha@assetflow.com")!;
const arjun = users.find(u => u.email === "arjun@assetflow.com")!;
const karan = users.find(u => u.email === "karan@assetflow.com")!;
const aman = users.find(u => u.email === "aman@assetflow.com")!;
const aditi = users.find(u => u.email === "aditi@assetflow.com")!;
const isha = users.find(u => u.email === "isha@assetflow.com")!;

const engineeringDept = await prisma.department.findFirst({
    where: { name: "Engineering" }
});

const financeDept = await prisma.department.findFirst({
    where: { name: "Finance" }
});

const hrDept = await prisma.department.findFirst({
    where: { name: "Human Resources" }
});

const marketingDept = await prisma.department.findFirst({
    where: { name: "Marketing" }
});

/*
=====================================
FETCH ASSETS
=====================================
*/

const assets = await prisma.asset.findMany();

const laptop1 = assets.find(a => a.assetTag === "AF-001")!;
const laptop2 = assets.find(a => a.assetTag === "AF-003")!;
const monitor = assets.find(a => a.assetTag === "AF-006")!;

/*
=====================================
ALLOCATIONS
=====================================
*/

await prisma.allocation.createMany({

    data: [

        {
            assetId: laptop1.id,
            employeeId: rahul.id,
            departmentId: engineeringDept!.id,
            status: "ACTIVE"
        },

        {
            assetId: laptop2.id,
            employeeId: sneha.id,
            departmentId: engineeringDept!.id,
            status: "ACTIVE"
        },

        {
            assetId: monitor.id,
            employeeId: arjun.id,
            departmentId: financeDept!.id,
            status: "ACTIVE"
        }

    ]

});

console.log("✅ Allocations Created");

/*
=====================================
ALLOCATION REQUESTS
=====================================
*/

await prisma.allocationRequest.create({

    data: {

        assetId: laptop1.id,

        type: "TRANSFER",

        requestedById: rahul.id,

        fromEmployeeId: rahul.id,

        toEmployeeId: arjun.id,

        fromDepartmentId: engineeringDept!.id,

        toDepartmentId: financeDept!.id,

        status: "REQUESTED"

    }

});

await prisma.allocationRequest.create({

    data: {

        assetId: laptop2.id,

        type: "TRANSFER",

        requestedById: sneha.id,

        fromEmployeeId: sneha.id,

        toEmployeeId: karan.id,

        fromDepartmentId: engineeringDept!.id,

        toDepartmentId: marketingDept!.id,

        status: "APPROVED",

        approvedById: managerUser.id,

        resolvedAt: new Date()

    }

});

await prisma.allocationRequest.create({

    data: {

        assetId: laptop2.id,

        type: "ALLOCATION",

        requestedById: isha.id,

        toEmployeeId: isha.id,

        toDepartmentId: financeDept!.id,

        status: "REQUESTED"

    }

});

await prisma.allocationRequest.create({

    data: {

        assetId: monitor.id,

        type: "ALLOCATION",

        requestedById: aman.id,

        toEmployeeId: aman.id,

        toDepartmentId: marketingDept!.id,

        status: "REJECTED",

        approvedById: managerUser.id,

        resolvedAt: new Date()

    }

});

console.log("✅ Allocation Requests Created");

/*
=====================================
BOOKINGS
=====================================
*/

const projector = assets.find(a => a.assetTag === "AF-007")!;
const projector2 = assets.find(a => a.assetTag === "AF-008")!;
const roomAlpha = assets.find(a => a.assetTag === "AF-009")!;
const roomBeta = assets.find(a => a.assetTag === "AF-010")!;
const vehicle = assets.find(a => a.assetTag === "AF-012")!;

const now = new Date();

const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    10,
    0
);

const tomorrowEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    11,
    0
);

await prisma.booking.createMany({

    data: [

        {

            assetId: roomAlpha.id,

            bookedById: rahul.id,

            departmentId: engineeringDept!.id,

            purpose: "Sprint Planning",

            startTime: tomorrow,

            endTime: tomorrowEnd,

            status: "UPCOMING"

        },

        {

            assetId: projector.id,

            bookedById: arjun.id,

            departmentId: financeDept!.id,

            purpose: "Finance Presentation",

            startTime: new Date(),

            endTime: new Date(Date.now() + 60 * 60 * 1000),

            status: "ONGOING"

        },

        {

            assetId: roomBeta.id,

            bookedById: aditi.id,

            departmentId: hrDept!.id,

            purpose: "Interview Session",

            startTime: new Date(Date.now() - 86400000),

            endTime: new Date(Date.now() - 82800000),

            status: "COMPLETED"

        },

        {

            assetId: vehicle.id,

            bookedById: karan.id,

            departmentId: marketingDept!.id,

            purpose: "Client Visit",

            startTime: new Date(Date.now() + 172800000),

            endTime: new Date(Date.now() + 180000000),

            status: "UPCOMING"

        },

        {

            assetId: projector2.id,

            bookedById: aman.id,

            departmentId: marketingDept!.id,

            purpose: "Marketing Demo",

            startTime: new Date(Date.now() + 86400000),

            endTime: new Date(Date.now() + 90000000),

            status: "CANCELLED"

        }

    ]

});

console.log("✅ Bookings Created");

}

main()
  .then(async () => {
    await seedRelations();
  })
  .then(async () => {

    await prisma.$disconnect();

  })
  .catch(async (e) => {

    console.error(e);

    await prisma.$disconnect();

    process.exit(1);

  });