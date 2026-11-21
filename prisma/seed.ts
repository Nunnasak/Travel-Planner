import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Cat =
  | "NATURE" | "CULTURE" | "ADVENTURE" | "MARINE" | "WELLNESS" | "CULINARY"
  | "RELIGIOUS" | "AGRITOURISM" | "COMMUNITY" | "SPORTS" | "ENTERTAINMENT";

// Demo owners. The password hash is a placeholder, so these accounts cannot log in.
// They only exist to own the sample plans. Real accounts come from the register page.
const seedUsers = [
  { username: "somchai", email: "somchai@example.com" },
  { username: "suda", email: "suda@example.com" },
  { username: "niran", email: "niran@example.com" },
];

// Provinces -> cities (districts) -> places. Addresses are simplified for the demo.
const geo = [
  {
    province: "กรุงเทพมหานคร",
    cities: [
      { name: "เขตพระนคร", places: [
        { key: "grandpalace", name: "พระบรมมหาราชวัง", address: "ถนนหน้าพระลาน แขวงพระบรมมหาราชวัง เขตพระนคร" },
        { key: "watpho", name: "วัดโพธิ์", address: "2 ถนนสนามไชย แขวงพระบรมมหาราชวัง เขตพระนคร" },
      ]},
      { name: "เขตบางกอกใหญ่", places: [
        { key: "watarun", name: "วัดอรุณราชวราราม", address: "158 ถนนวังเดิม แขวงวัดอรุณ เขตบางกอกใหญ่" },
      ]},
      { name: "เขตปทุมวัน", places: [
        { key: "jimthompson", name: "บ้านจิม ทอมป์สัน", address: "6 ซอยเกษมสันต์ 2 ถนนพระราม 1 แขวงวังใหม่ เขตปทุมวัน" },
      ]},
      { name: "เขตจตุจักร", places: [
        { key: "chatuchak", name: "ตลาดนัดจตุจักร", address: "ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร" },
      ]},
    ],
  },
  {
    province: "เชียงใหม่",
    cities: [
      { name: "อำเภอเมืองเชียงใหม่", places: [
        { key: "chedi", name: "วัดเจดีย์หลวง", address: "103 ถนนพระปกเกล้า ตำบลพระสิงห์" },
        { key: "wualai", name: "ถนนคนเดินวัวลาย", address: "ถนนวัวลาย ตำบลหายยา" },
        { key: "suthep", name: "วัดพระธาตุดอยสุเทพ", address: "ถนนห้วยแก้ว ตำบลสุเทพ" },
      ]},
      { name: "อำเภอจอมทอง", places: [
        { key: "inthanon", name: "อุทยานแห่งชาติดอยอินทนนท์", address: "ตำบลบ้านหลวง อำเภอจอมทอง" },
      ]},
    ],
  },
  {
    province: "เชียงราย",
    cities: [
      { name: "อำเภอเมืองเชียงราย", places: [
        { key: "rongkhun", name: "วัดร่องขุ่น", address: "ตำบลป่าอ้อดอนชัย" },
        { key: "bluetemple", name: "วัดร่องเสือเต้น", address: "ตำบลรอบเวียง" },
        { key: "baandam", name: "พิพิธภัณฑ์บ้านดำ", address: "ตำบลนางแล" },
      ]},
    ],
  },
  {
    province: "ภูเก็ต",
    cities: [
      { name: "อำเภอเมืองภูเก็ต", places: [
        { key: "oldphuket", name: "ย่านเมืองเก่าภูเก็ต", address: "ถนนถลาง ตำบลตลาดใหญ่" },
        { key: "chalong", name: "วัดฉลอง", address: "ตำบลฉลอง" },
        { key: "promthep", name: "แหลมพรหมเทพ", address: "ตำบลราไวย์" },
      ]},
      { name: "อำเภอกะทู้", places: [
        { key: "patong", name: "หาดป่าตอง", address: "ตำบลป่าตอง" },
      ]},
    ],
  },
  {
    province: "กระบี่",
    cities: [
      { name: "อำเภอเมืองกระบี่", places: [
        { key: "aonang", name: "หาดอ่าวนาง", address: "ตำบลอ่าวนาง" },
        { key: "tigercave", name: "วัดถ้ำเสือ", address: "ตำบลท่ารั้ว" },
        { key: "phiphi", name: "เกาะพีพี", address: "ตำบลเกาะพีพี" },
      ]},
    ],
  },
  {
    province: "พระนครศรีอยุธยา",
    cities: [
      { name: "อำเภอพระนครศรีอยุธยา", places: [
        { key: "mahathat", name: "วัดมหาธาตุ", address: "ถนนชีกุน ตำบลประตูชัย" },
        { key: "srisanphet", name: "วัดพระศรีสรรเพชญ์", address: "ถนนศรีสรรเพชญ์ ตำบลประตูชัย" },
        { key: "chaiwat", name: "วัดไชยวัฒนาราม", address: "ตำบลบ้านเกาะ" },
      ]},
    ],
  },
  {
    province: "กาญจนบุรี",
    cities: [
      { name: "อำเภอเมืองกาญจนบุรี", places: [
        { key: "kwai", name: "สะพานข้ามแม่น้ำแคว", address: "ตำบลบ้านเหนือ" },
        { key: "jeath", name: "พิพิธภัณฑ์สงคราม JEATH", address: "ถนนแม่น้ำแคว ตำบลบ้านเหนือ" },
      ]},
      { name: "อำเภอศรีสวัสดิ์", places: [
        { key: "erawan", name: "อุทยานแห่งชาติเอราวัณ", address: "ตำบลท่ากระดาน" },
      ]},
    ],
  },
];

