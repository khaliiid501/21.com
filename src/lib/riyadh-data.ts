export type District = {
  id: string
  nameAr: string
  nameEn: string
  zone: 'شمال' | 'جنوب' | 'شرق' | 'غرب' | 'وسط'
  pricePerSqmHistory: number[]
  infrastructure: {
    metroAccess: number
    roadsQuality: number
    schools: number
    hospitals: number
    malls: number
    parks: number
  }
  capitalInflow: number[]
  megaProjects: { name: string; budgetBillionSAR: number; completion: number }[]
  populationGrowth: number
  vacancyRate: number
}

export const RIYADH_DISTRICTS: District[] = [
  {
    id: 'malqa',
    nameAr: 'الملقا',
    nameEn: 'Al Malqa',
    zone: 'شمال',
    pricePerSqmHistory: [4200, 4350, 4520, 4710, 4980, 5240, 5510, 5760, 6020, 6310, 6580, 6890],
    infrastructure: { metroAccess: 88, roadsQuality: 92, schools: 85, hospitals: 78, malls: 90, parks: 72 },
    capitalInflow: [120, 145, 180, 210, 245, 290, 340, 380, 420, 470, 520, 580],
    megaProjects: [
      { name: 'مشروع الواجهة الشمالية', budgetBillionSAR: 18, completion: 62 },
      { name: 'مركز التقنية المالية', budgetBillionSAR: 7.5, completion: 45 },
    ],
    populationGrowth: 4.8,
    vacancyRate: 6.2,
  },
  {
    id: 'hittin',
    nameAr: 'حطين',
    nameEn: 'Hittin',
    zone: 'شمال',
    pricePerSqmHistory: [5100, 5280, 5460, 5640, 5810, 5990, 6210, 6420, 6680, 6940, 7220, 7510],
    infrastructure: { metroAccess: 75, roadsQuality: 90, schools: 92, hospitals: 82, malls: 85, parks: 88 },
    capitalInflow: [180, 210, 240, 275, 310, 355, 400, 450, 510, 570, 640, 710],
    megaProjects: [
      { name: 'حديقة الملك سلمان (نطاق)', budgetBillionSAR: 23, completion: 38 },
      { name: 'تطوير الواجهة السكنية', budgetBillionSAR: 5.2, completion: 70 },
    ],
    populationGrowth: 5.4,
    vacancyRate: 4.8,
  },
  {
    id: 'yasmin',
    nameAr: 'الياسمين',
    nameEn: 'Al Yasmin',
    zone: 'شمال',
    pricePerSqmHistory: [3100, 3240, 3380, 3540, 3720, 3920, 4140, 4380, 4620, 4880, 5160, 5460],
    infrastructure: { metroAccess: 82, roadsQuality: 86, schools: 80, hospitals: 70, malls: 78, parks: 75 },
    capitalInflow: [90, 110, 135, 165, 200, 240, 285, 330, 380, 435, 495, 560],
    megaProjects: [
      { name: 'محور القطار الشمالي', budgetBillionSAR: 12, completion: 55 },
    ],
    populationGrowth: 6.1,
    vacancyRate: 5.4,
  },
  {
    id: 'narjis',
    nameAr: 'النرجس',
    nameEn: 'Al Narjis',
    zone: 'شمال',
    pricePerSqmHistory: [2700, 2830, 2980, 3150, 3340, 3550, 3780, 4020, 4280, 4560, 4860, 5180],
    infrastructure: { metroAccess: 70, roadsQuality: 80, schools: 72, hospitals: 65, malls: 68, parks: 70 },
    capitalInflow: [70, 88, 110, 138, 172, 212, 258, 308, 362, 420, 482, 550],
    megaProjects: [
      { name: 'مدينة الملك عبدالله الاقتصادية - فرع', budgetBillionSAR: 9, completion: 28 },
    ],
    populationGrowth: 7.2,
    vacancyRate: 7.1,
  },
  {
    id: 'aqiq',
    nameAr: 'العقيق',
    nameEn: 'Al Aqiq',
    zone: 'شمال',
    pricePerSqmHistory: [4800, 4940, 5090, 5260, 5440, 5640, 5860, 6100, 6360, 6640, 6940, 7260],
    infrastructure: { metroAccess: 95, roadsQuality: 94, schools: 88, hospitals: 85, malls: 92, parks: 80 },
    capitalInflow: [220, 250, 285, 325, 370, 420, 475, 535, 600, 670, 745, 825],
    megaProjects: [
      { name: 'المركز المالي (KAFD)', budgetBillionSAR: 28, completion: 82 },
      { name: 'مترو الرياض - تقاطع رئيسي', budgetBillionSAR: 15, completion: 95 },
    ],
    populationGrowth: 3.9,
    vacancyRate: 3.2,
  },
  {
    id: 'olaya',
    nameAr: 'العليا',
    nameEn: 'Al Olaya',
    zone: 'وسط',
    pricePerSqmHistory: [6200, 6310, 6420, 6540, 6680, 6830, 6990, 7170, 7360, 7560, 7780, 8010],
    infrastructure: { metroAccess: 98, roadsQuality: 88, schools: 75, hospitals: 92, malls: 95, parks: 60 },
    capitalInflow: [260, 280, 305, 332, 362, 395, 432, 472, 516, 564, 616, 672],
    megaProjects: [
      { name: 'برج المملكة - تطوير محيط', budgetBillionSAR: 4, completion: 88 },
    ],
    populationGrowth: 2.1,
    vacancyRate: 8.4,
  },
  {
    id: 'diriyah',
    nameAr: 'الدرعية',
    nameEn: 'Diriyah',
    zone: 'غرب',
    pricePerSqmHistory: [3500, 3680, 3880, 4110, 4360, 4640, 4940, 5260, 5610, 5990, 6390, 6820],
    infrastructure: { metroAccess: 65, roadsQuality: 82, schools: 70, hospitals: 68, malls: 72, parks: 95 },
    capitalInflow: [310, 360, 420, 488, 565, 652, 750, 858, 978, 1110, 1255, 1414],
    megaProjects: [
      { name: 'مشروع الدرعية', budgetBillionSAR: 75, completion: 48 },
      { name: 'منتجع وادي حنيفة', budgetBillionSAR: 11, completion: 35 },
    ],
    populationGrowth: 8.4,
    vacancyRate: 4.1,
  },
  {
    id: 'qiddiya',
    nameAr: 'القدية',
    nameEn: 'Qiddiya',
    zone: 'غرب',
    pricePerSqmHistory: [1200, 1320, 1465, 1640, 1850, 2090, 2370, 2690, 3050, 3460, 3920, 4440],
    infrastructure: { metroAccess: 45, roadsQuality: 75, schools: 40, hospitals: 38, malls: 50, parks: 90 },
    capitalInflow: [420, 510, 615, 740, 888, 1062, 1265, 1500, 1772, 2086, 2447, 2860],
    megaProjects: [
      { name: 'مدينة القدية الترفيهية', budgetBillionSAR: 200, completion: 32 },
      { name: 'حلبة سباقات F1', budgetBillionSAR: 18, completion: 58 },
    ],
    populationGrowth: 12.6,
    vacancyRate: 9.8,
  },
  {
    id: 'sulay',
    nameAr: 'السلي',
    nameEn: 'As Sulay',
    zone: 'شرق',
    pricePerSqmHistory: [1800, 1845, 1895, 1950, 2010, 2075, 2145, 2220, 2300, 2385, 2475, 2570],
    infrastructure: { metroAccess: 55, roadsQuality: 70, schools: 60, hospitals: 55, malls: 50, parks: 48 },
    capitalInflow: [40, 45, 52, 60, 70, 82, 96, 112, 130, 150, 172, 196],
    megaProjects: [
      { name: 'منطقة لوجستية صناعية', budgetBillionSAR: 3.5, completion: 65 },
    ],
    populationGrowth: 2.8,
    vacancyRate: 11.2,
  },
  {
    id: 'shifa',
    nameAr: 'الشفا',
    nameEn: 'Ash Shifa',
    zone: 'جنوب',
    pricePerSqmHistory: [1500, 1560, 1630, 1710, 1800, 1900, 2010, 2130, 2260, 2400, 2550, 2710],
    infrastructure: { metroAccess: 48, roadsQuality: 68, schools: 65, hospitals: 50, malls: 45, parks: 55 },
    capitalInflow: [55, 65, 78, 92, 110, 130, 154, 180, 210, 244, 282, 324],
    megaProjects: [
      { name: 'تطوير الطريق الدائري الجنوبي', budgetBillionSAR: 6, completion: 42 },
    ],
    populationGrowth: 4.1,
    vacancyRate: 8.6,
  },
]
