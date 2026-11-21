import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Category } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// 1. ข้อมูลครบทั้ง 77 จังหวัดในประเทศไทย
const ALL_77_PROVINCES: string[] = [
  // ภาคกลาง & กรุงเทพฯ (22 จังหวัด)
  'กรุงเทพมหานคร', 'กำแพงเพชร', 'ชัยนาท', 'นครนายก', 'นครปฐม',
  'นครสวรรค์', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา', 'พิจิตร',
  'พิษณุโลก', 'เพชรบูรณ์', 'ลพบุรี', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สระบุรี',
  'อ่างทอง', 'อุทัยธานี',
  // ภาคเหนือ (9 จังหวัด)
  'เชียงราย', 'เชียงใหม่', 'น่าน', 'พะเยา', 'แพร่',
  'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'อุตรดิตถ์',
  // ภาคตะวันออกเฉียงเหนือ (20 จังหวัด)
  'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา',
  'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร',
  'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี',
  // ภาคตะวันออก (7 จังหวัด)
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ตราด', 'ปราจีนบุรี',
  'ระยอง', 'สระแก้ว',
  // ภาคตะวันตก (5 จังหวัด)
  'กาญจนบุรี', 'ตาก', 'ประจวบคีรีขันธ์', 'เพชรบุรี', 'ราชบุรี',
  // ภาคใต้ (14 จังหวัด)
  'กระบี่', 'ชุมพร', 'ตรัง', 'นครศรีธรรมราช', 'นราธิวาส',
  'ปัตตานี', 'พังงา', 'พัทลุง', 'ภูเก็ต', 'ระนอง',
  'สตูล', 'สงขลา', 'สุราษฎร์ธานี', 'ยะลา',
];

// 2. ข้อมูลอำเภอและสถานที่ท่องเที่ยวไฮไลต์แยกตามจังหวัด
interface LocationSeed {
  city: string;
  name: string;
  address: string;
  image_url: string;
}