// stops: [day number, "HH:MM", place key]
type Stop = [number, string, string];
const plans: {
  name: string; description: string; days: number; category: Cat;
  isPublic: boolean; owner: number; stops: Stop[];
}[] = [
  { name: "เที่ยววัดดังกรุงเทพฯ 1 วัน", description: "ไหว้พระและชมสถาปัตยกรรมริมแม่น้ำเจ้าพระยาในวันเดียว", days: 1, category: "CULTURE", isPublic: true, owner: 0,
    stops: [[1, "09:00", "grandpalace"], [1, "11:30", "watpho"], [1, "15:00", "watarun"]] },
  { name: "กรุงเทพฯ ช้อปปิ้งสุดสัปดาห์", description: "เดินตลาด ชมพิพิธภัณฑ์ และแวะวัดโพธิ์", days: 2, category: "ENTERTAINMENT", isPublic: true, owner: 1,
    stops: [[1, "10:00", "jimthompson"], [2, "09:30", "chatuchak"], [2, "13:00", "watpho"]] },
  { name: "เชียงใหม่ 3 วัน 2 คืน", description: "วัดเก่า ถนนคนเดิน และยอดดอยสุเทพ", days: 3, category: "CULTURE", isPublic: true, owner: 0,
    stops: [[1, "10:00", "chedi"], [1, "18:00", "wualai"], [2, "09:00", "suthep"], [3, "08:00", "inthanon"]] },
  { name: "เหนือสุดแดนสยาม 4 วัน", description: "เชียงใหม่ต่อเชียงราย ธรรมชาติและศิลปะ", days: 4, category: "NATURE", isPublic: true, owner: 2,
    stops: [[1, "10:00", "chedi"], [2, "09:00", "suthep"], [2, "13:00", "inthanon"], [3, "09:00", "rongkhun"], [3, "13:00", "bluetemple"], [4, "10:00", "baandam"]] },
  { name: "สายมูเชียงราย 2 วัน", description: "วัดสวยและพิพิธภัณฑ์ในเมืองเชียงราย", days: 2, category: "RELIGIOUS", isPublic: true, owner: 1,
    stops: [[1, "09:00", "rongkhun"], [1, "14:00", "bluetemple"], [2, "10:00", "baandam"]] },
  { name: "ภูเก็ต ทะเลอันดามัน 3 วัน", description: "หาด เมืองเก่า และชมพระอาทิตย์ตก", days: 3, category: "MARINE", isPublic: true, owner: 2,
    stops: [[1, "11:00", "patong"], [1, "17:30", "promthep"], [2, "10:00", "oldphuket"], [3, "09:00", "chalong"]] },
  { name: "กระบี่ เที่ยวทะเล 3 วัน", description: "อ่าวนาง เกาะพีพี และวัดถ้ำเสือ", days: 3, category: "MARINE", isPublic: true, owner: 0,
    stops: [[1, "10:00", "aonang"], [2, "08:30", "phiphi"], [3, "09:00", "tigercave"]] },
  { name: "อยุธยา เมืองมรดกโลก 1 วัน", description: "ปั่นจักรยานชมวัดเก่าในอุทยานประวัติศาสตร์", days: 1, category: "CULTURE", isPublic: true, owner: 1,
    stops: [[1, "09:00", "mahathat"], [1, "11:00", "srisanphet"], [1, "15:00", "chaiwat"]] },
  { name: "กาญจนบุรี ธรรมชาติและประวัติศาสตร์ 2 วัน", description: "สะพานข้ามแม่น้ำแควและน้ำตกเอราวัณ", days: 2, category: "NATURE", isPublic: true, owner: 2,
    stops: [[1, "09:30", "kwai"], [1, "13:00", "jeath"], [2, "08:00", "erawan"]] },
  { name: "แผนส่วนตัว (ทดสอบ)", description: "แผนนี้เป็น Private ใช้ทดสอบว่าไม่แสดงใน Discovery", days: 1, category: "CULTURE", isPublic: false, owner: 0,
    stops: [[1, "10:00", "grandpalace"]] },
];

