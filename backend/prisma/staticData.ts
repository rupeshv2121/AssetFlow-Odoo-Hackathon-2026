import { PrismaClient, Role, AssetStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  console.log("🌱 Seeding database...");

  console.log("🧹 Cleaning up old database records...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycleAuditor.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.allocationRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.department.updateMany({ data: { headId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  console.log("🧹 Database clean!");

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
        location: "IT Support",
        condition: "Good",
        status: AssetStatus.ALLOCATED
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
        status: AssetStatus.ALLOCATED
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
const rohan = users.find(u => u.email === "rohan@assetflow.com")!;

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

const itDept = await prisma.department.findFirst({
    where: { name: "IT Support" }
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
const laptop3 = assets.find(a => a.assetTag === "AF-002")!;
const printerAsset = assets.find(a => a.assetTag === "AF-011")!;

/*
=====================================
ALLOCATIONS
=====================================
*/

const DAY_MS = 24 * 60 * 60 * 1000;

await prisma.allocation.createMany({

    data: [

        {
            assetId: laptop1.id,
            employeeId: rahul.id,
            departmentId: engineeringDept!.id,
            status: "ACTIVE",
            // Overdue on purpose — gives the Dashboard's Overdue Returns
            // table and KPI real data to show instead of an empty state.
            expectedReturnDate: new Date(Date.now() - 5 * DAY_MS)
        },

        {
            assetId: laptop2.id,
            employeeId: sneha.id,
            departmentId: engineeringDept!.id,
            status: "ACTIVE",
            expectedReturnDate: new Date(Date.now() + 10 * DAY_MS)
        },

        {
            assetId: monitor.id,
            employeeId: arjun.id,
            departmentId: financeDept!.id,
            status: "ACTIVE",
            // Also overdue — one overdue item per seeded department (Engineering, Finance)
            expectedReturnDate: new Date(Date.now() - 2 * DAY_MS)
        },

        {
            assetId: laptop3.id,
            employeeId: rohan.id,
            departmentId: itDept!.id,
            status: "ACTIVE",
            expectedReturnDate: new Date(Date.now() + 15 * DAY_MS)
        },

        {
            assetId: printerAsset.id,
            employeeId: aditi.id,
            departmentId: hrDept!.id,
            status: "ACTIVE",
            // Permanent office equipment — no expected return date on purpose,
            // exercises the "no due date" rendering path (vs. overdue/on-track).
            expectedReturnDate: null
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

// Pending transfer out of HR into IT — gives the HR Department Head a live
// "Pending Transfers" item to review/approve on their own dashboard.
await prisma.allocationRequest.create({

    data: {

        assetId: printerAsset.id,

        type: "TRANSFER",

        requestedById: aditi.id,

        fromEmployeeId: aditi.id,

        toEmployeeId: rohan.id,

        fromDepartmentId: hrDept!.id,

        toDepartmentId: itDept!.id,

        status: "REQUESTED"

    }

});

// Fresh allocation claim on a still-unassigned available asset (AF-005),
// so the "claim an available asset" flow can be exercised without first
// needing to free one up.
const dellMonitor = assets.find(a => a.assetTag === "AF-005")!;

await prisma.allocationRequest.create({

    data: {

        assetId: dellMonitor.id,

        type: "ALLOCATION",

        requestedById: karan.id,

        toEmployeeId: karan.id,

        toDepartmentId: marketingDept!.id,

        status: "REQUESTED"

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

/*
=====================================
MAINTENANCE REQUESTS
=====================================
*/

const threeDaysAgo = new Date(Date.now() - 3 * DAY_MS);

await prisma.maintenanceRequest.createMany({

    data: [

        {
            // Matches AF-004's seeded UNDER_MAINTENANCE status.
            assetId: assets.find(a => a.assetTag === "AF-004")!.id,
            raisedById: rohan.id,
            issueDescription: "Battery drains within 20 minutes, needs replacement",
            priority: "HIGH",
            status: "IN_PROGRESS",
            approvedById: managerUser.id,
            technicianName: "Ravi Kumar (IT Technician)"
        },

        {
            // Left PENDING so Approve/Reject can be tested live.
            assetId: laptop1.id,
            raisedById: rahul.id,
            issueDescription: "Trackpad occasionally unresponsive",
            priority: "MEDIUM",
            status: "PENDING"
        },

        {
            // Left APPROVED so "Assign Technician" can be tested live.
            assetId: laptop2.id,
            raisedById: sneha.id,
            issueDescription: "Minor scratch on lid, cosmetic only, requesting inspection",
            priority: "LOW",
            status: "APPROVED",
            approvedById: managerUser.id
        },

        {
            assetId: monitor.id,
            raisedById: arjun.id,
            issueDescription: "Flickering resolved after cable replacement",
            priority: "MEDIUM",
            status: "RESOLVED",
            approvedById: managerUser.id,
            technicianName: "External Vendor - ScreenFix",
            resolvedAt: threeDaysAgo,
            createdAt: new Date(Date.now() - 6 * DAY_MS)
        },

        {
            assetId: assets.find(a => a.assetTag === "AF-009")!.id,
            raisedById: rahul.id,
            issueDescription: "Requesting a repaint — cosmetic only",
            priority: "LOW",
            status: "REJECTED",
            approvedById: managerUser.id
        },

        {
            // Left PENDING (CRITICAL) so it stands out in the approval queue.
            assetId: assets.find(a => a.assetTag === "AF-012")!.id,
            raisedById: karan.id,
            issueDescription: "Engine warning light on dashboard, needs immediate inspection",
            priority: "CRITICAL",
            status: "PENDING"
        }

    ]

});

console.log("✅ Maintenance Requests Created");

/*
=====================================
NOTIFICATIONS
=====================================
*/

await prisma.notification.createMany({

    data: [

        {
            userId: rahul.id,
            type: "OVERDUE_RETURN",
            message: "Your return for Dell Latitude 5440 (AF-001) is overdue",
            relatedEntityType: "Asset",
            relatedEntityId: laptop1.id,
            isRead: false
        },

        {
            userId: arjun.id,
            type: "OVERDUE_RETURN",
            message: "Your return for LG UltraWide Monitor (AF-006) is overdue",
            relatedEntityType: "Asset",
            relatedEntityId: monitor.id,
            isRead: false
        },

        {
            userId: sneha.id,
            type: "MAINTENANCE_APPROVED",
            message: "Your maintenance request for MacBook Pro M3 (AF-003) was approved",
            relatedEntityType: "MaintenanceRequest",
            isRead: true
        },

        {
            userId: rahul.id,
            type: "MAINTENANCE_REJECTED",
            message: "Your maintenance request for Meeting Room Alpha (AF-009) was rejected",
            relatedEntityType: "MaintenanceRequest",
            isRead: true
        },

        {
            userId: aditi.id,
            type: "ASSET_ASSIGNED",
            message: "You've been allocated Canon Laser Printer (AF-011)",
            relatedEntityType: "Asset",
            relatedEntityId: printerAsset.id,
            isRead: true
        },

        {
            userId: karan.id,
            type: "BOOKING_CONFIRMED",
            message: "Your booking for Toyota Innova (AF-012) is confirmed",
            relatedEntityType: "Booking",
            isRead: false
        }

    ]

});

console.log("✅ Notifications Created");

/*
=====================================
ACTIVITY LOG
=====================================
*/

await prisma.activityLog.createMany({

    data: [

        {
            userId: adminUser.id,
            action: "CREATE_ASSET",
            entityType: "Asset",
            entityId: printerAsset.id,
            metadata: { assetTag: "AF-011", name: "Canon Laser Printer" }
        },

        {
            userId: managerUser.id,
            action: "APPROVE_MAINTENANCE_REQUEST",
            entityType: "MaintenanceRequest",
            metadata: { assetTag: "AF-006" }
        },

        {
            userId: managerUser.id,
            action: "REJECT_MAINTENANCE_REQUEST",
            entityType: "MaintenanceRequest",
            metadata: { assetTag: "AF-009" }
        },

        {
            userId: managerUser.id,
            action: "APPROVE_ALLOCATION_REQUEST",
            entityType: "AllocationRequest",
            metadata: { assetTag: "AF-003" }
        },

        {
            userId: sneha.id,
            action: "CREATE_BOOKING",
            entityType: "Booking",
            metadata: { assetTag: "AF-010" }
        }

    ]

});

console.log("✅ Activity Log Seeded");

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