const FEATURED_LOCATIONS_BY_PROVINCE: Record<string, LocationSeed[]> = {
  'กรุงเทพมหานคร': [
    { city: 'เขตพระนคร', name: 'วัดพระศรีรัตนศาสดาราม (วัดพระแก้ว)', address: 'ถนนหน้าพระลาน แขวงพระบรมมหาราชวัง เขตพระนคร กรุงเทพฯ', image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
    { city: 'เขตบางกอกใหญ่', name: 'วัดอรุณราชวรารามราชวรมหาวิหาร', address: '158 ถนนวังเดิม แขวงวัดอรุณ เขตบางกอกใหญ่ กรุงเทพฯ', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'เขตสัมพันธวงศ์', name: 'ถนนเยาวราช & ถนนทรงวาด', address: 'แขวงสัมพันธวงศ์ เขตสัมพันธวงศ์ กรุงเทพฯ', image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482' },
    { city: 'เขตปทุมวัน', name: 'หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร (BACC)', address: '939 ถนนพระรามที่ 1 แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
    { city: 'เขตจตุจักร', name: 'ตลาดนัดจตุจักร', address: 'ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  ],
  'เชียงใหม่': [
    { city: 'อำเภอเมืองเชียงใหม่', name: 'วัดพระธาตุดอยสุเทพราชวรวิหาร', address: 'ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่', image_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648' },
    { city: 'อำเภอเมืองเชียงใหม่', name: 'ถนนนิมมานเหมินท์ & One Nimman', address: 'ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่', image_url: 'https://images.unsplash.com/photo-1512552288940-3a300922a275' },
    { city: 'อำเภอแม่ริม', name: 'ม่อนแจ่ม', address: 'ตำบลแม่แรม อำเภอแม่ริม เชียงใหม่', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอจอมทอง', name: 'อุทยานแห่งชาติดอยอินทนนท์', address: 'ตำบลบ้านหลวง อำเภอจอมทอง เชียงใหม่', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
    { city: 'อำเภอแม่ออน', name: 'หมู่บ้านแม่กำปอง', address: 'ตำบลห้วยแก้ว อำเภอแม่ออน เชียงใหม่', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  ],
  'เชียงราย': [
    { city: 'อำเภอเมืองเชียงราย', name: 'วัดร่องขุ่น', address: 'ตำบลป่าอ้อดอนชัย อำเภอเมืองเชียงราย เชียงราย', image_url: 'https://images.unsplash.com/photo-1578157695179-d7b7ddeb2f53' },
    { city: 'อำเภอเมืองเชียงราย', name: 'วัดร่องเสือเต้น', address: 'ตำบลริมกก อำเภอเมืองเชียงราย เชียงราย', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
    { city: 'อำเภอแม่ฟ้าหลวง', name: 'พระตำหนักดอยตุง & สวนแม่ฟ้าหลวง', address: 'ตำบลแม่ฟ้าหลวง อำเภอแม่ฟ้าหลวง เชียงราย', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
    { city: 'อำเภอเทิง', name: 'วนอุทยานภูชี้ฟ้า', address: 'ตำบลตับเต่า อำเภอเทิง เชียงราย', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  ],
  'น่าน': [
    { city: 'อำเภอเมืองน่าน', name: 'วัดภูมินทร์', address: 'ตำบลในเวียง อำเภอเมืองน่าน น่าน', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'อำเภอปัว', name: 'ฟาร์มเห็ดบ้านหัวน้ำ & วังศิลาแลง', address: 'ตำบลศิลาแลง อำเภอปัว น่าน', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
    { city: 'อำเภอบ่อเกลือ', name: 'หมู่บ้านสะปัน & บ่อเกลือสินเธาว์', address: 'ตำบลดงพญา อำเภอบ่อเกลือ น่าน', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  ],
  'แม่ฮ่องสอน': [
    { city: 'อำเภอปาย', name: 'สะพานประวัติศาสตร์ท่าปาย & ถนนคนเดินปาย', address: 'ตำบลเวียงใต้ อำเภอปาย แม่ฮ่องสอน', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอเมืองแม่ฮ่องสอน', name: 'บ้านรักไทย', address: 'ตำบลหมอกจำแป่ อำเภอเมืองแม่ฮ่องสอน แม่ฮ่องสอน', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
    { city: 'อำเภอเมืองแม่ฮ่องสอน', name: 'ปางอุ๋ง (โครงการพระราชดำริปางตอง 2)', address: 'ตำบลหมอกจำแป่ อำเภอเมืองแม่ฮ่องสอน แม่ฮ่องสอน', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  ],
  'ภูเก็ต': [
    { city: 'อำเภอเมืองภูเก็ต', name: 'ย่านเมืองเก่าภูเก็ต (ซอยรมณีย์)', address: 'ถนนถลาง ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต ภูเก็ต', image_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5' },
    { city: 'อำเภอเมืองภูเก็ต', name: 'แหลมพรหมเทพ', address: 'ตำบลราไวย์ อำเภอเมืองภูเก็ต ภูเก็ต', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอกะทู้', name: 'หาดป่าตอง', address: 'ตำบลป่าตอง อำเภอกะทู้ ภูเก็ต', image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { city: 'อำเภอถลาง', name: 'หาดในทอน & อุทยานแห่งชาติสิรินาถ', address: 'ตำบลสาคู อำเภอถลาง ภูเก็ต', image_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21' },
  ],
  'กระบี่': [
    { city: 'อำเภอเมืองกระบี่', name: 'หาดอ่าวนาง & หาดไร่เลย์', address: 'ตำบลอ่าวนาง อำเภอเมืองกระบี่ กระบี่', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
    { city: 'อำเภอเมืองกระบี่', name: 'หมู่เกาะพีพี (อ่าวมาหยา)', address: 'ตำบลอ่าวนาง อำเภอเมืองกระบี่ กระบี่', image_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
    { city: 'อำเภอคลองท่อม', name: 'สระมรกต & น้ำตกร้อนคลองท่อม', address: 'ตำบลคลองท่อมเหนือ อำเภอคลองท่อม กระบี่', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  ],
  'สุราษฎร์ธานี': [
    { city: 'อำเภอบ้านตาขุน', name: 'เขื่อนรัชชประภา (กุ้ยหลินเมืองไทย)', address: 'ตำบลเขาพัง อำเภอบ้านตาขุน สุราษฎร์ธานี', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอเกาะสมุย', name: 'หาดเฉวง & หินตาหินยาย', address: 'ตำบลบ่อผุด อำเภอเกาะสมุย สุราษฎร์ธานี', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอเกาะพะงัน', name: 'หาดริ้น & เกาะเต่า', address: 'ตำบลบ้านใต้ อำเภอเกาะพะงัน สุราษฎร์ธานี', image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  ],
  'พังงา': [
    { city: 'อำเภอตะกั่วทุ่ง', name: 'จุดชมวิวเสม็ดนางชี', address: 'ตำบลคลองเคียน อำเภอตะกั่วทุ่ง พังงา', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
    { city: 'อำเภอคุระบุรี', name: 'อุทยานแห่งชาติหมู่เกาะสิมิลัน', address: 'ตำบลเกาะพระทอง อำเภอคุระบุรี พังงา', image_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
    { city: 'อำเภอตะกั่วป่า', name: 'ย่านเมืองเก่าตะกั่วป่า & หาดเขาหลัก', address: 'ตำบลตะกั่วป่า อำเภอตะกั่วป่า พังงา', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  ],
  'ชลบุรี': [
    { city: 'อำเภอบางละมุง', name: 'หาดพัทยา & แหลมบาลีฮาย', address: 'ตำบลหนองปรือ อำเภอบางละมุง ชลบุรี', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอบางละมุง', name: 'เกาะล้าน (หาดตาแหวน)', address: 'ตำบลนาเกลือ อำเภอบางละมุง ชลบุรี', image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { city: 'อำเภอเมืองชลบุรี', name: 'หาดบางแสน & ตลาดปลาบางแสน', address: 'ตำบลแสนสุข อำเภอเมืองชลบุรี ชลบุรี', image_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21' },
    { city: 'อำเภอสัตหีบ', name: 'หาดเตยงาม & เกาะแสมสาร', address: 'ตำบลสัตหีบ อำเภอสัตหีบ ชลบุรี', image_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  ],
  'ระยอง': [
    { city: 'อำเภอเมืองระยอง', name: 'อุทยานแห่งชาติเขาแหลมหญ้า-หมู่เกาะเสม็ด', address: 'ตำบลเพ อำเภอเมืองระยอง ระยอง', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอแกลง', name: 'ทุ่งโปรงทอง ปากน้ำประแส', address: 'ตำบลปากน้ำกระแส อำเภอแกลง ระยอง', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  ],
  'ตราด': [
    { city: 'อำเภอเกาะช้าง', name: 'หาดทรายขาว & น้ำตกคลองพลู เกาะช้าง', address: 'ตำบลเกาะช้าง อำเภอเกาะช้าง ตราด', image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { city: 'อำเภอเกาะกูด', name: 'หาดคลองเจ้า เกาะกูด', address: 'ตำบลเกาะกูด อำเภอเกาะกูด ตราด', image_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  ],
  'กาญจนบุรี': [
    { city: 'อำเภอเมืองกาญจนบุรี', name: 'สะพานข้ามแม่น้ำแคว', address: 'ตำบลท่ามะขาม อำเภอเมืองกาญจนบุรี กาญจนบุรี', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'อำเภอศรีสวัสดิ์', name: 'อุทยานแห่งชาติเอราวัณ', address: 'ตำบลท่ากระดาน อำเภอศรีสวัสดิ์ กาญจนบุรี', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
    { city: 'อำเภอสังขละบุรี', name: 'สะพานมอญ (สะพานอุตตมานุสรณ์)', address: 'ตำบลหนองลู อำเภอสังขละบุรี กาญจนบุรี', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  ],
  'ประจวบคีรีขันธ์': [
    { city: 'อำเภอหัวหิน', name: 'สถานีรถไฟหัวหิน & ตลาดโต้รุ่งหัวหิน', address: 'ตำบลหัวหิน อำเภอหัวหิน ประจวบคีรีขันธ์', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอสามร้อยยอด', name: 'อุทยานแห่งชาติเขาสามร้อยยอด (ถ้ำพระยานคร)', address: 'ตำบลเขาแดง อำเภอสามร้อยยอด ประจวบคีรีขันธ์', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
  ],
  'เพชรบุรี': [
    { city: 'อำเภอชะอำ', name: 'ชายหาดชะอำ', address: 'ตำบลชะอำ อำเภอชะอำ เพชรบุรี', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอเมืองเพชรบุรี', name: 'อุทยานประวัติศาสตร์พระนครคีรี (เขาวัง)', address: 'ตำบลคลองกระแชง อำเภอเมืองเพชรบุรี เพชรบุรี', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'อำเภอแก่งกระจาน', name: 'อุทยานแห่งชาติแก่งกระจาน (พะเนินทุ่ง)', address: 'ตำบลแก่งกระจาน อำเภอแก่งกระจาน เพชรบุรี', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  ],
  'นครราชสีมา': [
    { city: 'อำเภอปากช่อง', name: 'อุทยานแห่งชาติเขาใหญ่', address: 'ตำบลหมูสี อำเภอปากช่อง นครราชสีมา', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
    { city: 'อำเภอปากช่อง', name: 'ทอสคานา วัลเล่ย์ & คาเฟ่เขาใหญ่', address: 'ตำบลโป่งตาลอง อำเภอปากช่อง นครราชสีมา', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอเมืองนครราชสีมา', name: 'อนุสาวรีย์ท้าวสุรนารี (ย่าโม)', address: 'ตำบลในเมือง อำเภอเมืองนครราชสีมา นครราชสีมา', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  ],
  'เลย': [
    { city: 'อำเภอเชียงคาน', name: 'ถนนคนเดินเชียงคาน & ภูทอก', address: 'ตำบลเชียงคาน อำเภอเชียงคาน เลย', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอภูกระดึง', name: 'อุทยานแห่งชาติภูกระดึง', address: 'ตำบลศรีฐาน อำเภอภูกระดึง เลย', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  ],
  'ขอนแก่น': [
    { city: 'อำเภอเมืองขอนแก่น', name: 'วัดหนองแวง (พระมหาธาตุแก่นนคร) & บึงแก่นนคร', address: 'ตำบลในเมือง อำเภอเมืองขอนแก่น ขอนแก่น', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'อำเภอภูผาม่าน', name: 'ผาม่านฝัน & ถ้ำค้างคาวภูผาม่าน', address: 'ตำบลภูผาม่าน อำเภอภูผาม่าน ขอนแก่น', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  ],
  'อุบลราชธานี': [
    { city: 'อำเภอโขงเจียม', name: 'อุทยานแห่งชาติผาแต้ม & แม่น้ำสองสี', address: 'ตำบลห้วยไผ่ อำเภอโขงเจียม อุบลราชธานี', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
    { city: 'อำเภอโพธิ์ไทร', name: 'สามพันโบก (แกรนด์แคนยอนเมืองไทย)', address: 'ตำบลเหล่างาม อำเภอโพธิ์ไทร อุบลราชธานี', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  ],
  'พระนครศรีอยุธยา': [
    { city: 'อำเภอพระนครศรีอยุธยา', name: 'วัดมหาธาตุ & อุทยานประวัติศาสตร์พระนครศรีอยุธยา', address: 'ตำบลท่าวาสุกรี อำเภอพระนครศรีอยุธยา พระนครศรีอยุธยา', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
    { city: 'อำเภอพระนครศรีอยุธยา', name: 'วัดไชยวัฒนาราม & ตลาดน้ำอโยธยา', address: 'ตำบลบ้านป้อม อำเภอพระนครศรีอยุธยา พระนครศรีอยุธยา', image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
  ],
  'เพชรบูรณ์': [
    { city: 'อำเภอเขาค้อ', name: 'วัดพระธาตุผาซ่อนแก้ว & ทุ่งกังหันลมเขาค้อ', address: 'ตำบลแคมป์สน อำเภอเขาค้อ เพชรบูรณ์', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { city: 'อำเภอหล่มเก่า', name: 'ภูทับเบิก', address: 'ตำบลวังบาล อำเภอหล่มเก่า เพชรบูรณ์', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  ],
  'สุโขทัย': [
    { city: 'อำเภอเมืองสุโขทัย', name: 'อุทยานประวัติศาสตร์สุโขทัย', address: 'ตำบลเมืองเก่า อำเภอเมืองสุโขทัย สุโขทัย', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  ],
  'สมุทรสงคราม': [
    { city: 'อำเภออัมพวา', name: 'ตลาดน้ำอัมพวา & ตลาดร่มหุบ', address: 'ตำบลอัมพวา อำเภออัมพวา สมุทรสงคราม', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  ],
  'นครนายก': [
    { city: 'อำเภอเมืองนครนายก', name: 'เขื่อนขุนด่านปราการชล & น้ำตกสาริกา', address: 'ตำบลหินตั้ง อำเภอเมืองนครนายก นครนายก', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  ],
  'สงขลา': [
    { city: 'อำเภอเมืองสงขลา', name: 'หาดสมิหลา & ย่านเมืองเก่าสงขลา', address: 'ตำบลบ่อยาง อำเภอเมืองสงขลา สงขลา', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { city: 'อำเภอหาดใหญ่', name: 'ตลาดกิมหยง & สวนสาธารณะเทศบาลนครหาดใหญ่', address: 'ตำบลหาดใหญ่ อำเภอหาดใหญ่ สงขลา', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  ],
  'ตรัง': [
    { city: 'อำเภอกันตัง', name: 'ถ้ำมรกต เกาะมุก & หาดปากเมง', address: 'ตำบลเกาะลิบง อำเภอกันตัง ตรัง', image_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  ],
  'สตูล': [
    { city: 'อำเภอเมืองสตูล', name: 'อุทยานแห่งชาติตะรุเตา (เกาะหลีเป๊ะ)', address: 'ตำบลเกาะสาหร่าย อำเภอเมืองสตูล สตูล', image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  ],
  'ระนอง': [
    { city: 'อำเภอเมืองระนอง', name: 'บ่อน้ำร้อนรักษะวาริน & ภูเขาหญ้า', address: 'ตำบลเขานิเวศน์ อำเภอเมืองระนอง ระนอง', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  ],
  'นครศรีธรรมราช': [
    { city: 'อำเภอลานสกา', name: 'หมู่บ้านคีรีวง', address: 'ตำบลกำโลน อำเภอลานสกา นครศรีธรรมราช', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
    { city: 'อำเภอเมืองนครศรีธรรมราช', name: 'วัดพระมหาธาตุวรมหาวิหาร', address: 'ตำบลในเมือง อำเภอเมืองนครศรีธรรมราช นครศรีธรรมราช', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  ],
  'ยะลา': [
    { city: 'อำเภอเบตง', name: 'ทะเลหมอกอัยเยอร์เวง & สตรีทอาร์ตเบตง', address: 'ตำบลอัยเยอร์เวง อำเภอเบตง ยะลา', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  ],
};

// 3. ข้อมูลแม่แบบ 50 แผนการเดินทาง (35 แผนแรก is_public = true, 15 แผนหลัง is_public = false)
const SCHEDULE_TEMPLATES: Array<{
  name: string;
  description: string;
  total_day: number;
  provinces: string[];
  cover_url: string;
}> = [
  // --- 35 แผน Public (index 0..34) ---
  { name: 'เที่ยวเชียงใหม่ 3 วัน 2 คืน สัมผัสลมหนาวม่อนแจ่ม', description: 'เส้นทางยอดฮิต ไหว้พระธาตุดอยสุเทพ เดินเล่นนิมมาน พักโฮมสเตย์ม่อนแจ่มและแม่กำปอง', total_day: 3, provinces: ['เชียงใหม่'], cover_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648' },
  { name: 'ตะลุยกรุง 2 วัน 1 คืน ไหว้พระริมเจ้าพระยา-กินของอร่อยเยาวราช', description: 'ทริปสั้นๆ ในกรุงเทพฯ เยี่ยมชมวัดพระแก้ว วัดอรุณ เดินถ่ายรูปย่านทรงวาด', total_day: 2, provinces: ['กรุงเทพมหานคร'], cover_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
  { name: 'ภูเก็ต 4 วัน 3 คืน ดำน้ำดูปะการัง-เดินเล่นเมืองเก่า', description: 'ครบเครื่องทั้งทะเลอันดามัน แหลมพรหมเทพ และคาเฟ่ชิคๆ ย่านเมืองเก่าภูเก็ต', total_day: 4, provinces: ['ภูเก็ต'], cover_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5' },
  { name: 'กระบี่ 3 วัน 2 คืน อ่าวนาง-เกาะพีพี-สระมรกต', description: 'พักผ่อนริมหาดอ่าวนาง นั่งเรือหางยาวเที่ยวเกาะพีพี และแช่น้ำตกร้อนคลองท่อม', total_day: 3, provinces: ['กระบี่'], cover_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
  { name: 'Road Trip เชียงใหม่ - แม่ฮ่องสอน 5 วัน 4 คืน', description: 'พิชิตโค้งสู่ปาย ปางอุ๋ง และบ้านรักไทย จิบชาอุ่นๆ ริมทะเลสาบยามเช้า', total_day: 5, provinces: ['เชียงใหม่', 'แม่ฮ่องสอน'], cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'น่านเนิบเนิบ 3 วัน 2 คืน ปัว-สะปัน-บ่อเกลือ', description: 'พักใจกลางหุบเขา สูดอากาศบริสุทธิ์ที่หมู่บ้านสะปัน และชมภาพกระซิบรักวัดภูมินทร์', total_day: 3, provinces: ['น่าน'], cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'เชียงราย 3 วัน 2 คืน แอ่วดอยตุง-ชมศิลปะวัดร่องขุ่น', description: 'สัมผัสอากาศเย็นบนดอยตุง ชมทะเลหมอกภูชี้ฟ้า และแวะถ่ายรูปวัดร่องเสือเต้น', total_day: 3, provinces: ['เชียงราย'], cover_url: 'https://images.unsplash.com/photo-1578157695179-d7b7ddeb2f53' },
  { name: 'พัทยา-เกาะล้าน 2 วัน 1 คืน ทริปใกล้กรุงสุดชิล', description: 'ข้ามเรือไปเล่นน้ำใสที่เกาะล้าน ตกเย็นดินเนอร์ซีฟู้ดริมหาดพัทยา', total_day: 2, provinces: ['ชลบุรี'], cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เขาใหญ่-ปากช่อง 2 วัน 1 คืน คาเฟ่และธรรมชาติ', description: 'เดินป่าศึกษาธรรมชาติเขาใหญ่ แวะเช็กอินคาเฟ่สไตล์ยุโรปและฟาร์มโคนม', total_day: 2, provinces: ['นครราชสีมา'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { name: 'กาญจนบุรี 3 วัน 2 คืน สังขละบุรี-น้ำตกเอราวัณ', description: 'ตื่นเช้าใส่บาตรสะพานมอญ แวะเล่นน้ำตกเอราวัณ และนั่งรถไฟสายมรณะ', total_day: 3, provinces: ['กาญจนบุรี'], cover_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  { name: 'เชียงคาน-ภูกระดึง 4 วัน 3 คืน สัมผัสลมหนาวเมืองเลย', description: 'พิชิตยอดภูกระดึงและเดินชิลริมโขงถนนคนเดินเชียงคาน', total_day: 4, provinces: ['เลย'], cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  { name: 'สุราษฎร์ธานี 4 วัน 3 คืน เขื่อนเชี่ยวหลาน-เกาะสมุย', description: 'นอนแพริมน้ำเขื่อนรัชชประภา ต่อด้วยพักผ่อนริมหาดเฉวง เกาะสมุย', total_day: 4, provinces: ['สุราษฎร์ธานี'], cover_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: 'หัวหิน-สามร้อยยอด 2 วัน 1 คืน พักผ่อนริมทะเล', description: 'เดินตลาดโต้รุ่งหัวหิน แวะถ่ายรูปสถานีรถไฟคลาสสิกและถ้ำพระยานคร', total_day: 2, provinces: ['ประจวบคีรีขันธ์'], cover_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21' },
  { name: 'One Day Trip อยุธยา ไหว้พระ 5 วัด กินกุ้งแม่น้ำเผา', description: 'เที่ยวชมโบราณสถานมรดกโลกใกล้กรุงเทพฯ เดินทางสะดวกภายใน 1 วัน', total_day: 1, provinces: ['พระนครศรีอยุธยา'], cover_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  { name: 'เขาค้อ-ภูทับเบิก 3 วัน 2 คืน ล่าทะเลหมอกเพชรบูรณ์', description: 'ไหว้พระธาตุผาซ่อนแก้ว กางเต็นท์ดูดาวและทะเลหมอกบนภูทับเบิก', total_day: 3, provinces: ['เพชรบูรณ์'], cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'เกาะช้าง-เกาะกูด 4 วัน 3 คืน ทะเลตะวันออกน้ำใส', description: 'หนีความวุ่นวายไปติดเกาะ ดำน้ำตื้นและพายคายัคชมป่าชายเลน', total_day: 4, provinces: ['ตราด'], cover_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  { name: 'พังงา 3 วัน 2 คืน เสม็ดนางชี-หมู่เกาะสิมิลัน', description: 'ชมวิวพระอาทิตย์ขึ้นที่เสม็ดนางชี และดำน้ำเกาะสิมิลันช่วงไฮซีซัน', total_day: 3, provinces: ['พังงา'], cover_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
  { name: 'อัมพวา-สมุทรสงคราม 2 วัน 1 คืน นอนโฮมสเตย์ริมคลอง', description: 'ชมตลาดร่มหุบ ล่องเรือดูหิ่งห้อย และชิมอาหารพื้นบ้านตลาดน้ำอัมพวา', total_day: 2, provinces: ['สมุทรสงคราม'], cover_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  { name: 'นครนายก 1 วันเต็ม เล่นน้ำตก-ชมสันเขื่อนขุนด่าน', description: 'ทริปประหยัดเวลา ขับรถจากกรุงเทพฯ เพียง 1.5 ชั่วโมง สูดโอโซนเต็มปอด', total_day: 1, provinces: ['นครนายก'], cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'อุบลราชธานี 3 วัน 2 คืน สามพันโบก-ผาแต้ม', description: 'ชมแสงแรกก่อนใครในสยามที่ผาแต้ม และถ่ายรูปหินสวยที่สามพันโบก', total_day: 3, provinces: ['อุบลราชธานี'], cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  { name: 'ขอนแก่น-ภูผาม่าน 2 วัน 1 คืน ชมค้างคาวและทุ่งนา', description: 'ไหว้พระมหาธาตุแก่นนคร พักโฮมสเตย์วิวภูผาม่านสุดอลังการ', total_day: 2, provinces: ['ขอนแก่น'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { name: 'ระยอง 2 วัน 1 คืน เกาะเสม็ด-ทุ่งโปรงทอง', description: 'เดินสะพานไม้ชมป่าชายเลนทุ่งโปรงทอง และพักผ่อนริมหาดทรายแก้ว', total_day: 2, provinces: ['ระยอง'], cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'เพชรบุรี-ชะอำ-แก่งกระจาน 3 วัน 2 คืน', description: 'เที่ยวครบทั้งทะเล ภูเขา และประวัติศาสตร์ที่พระนครคีรี', total_day: 3, provinces: ['เพชรบุรี'], cover_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  { name: 'สุโขทัย 2 วัน 1 คืน ปั่นจักรยานชมเมืองมรดกโลก', description: 'ซึมซับประวัติศาสตร์อาณาจักรสุโขทัย ชิมก๋วยเตี๋ยวสุโขทัยสูตรดั้งเดิม', total_day: 2, provinces: ['สุโขทัย'], cover_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
  { name: 'นครศรีธรรมราช 3 วัน 2 คืน หมู่บ้านคีรีวง-วัดพระมหาธาตุ', description: 'สูดอากาศที่ดีที่สุดในประเทศไทยที่คีรีวง และสักการะพระบรมธาตุเมืองนคร', total_day: 3, provinces: ['นครศรีธรรมราช'], cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'ตรัง-สตูล 4 วัน 3 คืน ถ้ำมรกต-เกาะหลีเป๊ะ', description: 'เส้นทางทะเลใต้ฝั่งอันดามัน น้ำใสราวกระจก อาหารอร่อยระดับตำนาน', total_day: 4, provinces: ['ตรัง', 'สตูล'], cover_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  { name: 'สงขลา-หาดใหญ่ 3 วัน 2 คืน ตะลุยกินติ่มซำ-เดินเมืองเก่า', description: 'อิ่มอร่อยกับของกินหาดใหญ่ ถ่ายรูปสตรีทอาร์ตสงขลา และชมนางเงือกแหลมสมิหลา', total_day: 3, provinces: ['สงขลา'], cover_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  { name: 'ระนอง 2 วัน 1 คืน แช่น้ำแร่-ชมภูเขาหญ้า', description: 'เมืองรองสุดสโลว์ไลฟ์ แช่บ่อน้ำร้อนรักษะวารินและจิบกาแฟโรบัสต้าแท้', total_day: 2, provinces: ['ระนอง'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { name: 'เบตง ยะลา 3 วัน 2 คืน ทะเลหมอกอัยเยอร์เวง', description: 'ใต้สุดแดนสยาม ชมสกายวอล์คทะเลหมอก ชิมไก่สับเบตงและเฉาก๊วยโบราณ', total_day: 3, provinces: ['ยะลา'], cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: 'ทริปสายบุญ ภาคกลาง 2 วัน 1 คืน อยุธยา-อ่างทอง-สิงห์บุรี', description: 'เส้นทางไหว้พระขอพรเสริมสิริมงคล 9 วัดดังลุ่มแม่น้ำเจ้าพระยา', total_day: 2, provinces: ['พระนครศรีอยุธยา', 'อ่างทอง', 'สิงห์บุรี'], cover_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  { name: 'เที่ยวจันทบุรี 2 วัน 1 คืน ชุมชนริมน้ำจันทบูร-เนินนางพญา', description: 'ขับรถเลียบถนนเฉลิมบูรพาชลทิต กินปูทะเลสดๆ และเดินเล่นชุมชนเก่า', total_day: 2, provinces: ['จันทบุรี'], cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'ราชบุรี-สวนผึ้ง 2 วัน 1 คืน ฟาร์มแกะและธารน้ำร้อนบ่อคลึง', description: 'พักผ่อนท่ามกลางขุนเขาตะนาวศรี แวะตลาดโอ๊ะป่อยยามเช้า', total_day: 2, provinces: ['ราชบุรี'], cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'ลำปาง-ลำพูน 3 วัน 2 คืน นั่งรถม้า-ไหว้พระธาตุหริภุญชัย', description: 'สัมผัสเสน่ห์เมืองรองล้านนา วัดพระธาตุลำปางหลวงและวัดพระธาตุหริภุญชัย', total_day: 3, provinces: ['ลำปาง', 'ลำพูน'], cover_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648' },
  { name: 'อุดรธานี-หนองคาย 3 วัน 2 คืน ทะเลบัวแดง-คำชะโนด', description: 'ล่องเรือชมทะเลบัวแดงยามเช้า สักการะคำชะโนด และชมวิวริมโขงหนองคาย', total_day: 3, provinces: ['อุดรธานี', 'หนองคาย'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { name: 'นครปฐม-สุพรรณบุรี 1 วันเต็ม ไหว้พระปฐมเจดีย์-ตลาดสามชุก', description: 'ทริปครอบครัวใกล้กรุงเทพฯ อิ่มอร่อยตลอดเส้นทาง', total_day: 1, provinces: ['นครปฐม', 'สุพรรณบุรี'], cover_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },

  // --- 15 แผน Private (index 35..49) ---
  { name: '[Private] แพลนฮันนีมูนเกาะกูด 4 วัน 3 คืน', description: 'ทริปส่วนตัวพักพูลวิลล่าริมทะเล', total_day: 4, provinces: ['ตราด'], cover_url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57' },
  { name: '[Private] เที่ยวเชียงใหม่กับครอบครัวช่วงปีใหม่', description: 'รวมร้านอาหารสำหรับผู้สูงอายุและเด็กเล็ก', total_day: 4, provinces: ['เชียงใหม่'], cover_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648' },
  { name: '[Private] Workation ภูเก็ต 5 วัน', description: 'คาเฟ่ทำงานวิวทะเลและที่พักอินเทอร์เน็ตแรง', total_day: 5, provinces: ['ภูเก็ต'], cover_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5' },
  { name: '[Private] ทริปถ่ายรูปคาเฟ่กรุงเทพฯ 1 วัน', description: 'ตะลุย 5 คาเฟ่เปิดใหม่ย่านอารีย์-เจริญกรุง', total_day: 1, provinces: ['กรุงเทพมหานคร'], cover_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
  { name: '[Private] เที่ยวน่านคนเดียว 3 วัน 2 คืน', description: 'แพลนเช่ารถขับเที่ยวปัว-บ่อเกลือแบบชิลๆ', total_day: 3, provinces: ['น่าน'], cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: '[Private] ทริปบริษัท Outing พัทยา 2 วัน 1 คืน', description: 'กิจกรรมทีมบิลดิ้งและงานเลี้ยงตอนเย็น', total_day: 2, provinces: ['ชลบุรี'], cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: '[Private] กางเต็นท์เขาใหญ่สุดสัปดาห์', description: 'เช็กลิสต์จุดกางเต็นท์ลำตะคองและจุดส่องสัตว์', total_day: 2, provinces: ['นครราชสีมา'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { name: '[Private] วิ่งเทรลอินทนนท์ 3 วัน 2 คืน', description: 'เตรียมตัวก่อนแข่งและจุดพักฟื้นหลังวิ่ง', total_day: 3, provinces: ['เชียงใหม่'], cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
  { name: '[Private] ไหว้พระแก้ปีชง 2569 กรุงเทพ-นนทบุรี', description: 'วัดมังกรกมลาวาส วัดบรมราชากาญจนาภิเษก', total_day: 1, provinces: ['กรุงเทพมหานคร', 'นนทบุรี'], cover_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
  { name: '[Private] ทริปดำน้ำหลีเป๊ะกับแก๊งเพื่อน', description: 'จองเรือหางยาวเหมาลำโซนใน-โซนนอก', total_day: 4, provinces: ['สตูล'], cover_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  { name: '[Private] เยี่ยมญาติและเที่ยวพิษณุโลก-สุโขทัย', description: 'ไหว้พระพุทธชินราชและแวะอุทยานประวัติศาสตร์', total_day: 3, provinces: ['พิษณุโลก', 'สุโขทัย'], cover_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526' },
  { name: '[Private] ขับรถเที่ยวแม่ฮ่องสอนวงกลม 4 วัน', description: 'เชียงใหม่ - แม่สะเรียง - แม่ฮ่องสอน - ปาย', total_day: 4, provinces: ['แม่ฮ่องสอน'], cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { name: '[Private] พักผ่อนหัวหิน 2 วัน 1 คืน แบบไม่เร่งรีบ', description: 'เน้นนอนโรงแรมริมหาดและกินอาหารทะเล', total_day: 2, provinces: ['ประจวบคีรีขันธ์'], cover_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21' },
  { name: '[Private] ทริปถ่ายดาวภูชี้ฟ้า เชียงราย', description: 'เตรียมอุปกรณ์ถ่ายภาพทางช้างเผือก', total_day: 3, provinces: ['เชียงราย'], cover_url: 'https://images.unsplash.com/photo-1578157695179-d7b7ddeb2f53' },
  { name: '[Private] สำรวจเส้นทางกาแฟภาคใต้ ชุมพร-ระนอง', description: 'เยี่ยมชมไร่กาแฟและโรงคั่วท้องถิ่น', total_day: 3, provinces: ['ชุมพร', 'ระนอง'], cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
];

// เวลาเยี่ยมชมมาตรฐานสำหรับแต่ละลำดับกิจกรรมใน 1 วัน (รองรับ @db.Time(0))
const VISIT_TIME_SLOTS = [
  new Date('1970-01-01T08:30:00.000Z'),
  new Date('10:30'.includes(':') ? '1970-01-01T10:30:00.000Z' : ''),
  new Date('1970-01-01T13:00:00.000Z'),
  new Date('1970-01-01T15:30:00.000Z'),
  new Date('1970-01-01T18:30:00.000Z'),
];

async function main() {
  console.log('🌱 เริ่มต้นการ Seed ข้อมูล...');

  // 0. ตรวจสอบหรือสร้าง User ตัวอย่างสำหรับเป็น owner_id ของ Schedule
  // ⚠️ หมายเหตุ: หาก Model User ของคุณมีฟิลด์บังคับอื่นๆ (เช่น email, password, username) สามารถปรับแก้ด้านล่างนี้ได้เลย
  let users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.log('👤 ไม่พบข้อมูล User ในระบบ กำลังสร้าง User ตัวอย่าง...');
    for (let i = 1; i <= 5; i++) {
      const createdUser = await prisma.user.create({
        data: {
          username: `traveler${i}`,
          email: `traveler${i}@example.com`,
          password_hash: '$2b$10$dummyhashedpasswordfortesting1234567890',
        },
      });
      users.push(createdUser);
    }
  }

  // 1. สร้างข้อมูลจังหวัดครบทั้ง 77 จังหวัด + อำเภอ + สถานที่ท่องเที่ยว
  console.log('🗺️  กำลังสร้างข้อมูลจังหวัดครบ 77 จังหวัด, อำเภอ และสถานที่...');
  const locationsByProvinceName: Record<string, number[]> = {};
  const allLocationIds: number[] = [];

  for (const provinceName of ALL_77_PROVINCES) {
    const province = await prisma.province.create({
      data: {
        province_name: provinceName,
      },
    });

    locationsByProvinceName[provinceName] = [];
    const featuredList = FEATURED_LOCATIONS_BY_PROVINCE[provinceName];

    // สร้าง Map เก็บ city_name -> city_id เพื่อไม่ให้สร้างอำเภอซ้ำในจังหวัดเดียวกัน
    const cityMap = new Map<string, number>();

    if (featuredList && featuredList.length > 0) {
      for (const loc of featuredList) {
        let cityId = cityMap.get(loc.city);
        if (!cityId) {
          const city = await prisma.city.create({
            data: {
              city_name: loc.city,
              province_id: province.province_id,
            },
          });
          cityId = city.city_id;
          cityMap.set(loc.city, cityId);
        }

        const createdLocation = await prisma.location.create({
          data: {
            name: loc.name,
            address: loc.address,
            city_id: cityId,
            image_url: loc.image_url,
          },
        });

        locationsByProvinceName[provinceName].push(createdLocation.location_id);
        allLocationIds.push(createdLocation.location_id);
      }
    } else {
      // สำหรับจังหวัดที่ไม่ได้ระบุไฮไลต์เฉพาะ จะสร้างอำเภอเมืองและสถานที่ประจำจังหวัดให้อัตโนมัติ
      const defaultCityName =
        provinceName === 'กรุงเทพมหานคร' ? 'เขตพระนคร' : `อำเภอเมือง${provinceName}`;

      const defaultCity = await prisma.city.create({
        data: {
          city_name: defaultCityName,
          province_id: province.province_id,
        },
      });

      const defaultLocations = [
        {
          name: `ศาลหลักเมือง${provinceName}`,
          address: `ตำบลในเมือง ${defaultCityName} จังหวัด${provinceName}`,
          image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526',
        },
        {
          name: `ตลาดต้องชมและถนนคนเดิน${provinceName}`,
          address: `ตำบลในเมือง ${defaultCityName} จังหวัด${provinceName}`,
          image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
        },
      ];

      for (const loc of defaultLocations) {
        const createdLocation = await prisma.location.create({
          data: {
            name: loc.name,
            address: loc.address,
            city_id: defaultCity.city_id,
            image_url: loc.image_url,
          },
        });

        locationsByProvinceName[provinceName].push(createdLocation.location_id);
        allLocationIds.push(createdLocation.location_id);
      }
    }
  }

  console.log(`✅ สร้างครบ ${ALL_77_PROVINCES.length} จังหวัด และสถานที่ทั้งหมด ${allLocationIds.length} แห่ง`);

  // 2. สร้างแผนการเดินทาง 50 แผน (35 Public + 15 Private) พร้อม ScheduleItem
  console.log('📅 กำลังสร้างแผนการเดินทาง 50 แผน (Public 35 แผน / Private 15 แผน)...');
  const categories = Object.values(Category);

  for (let i = 0; i < SCHEDULE_TEMPLATES.length; i++) {
    const template = SCHEDULE_TEMPLATES[i];
    const isPublic = i < 35; // 35 แผนแรกเป็น Public, 15 แผนหลังเป็น Private
    const owner = users[i % users.length];
    const category = categories[i % categories.length];

    // รวบรวม location_id ที่เกี่ยวข้องกับจังหวัดในแผนนี้
    let candidateLocations: number[] = [];
    for (const prov of template.provinces) {
      if (locationsByProvinceName[prov]) {
        candidateLocations.push(...locationsByProvinceName[prov]);
      }
    }
    if (candidateLocations.length === 0) {
      candidateLocations = allLocationIds;
    }

    const schedule = await prisma.schedule.create({
      data: {
        schedule_name: template.name,
        description: template.description,
        total_day: template.total_day,
        cover_url: template.cover_url,
        category,
        is_public: isPublic,
        owner_id: owner.user_id,
      },
    });

    // สร้าง ScheduleItem ในแต่ละวัน (วันละ 3-4 กิจกรรม)
    let locPointer = i;
    for (let day = 1; day <= template.total_day; day++) {
      const itemsPerDay = Math.min(4, Math.max(3, candidateLocations.length));

      for (let seq = 1; seq <= itemsPerDay; seq++) {
        const locationId = candidateLocations[locPointer % candidateLocations.length];
        locPointer++;

        await prisma.scheduleItem.create({
          data: {
            schedule_id: schedule.schedule_id,
            day_no: day,
            sequence_no: seq,
            visit_time: VISIT_TIME_SLOTS[(seq - 1) % VISIT_TIME_SLOTS.length],
            location_id: locationId,
          },
        });
      }
    }
  }

  console.log('🎉 Seed ข้อมูลเสร็จสมบูรณ์! (77 จังหวัด, 50 แผนการเดินทาง: 35 Public / 15 Private)');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });