# Travel Planner

คู่มือการติดตั้ง พัฒนา และตรวจสอบโปรเจกต์ Travel Planner ด้วย Next.js, TypeScript, Prisma และ PostgreSQL

---

## 1. ภาพรวมโครงการ (Project Overview)

โปรเจกต์นี้เป็นโครงสร้างเริ่มต้นสำหรับพัฒนาแอปพลิเคชันวางแผนการเดินทาง โดยจัดโค้ดตามแนวทาง Clean Architecture เพื่อแยกส่วนติดต่อผู้ใช้ กฎทางธุรกิจ และการเชื่อมต่อบริการภายนอกออกจากกัน

ปัจจุบันมีการตั้งค่า Next.js, TypeScript, Prisma และ Docker พร้อมโครงสร้างโฟลเดอร์สำหรับการพัฒนาต่อ หน้าแรกยังเป็นหน้าว่าง และยังไม่มีฟีเจอร์จัดการทริป ระบบยืนยันตัวตน หรือ API ที่ใช้งานจริง

### เทคโนโลยีที่ใช้

| เทคโนโลยี | เวอร์ชันในโปรเจกต์ | หน้าที่ |
|---|---|---|
| Next.js | 16.3.8 | Framework สำหรับหน้าเว็บและ App Router |
| React / React DOM | 19.3.0 | ส่วนติดต่อผู้ใช้ |
| TypeScript | 7.0.2 | ตรวจสอบชนิดข้อมูล |
| Prisma ORM / Client | 7.10.0 | ตั้งค่า schema และเตรียมเครื่องมือจัดการฐานข้อมูล |
| PostgreSQL | 17 ผ่าน Docker | ฐานข้อมูล |
| Docker Compose | Compose plugin | จัดการคอนเทนเนอร์แอปและฐานข้อมูล |

เวอร์ชันแพ็กเกจอ้างอิงจาก `package.json` และ `package-lock.json` ควรใช้ `npm ci` เมื่อติดตั้งจาก repository เพื่อให้ได้ dependencies ตาม lockfile

---

## 2. สิ่งที่ต้องติดตั้งล่วงหน้า (Prerequisites)