// --reset wipes every schedule, so only allow it on a local database:
// localhost on the host machine, or the "database" service inside docker compose.
const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "database"]);

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Check your .env file.");

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run --reset with NODE_ENV=production.");
  }
  const host = new URL(url).hostname;
  if (!LOCAL_DB_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run --reset against database host "${host}". ` +
        "--reset deletes ALL schedules and places, so it only runs on a local database."
    );
  }
}

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) assertLocalDatabase();

  if ((await prisma.province.count()) > 0) {
    if (!reset) {
      console.log("The database already has data. Run with --reset to wipe plans and places and seed again.");
      return;
    }
    // Local database only: this deletes ALL schedules, places and the demo users.
    await prisma.scheduleMember.deleteMany();
    await prisma.scheduleItem.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.location.deleteMany();
    await prisma.city.deleteMany();
    await prisma.province.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: seedUsers.map((u) => u.email) } } });
  }

  const users: number[] = [];
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { username: u.username, email: u.email, password_hash: "!seeded-no-login" },
    });
    users.push(user.user_id);
  }

  const loc: Record<string, number> = {};
  for (const p of geo) {
    const province = await prisma.province.create({ data: { province_name: p.province } });
    for (const c of p.cities) {
      const city = await prisma.city.create({
        data: { city_name: c.name, province_id: province.province_id },
      });
      for (const place of c.places) {
        const location = await prisma.location.create({
          data: { name: place.name, address: place.address, city_id: city.city_id },
        });
        loc[place.key] = location.location_id;
      }
    }
  }

  for (const plan of plans) {
    const seq: Record<number, number> = {};
    const items = plan.stops.map(([day, time, key]) => {
      if (loc[key] === undefined) throw new Error(`Unknown place key: ${key}`);
      seq[day] = (seq[day] ?? 0) + 1;
      return {
        day_no: day,
        sequence_no: seq[day],
        visit_time: new Date(`1970-01-01T${time}:00Z`),
        location_id: loc[key],
      };
    });
    await prisma.schedule.create({
      data: {
        schedule_name: plan.name,
        description: plan.description,
        total_day: plan.days,
        category: plan.category,
        is_public: plan.isPublic,
        owner_id: users[plan.owner],
        items: { create: items },
      },
    });
  }

  console.log(
    `Seeded: ${await prisma.province.count()} provinces, ${await prisma.location.count()} places, ${await prisma.schedule.count()} plans.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());