| เครื่องมือ | เวอร์ชัน / เงื่อนไข | วัตถุประสงค์ | แหล่งดาวน์โหลด |
|---|---|---|---|
| Git | เวอร์ชันที่รองรับระบบปฏิบัติการของท่าน | Clone และจัดการซอร์สโค้ด | [Git](https://git-scm.com/downloads) |
| Node.js | แนะนำสาย 22 ตั้งแต่ 22.12 ขึ้นไป หรือสาย 24 ขึ้นไป | รัน Next.js และ Prisma บนเครื่อง | [Node.js](https://nodejs.org/en/download) |
| npm | ใช้รุ่นที่ติดตั้งมาพร้อม Node.js | ติดตั้ง dependencies และรัน scripts | [npm](https://docs.npmjs.com/) |
| Docker Desktop หรือ Docker Engine | พร้อม Compose plugin | รัน PostgreSQL หรือรันทั้งระบบผ่าน Docker | [Docker](https://www.docker.com/products/docker-desktop/) |

### สภาพแวดล้อมที่รองรับ

- Windows, macOS และ Linux สามารถพัฒนา Next.js บนเครื่องได้โดยตรง
- หากรันทั้งระบบผ่าน Docker ไม่จำเป็นต้องติดตั้ง Node.js หรือ PostgreSQL บนเครื่อง
- หากใช้ PostgreSQL ที่ติดตั้งเอง ให้ปรับ `DATABASE_URL` ให้ตรงกับฐานข้อมูลของท่าน
- คำสั่งในคู่มือนี้ให้รันจากโฟลเดอร์รากของโปรเจกต์บนเครื่อง Host เว้นแต่ระบุไว้เป็นอย่างอื่น

ตรวจสอบเครื่องมือที่ใช้:

```bash
git --version
node --version
npm --version
docker --version
docker compose version
```

---

## 3. โครงสร้างซอร์สโค้ด (Repository Architecture)

```text
.
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Route group สำหรับหน้าที่เกี่ยวกับ authentication
│   │   ├── api/                     # Next.js Route Handlers
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # หน้าแรกแบบว่าง
│   ├── components/                  # UI components
│   ├── core/
│   │   ├── constants/               # ค่าคงที่ของ core
│   │   ├── domain/                  # Entities และกฎทางธุรกิจ
│   │   ├── errors/                  # ข้อผิดพลาดของ core
│   │   ├── ports/                   # Contracts สำหรับ dependencies ภายนอก
│   │   ├── schema/                  # โครงสร้างและการตรวจสอบข้อมูลของ core
│   │   └── service/                 # Use cases และ application services
│   ├── infrastructure/
│   │   ├── factories/               # สร้าง implementations และ dependencies
│   │   ├── interface/               # Interfaces เฉพาะ infrastructure
│   │   ├── repositories/            # Implementations สำหรับเข้าถึงข้อมูล
│   │   └── container.ts             # จุดประกอบ dependencies
│   ├── lib/
│   │   ├── config.ts                # Placeholder สำหรับ configuration
│   │   └── utils.ts                 # Placeholder สำหรับ utilities
│   ├── routes/                      # นิยามเส้นทางสำหรับใช้อ้างอิงในแอป
│   ├── store/                       # Client state
│   └── proxy.ts                     # Next.js proxy แบบ pass-through
├── prisma/
│   ├── schema.prisma                # Generator และ PostgreSQL datasource
│   └── types/                       # Custom types ที่เกี่ยวข้องกับฐานข้อมูล
├── tests/
│   ├── unit/
│   ├── components/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   ├── mocks/
│   └── helpers/
├── public/                          # Static assets
├── .env.example                     # ตัวอย่าง environment variables
├── .dockerignore                    # ไฟล์ที่ไม่ส่งเข้า Docker build
├── .gitignore
├── Dockerfile                       # Multi-stage production image
├── docker-compose.yml               # Next.js และ PostgreSQL services
├── next.config.ts                   # เปิด standalone output
├── next-env.d.ts                     # Type declarations ที่ Next.js จัดการ
├── prisma.config.ts                 # Schema path, migrations path และ connection URL
├── package.json
├── package-lock.json
└── tsconfig.json                    # TypeScript และ @/ alias
```

โฟลเดอร์ที่ยังไม่มีโค้ดใช้ `.gitkeep` เพื่อให้ Git เก็บโครงสร้างไว้ ไฟล์ `container.ts`, `config.ts` และ `utils.ts` ยังเป็น placeholders

### กฎการพึ่งพาระหว่างชั้น

- `core` ไม่ควร import React, Next.js หรือ implementations จาก `infrastructure`
- `core/service` ใช้ domain rules และ contracts ที่นิยามใน `core/ports`
- `infrastructure/repositories` implement contracts ของ core โดยรับผิดชอบการเข้าถึงฐานข้อมูลหรือบริการภายนอก
- `infrastructure/factories` และ `container.ts` ประกอบ dependencies ให้ services
- `app` ทำหน้าที่รับคำขอหรือ render หน้าเว็บ และเรียกใช้ services ผ่าน dependencies ที่ประกอบไว้
- Client Components ไม่ควร import โค้ดเชื่อมต่อฐานข้อมูลหรือ configuration ที่มี secrets

ใช้ alias `@/` เพื่อ import จาก `src/` เช่น `@/core/ports/...`

`proxy.ts` อยู่ที่ `src/proxy.ts` ระดับเดียวกับ `app/` ตาม [Next.js Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) ปัจจุบันเรียกเพียง `NextResponse.next()` และยังไม่มี authentication checks หรือ redirects

---

## 4. เริ่มต้นพัฒนาบนเครื่อง (Local Getting Started)

### ขั้นตอนที่ 1: Clone repository

ใช้คำสั่งเดียวกันได้ทั้ง Bash, Zsh, PowerShell และ CMD:

```bash
git clone https://github.com/Nunnasak/Travel-Planner.git
cd Travel-Planner
```

หากมี repository อยู่แล้ว ให้เปิด terminal ที่โฟลเดอร์รากของโปรเจกต์

### ขั้นตอนที่ 2: ติดตั้ง dependencies

```bash
npm ci
```

เมื่อเพิ่มหรือเปลี่ยน dependencies ในอนาคต ให้ใช้ `npm install` และ commit ทั้ง `package.json` กับ `package-lock.json`

### ขั้นตอนที่ 3: สร้างไฟล์ environment

**macOS / Linux (Bash / Zsh):**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Windows (CMD):**

```cmd
copy .env.example .env
```

ให้คัดลอกครั้งแรกเท่านั้น หากมี `.env` อยู่แล้ว ให้ตรวจสอบค่าก่อนแก้ไขเพื่อไม่ให้เขียนทับ configuration ของท่าน

ค่าเริ่มต้น:

```dotenv
DATABASE_URL="postgresql://travel_user:travel_password@localhost:5432/travel_planner?schema=public"
```

ไฟล์ `.env` ถูก exclude จาก Git ส่วน `.env.example` ใช้เป็นตัวอย่างสำหรับทีม

### ขั้นตอนที่ 4: เริ่ม PostgreSQL

ตรวจสอบว่า Docker Desktop หรือ Docker Engine ทำงานอยู่ แล้วรัน:

```bash
docker compose up -d database
docker compose ps
```

ฐานข้อมูลควรแสดงสถานะ `healthy` หลังเริ่มทำงาน สามารถตรวจสอบ logs ได้ด้วย:

```bash
docker compose logs database
```

หากใช้ PostgreSQL ที่ติดตั้งเอง สามารถข้ามขั้นตอนนี้และตั้งค่า `DATABASE_URL` ให้ถูกต้องได้

### ขั้นตอนที่ 5: ตรวจสอบ Prisma schema

```bash
npm run db:validate
```

คำสั่งนี้ตรวจสอบ config และ schema ไม่ได้ยืนยันการเชื่อมต่อฐานข้อมูล ปัจจุบัน schema ยังไม่มี models จึงยังไม่ต้องสร้าง migration หรือ generate client

### ขั้นตอนที่ 6: เริ่ม development server

```bash
npm run dev
```

เปิด <http://localhost:3000> หน้าแรกจะเป็นหน้าว่างตาม scaffold ปัจจุบัน และ Next.js จะ reload เมื่อแก้ไขโค้ด

หยุด development server ด้วย `Ctrl+C` หน้าเว็บใน scaffold ยังไม่ได้เรียกฐานข้อมูล จึงสามารถรัน Next.js ได้แม้ยังไม่ได้เริ่ม PostgreSQL

---

## 5. การรันผ่าน Docker (Docker Guide)

### 5.1 Build และเริ่มทั้งระบบ

รันจากโฟลเดอร์รากบนเครื่อง Host:

```bash
docker compose up --build -d
docker compose ps
```

| Service | การเข้าถึงจาก Host | หน้าที่ |
|---|---|---|
| `app` | `http://localhost:3000` | Next.js production server |
| `database` | `localhost:5432` | PostgreSQL สำหรับเครื่องมือพัฒนาบนเครื่อง |

ภายใน Docker network แอปใช้ hostname `database`:

```text
postgresql://travel_user:travel_password@database:5432/travel_planner?schema=public
```

Compose กำหนด `DATABASE_URL` ของแอปไว้ใน `docker-compose.yml` โดยตรง จึงไม่ต้องสร้าง `.env` เพื่อรัน Docker flow นี้ การแก้ `.env` อย่างเดียวจะไม่เปลี่ยนค่าที่ Compose ส่งให้คอนเทนเนอร์

### 5.2 ดู logs และหยุดระบบ

```bash
docker compose logs -f app
docker compose logs -f database
docker compose down
```

กด `Ctrl+C` เพื่อออกจากการติดตาม logs การใช้ `docker compose down` จะหยุดและนำคอนเทนเนอร์ออก แต่ยังเก็บข้อมูลใน volume `postgres_data`

### 5.3 ลักษณะของ Docker image

Dockerfile แบ่งเป็นสาม stages:

1. `dependencies`: ติดตั้งแพ็กเกจด้วย `npm ci`
2. `builder`: สร้าง production build ด้วย `npm run build`
3. `runner`: รัน standalone server ด้วย `node server.js` ภายใต้ผู้ใช้ `node`

คอนเทนเนอร์นี้เป็น production runtime ไม่มี bind mount หรือ hot reload เมื่อแก้โค้ด ให้ build image ใหม่ด้วย `docker compose up --build -d` สำหรับการพัฒนาที่ต้องการ hot reload ให้ใช้ `npm run dev` บนเครื่องตามหัวข้อ 4

Docker flow ปัจจุบันยังไม่ generate Prisma Client หรือ apply migrations อัตโนมัติ ตัว runner ไม่ได้เตรียม Prisma CLI สำหรับงาน migration ให้รันคำสั่งฐานข้อมูลจากเครื่องที่ติดตั้ง dependencies ของโปรเจกต์

### 5.4 รัน standalone build บนเครื่องโดยไม่ใช้ Docker

โปรเจกต์กำหนด `output: 'standalone'` จึงใช้ `server.js` สำหรับ production runtime แทน `npm start` ซึ่งยังชี้ไปที่ `next start`

สร้าง build แล้วคัดลอก static assets ตาม shell ที่ใช้งาน:

**macOS / Linux (Bash / Zsh):**

```bash
npm run build
mkdir -p .next/standalone/.next
cp -R public .next/standalone/
cp -R .next/static .next/standalone/.next/
node .next/standalone/server.js
```

**Windows (PowerShell):**

```powershell
npm run build
New-Item -ItemType Directory -Force .next/standalone/.next
Copy-Item -Recurse -Force public .next/standalone/
Copy-Item -Recurse -Force .next/static .next/standalone/.next/
node .next/standalone/server.js
```

เปิด URL ที่ server แสดงใน terminal ส่วน Dockerfile คัดลอก assets เหล่านี้ให้แล้ว จึงไม่ต้องทำขั้นตอนนี้เมื่อใช้ Docker

---

## 6. การจัดการฐานข้อมูล (Prisma & PostgreSQL)

### 6.1 ไฟล์ที่เกี่ยวข้อง

| ไฟล์ / โฟลเดอร์ | หน้าที่ |
|---|---|
| `prisma/schema.prisma` | นิยาม datasource, generator และ models ในอนาคต |
| `prisma.config.ts` | โหลด `.env` และตั้งค่า connection URL กับ paths |
| `prisma/types/` | Custom types ที่เกี่ยวข้องกับฐานข้อมูล |
| `prisma/migrations/` | โฟลเดอร์ที่จะเกิดขึ้นเมื่อสร้าง migration แรก |
| `src/generated/prisma/` | Output ของ generated client ซึ่ง exclude จาก Git |

### 6.2 หลังเพิ่ม models แล้ว

เพิ่ม models ใน `prisma/schema.prisma` จากนั้นรันจากเครื่อง Host:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate -- --name init
```

ใช้ `init` สำหรับ migration แรก เมื่อปรับ schema ในครั้งต่อไป ให้ตั้งชื่อ migration ที่อธิบายการเปลี่ยนแปลง

การสร้าง migration ต้องมี PostgreSQL ที่เชื่อมต่อได้ หากเปลี่ยน schema หลังจากนั้น ให้ regenerate client ให้ตรงกับ schema ด้วย

Commit schema และ migration files ที่สร้างขึ้น แต่ไม่ต้อง commit `src/generated/prisma/` ทั้งนี้การ generate client เพียงอย่างเดียวยังไม่สร้าง repository หรือการเชื่อมต่อฐานข้อมูลในแอป

### 6.3 เปิด Prisma Studio

หลังมี models และ apply migrations แล้ว:

```bash
npm run db:studio
```

เปิด URL ที่ Prisma แสดงใน terminal เพื่อดูและจัดการข้อมูล

---

## 7. การตรวจสอบและโครงสร้างการทดสอบ (Validation & Testing)

### 7.1 ตรวจสอบ TypeScript

หากเพิ่ง clone โปรเจกต์และยังไม่ได้รัน `dev` หรือ `build` ให้สร้าง Next.js types ก่อน:

```bash
npm exec -- next typegen
npm run typecheck
```

### 7.2 ตรวจสอบ production build

```bash
npm run build
```

Build ที่สำเร็จควรแสดง route `/` และ Proxy โดยไม่มี compilation errors คำสั่งนี้ตรวจสอบ build แต่ไม่ได้ทดสอบการเชื่อมต่อฐานข้อมูล

### 7.3 ตรวจสอบ Prisma และ Compose configuration

หลังตั้งค่า `.env`:

```bash
npm run db:validate
docker compose config --quiet
```

Compose configuration ที่ถูกต้องจะจบด้วย exit code 0 การตรวจสอบ configuration ไม่เท่ากับการทดสอบ build หรือรันคอนเทนเนอร์จริง

### 7.4 หน้าที่ของโฟลเดอร์ tests

| โฟลเดอร์ | งานทดสอบที่จะจัดเก็บ |
|---|---|
| `tests/unit/` | Domain rules และ services แบบแยกส่วน |
| `tests/components/` | พฤติกรรมของ UI components |
| `tests/integration/` | การทำงานร่วมกันของ services, repositories และฐานข้อมูล |
| `tests/e2e/` | การใช้งานแอปผ่าน browser |
| `tests/fixtures/` | ข้อมูลตัวอย่างที่ใช้ทดสอบ |
| `tests/mocks/` | Dependencies จำลอง |
| `tests/helpers/` | Utilities สำหรับการทดสอบ |

ปัจจุบันโฟลเดอร์เหล่านี้เป็น placeholders ยังไม่มี test framework, test cases หรือ `npm test` script และยังไม่ได้ตั้งค่า ESLint, formatter หรือ CI

---

## 8. แนวทางการวางโค้ด (Where to Put Your Code)

| งานที่ต้องพัฒนา | ตำแหน่งโค้ด | ตำแหน่งทดสอบ |
|---|---|---|
| หน้าเว็บและ layouts | `src/app/` | `tests/e2e/` |
| UI components | `src/components/` | `tests/components/` |
| Entities และ business rules | `src/core/domain/` | `tests/unit/` |
| Use cases / services | `src/core/service/` | `tests/unit/` |
| Contracts สำหรับ repositories หรือ external services | `src/core/ports/` | ตรวจสอบผ่าน tests ของ services และ implementations |
| การเข้าถึงฐานข้อมูล | `src/infrastructure/repositories/` | `tests/integration/` |
| Dependency assembly | `src/infrastructure/factories/`, `container.ts` | `tests/integration/` |
| API Route Handlers | `src/app/api/` | `tests/integration/`, `tests/e2e/` |
| Client state | `src/store/` | `tests/unit/` |
| Database models | `prisma/schema.prisma` | `tests/integration/` |

ตารางนี้เป็นแนวทางสำหรับการพัฒนาต่อ ยังไม่มี implementations หรือ tests ของฟีเจอร์เหล่านี้ใน scaffold

---

## 9. ตารางสรุปคำสั่งที่ใช้บ่อย (Command Cheat Sheet)

คำสั่งทั้งหมดรันจากโฟลเดอร์รากบนเครื่อง Host:

| กิจกรรม | คำสั่ง |
|---|---|
| ติดตั้งตาม lockfile | `npm ci` |
| รัน development server | `npm run dev` |
| สร้าง Next.js types | `npm exec -- next typegen` |
| ตรวจสอบ TypeScript | `npm run typecheck` |
| สร้าง production build | `npm run build` |
| รัน standalone server หลังเตรียม assets ตามหัวข้อ 5.4 | `node .next/standalone/server.js` |
| ตรวจสอบ Prisma schema | `npm run db:validate` |
| Generate client หลังมี models | `npm run db:generate` |
| สร้าง migration หลังมี models | `npm run db:migrate -- --name describe_change` |
| เปิด Prisma Studio | `npm run db:studio` |
| เริ่มเฉพาะฐานข้อมูล | `docker compose up -d database` |
| Build และเริ่มทั้งระบบ | `docker compose up --build -d` |
| ตรวจสอบสถานะคอนเทนเนอร์ | `docker compose ps` |
| ดู logs ของแอป | `docker compose logs -f app` |
| ตรวจสอบ Compose config | `docker compose config --quiet` |
| หยุดคอนเทนเนอร์และเก็บข้อมูล | `docker compose down` |

---

## 10. การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

### ปัญหาที่ 1: เปิด localhost แล้วเห็นหน้าว่าง

**สาเหตุ:** `src/app/page.tsx` ยัง render เพียง `<main />`

**วิธีตรวจสอบ:** ดู terminal ว่า Next.js เริ่มทำงานสำเร็จหรือไม่ หน้าว่างเป็นผลลัพธ์ปัจจุบันของ scaffold และจะมีเนื้อหาเมื่อเริ่มพัฒนา UI

### ปัญหาที่ 2: Prisma แจ้งว่าไม่พบ DATABASE_URL

**สาเหตุ:** ยังไม่มี `.env` หรือไม่มีตัวแปร `DATABASE_URL`

**วิธีแก้:** สร้าง `.env` จาก `.env.example` ตามคำสั่งของ shell ในหัวข้อ 4 และรัน Prisma จากโฟลเดอร์รากของโปรเจกต์

### ปัญหาที่ 3: เชื่อมต่อ PostgreSQL ไม่ได้

**วิธีตรวจสอบ:**

```bash
docker compose ps
docker compose logs database
```

ตรวจสอบว่า database เป็น `healthy` และ `DATABASE_URL` ใช้ `localhost:5432` เมื่อรันบน Host หรือ `database:5432` เมื่อรันจาก app container

### ปัญหาที่ 4: Port 3000 หรือ 5432 ถูกใช้งานอยู่

สำหรับ Next.js บนเครื่อง สามารถใช้ port อื่นได้:

```bash
npm run dev -- --port 3001
```

สำหรับ Docker ให้เปลี่ยน Host port ใน `docker-compose.yml` เช่น `3001:3000` หรือ `127.0.0.1:5433:5432` หากเปลี่ยน Host port ของฐานข้อมูลเป็น 5433 ให้ปรับ `.env` ของเครื่องเป็น `localhost:5433` ด้วย ส่วน URL ภายใน Docker ยังคงใช้ `database:5432`

### ปัญหาที่ 5: Docker ติดต่อ Engine ไม่ได้

**วิธีแก้:** เปิด Docker Desktop หรือเริ่ม Docker Engine แล้วตรวจสอบด้วย:

```bash
docker info
```

### ปัญหาที่ 6: Generate client ไม่ได้เพราะ schema ยังไม่มี models

**วิธีแก้:** ในขั้น scaffold ให้ใช้ `npm run db:validate` ก่อน เพิ่ม models เมื่อเริ่มพัฒนาฟีเจอร์ แล้วจึง generate client และสร้าง migration

### ปัญหาที่ 7: TypeScript ไม่พบไฟล์ types ภายใน .next

**วิธีแก้:** สร้าง types ใหม่แล้วตรวจสอบอีกครั้ง:

```bash
npm exec -- next typegen
npm run typecheck
```

ไม่ต้องแก้ `next-env.d.ts` ด้วยตนเอง เพราะ Next.js เป็นผู้จัดการไฟล์นี้

### ปัญหาที่ 8: npm start แจ้งเตือนเรื่อง standalone configuration

**สาเหตุ:** `npm start` ใน `package.json` ใช้ `next start` แต่โปรเจกต์กำหนด `output: 'standalone'`

**วิธีแก้:** ใช้ Docker production flow:

```bash
docker compose up --build -d
```

หรือรัน standalone server บนเครื่องตามหัวข้อ 5.4 หากต้องการพัฒนาพร้อม hot reload ให้ใช้ `npm run dev`