/**
 * EURISKA CULTURAL 2025-26 — PREVIOUS YEAR ARCHIVE DATA
 *
 * This file contains STATIC, LOCAL-ONLY data for the 2025-26 festival year.
 * It is used exclusively for the "Previous Year" read-only archive view.
 * Covers A Building (87 flats), B Building (96 flats), C Building (48 flats).
 *
 * ⚠️  NO FIREBASE SYNC — this data is never written to Firestore.
 * ⚠️  NO LOCALSTORAGE — this data does not affect the current 2026-27 seeding.
 */

export const FINANCIAL_YEAR_2025_26 = '2025-26';
export const EVENT_ID_2025_26 = 'EURISKA-CULTURAL-2025';

// ─── A BUILDING (87 flats incl. Refuge Area 706 which is excluded below) ───────

export interface PrevYearFlat {
  flat: string;
  name: string;
  amount: number;          // 0 = pending / not paid
  mode?: 'ONLINE' | 'CASH';
  status: 'PAID' | 'PENDING';
}

/**
 * Exact 2025-26 A Building resident contribution data as provided by the committee.
 * Refuge Area (706) is intentionally omitted — it is not a residential flat.
 */
export const A_BUILDING_2025_26: PrevYearFlat[] = [
  // Floor 1
  { flat: '101', name: 'Mr. Yogesh Puri',                     amount: 0,    status: 'PENDING' },
  { flat: '102', name: 'Mr. Arpit Atmaram Humane',            amount: 0,    status: 'PENDING' },
  { flat: '103', name: 'Mr. Dwarka Sharma',                   amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '104', name: 'Mr. Ashish Tilakraj Jangda',          amount: 0,    status: 'PENDING' },
  { flat: '105', name: 'Mr. Pranav Anil Kamble',              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '106', name: 'Mrs. Shehnaaz Mohsin khan',           amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '107', name: 'Mrs. Alefiya Aboozar Patrawala',      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '108', name: 'Mrs. Alefiya Aboozar Patrawala',      amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 2
  { flat: '201', name: 'Mr. Parag Suresh Gaikwad',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '202', name: 'Mr. Anirudha C. Kshirsagar',          amount: 0,    status: 'PENDING' },
  { flat: '203', name: 'Mr. Maqsood Abdul Salam Baza',        amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '204', name: 'Mr. Sandeep Harbansalal Goyal',       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '205', name: 'Mr. Suryakiran M. Yedvilli',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '206', name: 'Mr. Pushpraj C. Kshirsagar',          amount: 0,    status: 'PENDING' },
  { flat: '207', name: 'Mr. Jitin Joglekar',                  amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '208', name: 'Mr. Mohammed A Khan',                 amount: 0,    status: 'PENDING' },

  // Floor 3
  { flat: '301', name: 'Mr. Sandeep Kumar Mohanty',           amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '302', name: 'Bennett, Coleman & Co. Ltd.',         amount: 0,    status: 'PENDING' },
  { flat: '303', name: 'Mrs. Dipali Sandesh Parekh',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '304', name: 'Mr. Manish K',                        amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '305', name: 'Mr. Sanjay Kumar Roy Chowdhary',      amount: 1501, mode: 'ONLINE', status: 'PAID' },
  { flat: '306', name: 'Mr. Ajay Shrimali',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '307', name: 'Mr. Qazi Munwwar Ali Mumtaz Ali',     amount: 0,    status: 'PENDING' },
  { flat: '308', name: 'Mrs. Ankita Sinha',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 4
  { flat: '401', name: 'MR. Anil Singh Bisht',                amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '402', name: 'Mr. Sunny Garg',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '403', name: 'Mr. Azim Haghighi',                   amount: 0,    status: 'PENDING' },
  { flat: '404', name: 'Mr. Galib & Mrs. Afroza Parkar',      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '405', name: 'Mudasir Alzahib',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '406', name: 'Mr. Surykan Nagnath Suryawanshi',     amount: 0,    status: 'PENDING' },
  { flat: '407', name: 'Mr. Kiran Kumar C.M.',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '408', name: 'Mrs. Salehi Shehnaz',                 amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 5
  { flat: '501', name: 'Mrs. Vidya Praksh Dhiwar',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '502', name: 'Shahnaz Shoukatali Dhamnekar',        amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '503', name: 'Mr. Javed S',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '504', name: 'Mrs. Mizba Mohd Saeed Shaikh',        amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '505', name: 'Mr. Prashant S. Mahindrakar',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '506', name: 'Mr. Edwin Anthony Joseph',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '507', name: 'Mr. Somnath Annappa Salunke',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '508', name: 'Mr. Ankesh Pratap',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 6
  { flat: '601', name: 'Mrs. Rama Kanta Sharma',              amount: 0,    status: 'PENDING' },
  { flat: '602', name: 'Mr. Himansu Sekhar Behera',           amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '603', name: 'Mr. Fakiruddin Alli Ahamed Khan',     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '604', name: 'Mr. Sayed Murtaza Sayed Reza Ajdar',  amount: 0,    status: 'PENDING' },
  { flat: '605', name: 'Ms. Riddhi Mankar',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '606', name: 'Mr. Kalpesh Naraynrao Banai',         amount: 0,    status: 'PENDING' },
  { flat: '607', name: 'Mr. AshuKumar Harshwardhan',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '608', name: 'Jannat Damji',                        amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 7  (Refuge Area 706 omitted)
  { flat: '701', name: 'Mr. Kumar Raj & Mrs. Soni Kumari',    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '702', name: 'Mr. Nikhil Ramakant Kerkar',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '703', name: 'Mr. Sandeep Kumar',                   amount: 0,    status: 'PENDING' },
  { flat: '704', name: 'Mr. Sachin Nivrutti Savakhande',      amount: 2000, mode: 'ONLINE', status: 'PAID' },
  { flat: '705', name: 'Mr. Ram Kumar',                       amount: 1500, mode: 'ONLINE', status: 'PAID' },
  { flat: '707', name: 'Mr. Narayan Pandurang Dange',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '708', name: 'Mr. Wasim Jamal',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 8
  { flat: '801', name: 'Mr. Sanchet J. Shetty',               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '802', name: 'Mr. Suchit Prakash Gangreddiwar',     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '803', name: 'Ms. Patricia Robert Daniel',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '804', name: 'Mr. Aliakbar Abbas Haghighi',         amount: 0,    status: 'PENDING' },
  { flat: '805', name: 'Mr. Prasad Surya Yadavilli',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '806', name: 'Mr. Rushikesh Deepak Shinde',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '807', name: 'Mr. Gaurav Pandey',                   amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '808', name: 'Mrs. Sujata Surendra Hatkar',         amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 9
  { flat: '901', name: 'Mr. Girish Jitendra Vij',             amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '902', name: 'Mr. Nikhil Bhosale',                  amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '903', name: 'Mr. Dhanesh Unnithan & Mrs. Surya Kurup', amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '904', name: 'Bennett, Coleman & Co. Ltd.',         amount: 0,    status: 'PENDING' },
  { flat: '905', name: 'Mr. Siddhesh Ghoting',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '906', name: 'Mr. Mandar Sunil Govalkar',           amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '907', name: 'Ms. Madhurima',                       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '908', name: 'Miss. Sakina Fatawala',               amount: 0,    status: 'PENDING' },

  // Floor 10
  { flat: '1001', name: 'Mr. Khan Yasir Ahmed Nasir',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1002', name: 'Bennett, Coleman & Co. Ltd.',        amount: 0,    status: 'PENDING' },
  { flat: '1003', name: 'Mrs. Shabnam Mirkar',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1004', name: 'Mr. Jagtap Sachin Ashok',            amount: 0,    status: 'PENDING' },
  { flat: '1005', name: 'Mr. Vinay Kumar Gupta',              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1006', name: 'Raunak Jagdish Uderani',             amount: 0,    status: 'PENDING' },
  { flat: '1007', name: 'Mr. Amit Singh',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1008', name: 'Ms Shilpa Tapiloo',                  amount: 0,    status: 'PENDING' },

  // Floor 11
  { flat: '1101', name: 'Mr. Cedric',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1102', name: 'Mrs. Swati V. Dangde',               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1103', name: 'Mrs. Shubhada Ashok Gophane',        amount: 1500, mode: 'ONLINE', status: 'PAID' },
  { flat: '1104', name: 'Mr. Shabbir Patrawala',              amount: 0,    status: 'PENDING' },
  { flat: '1105', name: 'Mrs. Deepjyoti Jaryal',              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1106', name: 'Ansari Farid Abdul Mannan',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1107', name: "Mr. Alfred Suresh O'Neill",          amount: 0,    status: 'PENDING' },
  { flat: '1108', name: 'Mr. Kiran Ramdas Tajane',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
];

// ─── Derived summary (computed once at module load) ──────────────────────────

function computeSummary(flats: PrevYearFlat[]) {
  const paid   = flats.filter((f) => f.status === 'PAID');
  const pending = flats.filter((f) => f.status === 'PENDING');

  const totalCollected = paid.reduce((s, f) => s + f.amount, 0);
  // Expected per flat for 2025-26 was ₹1,200
  const expectedPerFlat = 1200;
  const totalPending   = pending.length * expectedPerFlat;
  const totalFlats     = flats.length;
  const paidCount      = paid.length;
  const pendingCount   = pending.length;
  const collectionPct  = totalFlats > 0 ? Math.round((paidCount / totalFlats) * 100) : 0;

  return { totalCollected, totalPending, totalFlats, paidCount, pendingCount, collectionPct, expectedPerFlat };
}

export const A_BUILDING_2025_26_SUMMARY = computeSummary(A_BUILDING_2025_26);

// ─── B BUILDING (96 flats: Floors 1 to 12) ──────────────────────────────────

export const B_BUILDING_2025_26: PrevYearFlat[] = [
  // Floor 1
  { flat: '101', name: 'Mr. Naik Preetam Premanand',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '102', name: 'Mr. Vikram Kumar',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '103', name: 'Mr. Rajeev Pawar',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '104', name: 'Mrs. Sachdev Veena Harish',             amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '105', name: 'Mrs. Joshna V. Nile & Mr. Vaibhav Nile', amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '106', name: 'Mrs. Sharma Bhavna',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '107', name: 'Mr. Javed Shaikh',                      amount: 1500, mode: 'ONLINE', status: 'PAID' },
  { flat: '108', name: 'Mrs. Belinda Sahil Bhatia',             amount: 0,    status: 'PENDING' },

  // Floor 2
  { flat: '201', name: 'Lalita S',                              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '202', name: 'Mrs. Abrar Sayed',                      amount: 0,    status: 'PENDING' },
  { flat: '203', name: 'Ms. Priyanka',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '204', name: 'Mr. Sudhir Shrivastava',                amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '205', name: 'Mr. Shahebaz Mainuddin Shaikh',         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '206', name: 'Mr. Krishna Kumar Verma',               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '207', name: 'Mr. Sahil Monga & Nisha Kumari',        amount: 0,    status: 'PENDING' },
  { flat: '208', name: 'Mr. Sambhaji Jadav',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 3
  { flat: '301', name: 'Miss. Deepa Thakur Rao',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '302', name: 'Mr. Russell Nayak',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '303', name: 'Mr. Ankush Bobade',                     amount: 0,    status: 'PENDING' },
  { flat: '304', name: 'Mr. Saurabh Jaiswal',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '305', name: 'Mrs. Neha Ashton Lazarus',              amount: 0,    status: 'PENDING' },
  { flat: '306', name: 'Mr. Abhishek Jeevan',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '307', name: 'Mr. Sunil Kumar & Abha Kumar (Rahul Singh)', amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '308', name: 'Mr. Moses Mascarenhas',                 amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 4
  { flat: '401', name: 'Mr. Shahebaz Mainuddin Shaikh',         amount: 0,    status: 'PENDING' },
  { flat: '402', name: 'Mr. Vishal Dilipkumar Shende',          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '403', name: 'Miss. Anjali Ajgaonkar',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '404', name: 'Ms. Maya Ghughe',                       amount: 500,  mode: 'ONLINE', status: 'PAID' },
  { flat: '405', name: 'Mr. Santosh Shinde',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '406', name: 'Mr. Shailesh Namekar',                  amount: 0,    status: 'PENDING' },
  { flat: '407', name: 'Mr. Gaurav Pandey',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '408', name: 'Mrs. Gunjandevi Yadav & Mithlesh',      amount: 1551, mode: 'ONLINE', status: 'PAID' },

  // Floor 5
  { flat: '501', name: 'Mrs. Arpita Bhattachrjee',              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '502', name: 'Ms. Swarna Biswas',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '503', name: 'Mr. Vijaya Udhavrao Kolpe',             amount: 0,    status: 'PENDING' },
  { flat: '504', name: 'Mr. Parag Bujone',                      amount: 0,    status: 'PENDING' },
  { flat: '505', name: 'Amoy Ahwah Lee',                        amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '506', name: 'Mr. Shyam Sunder',                      amount: 1500, mode: 'ONLINE', status: 'PAID' },
  { flat: '507', name: 'Mr. Digambar Tanaji Giribuwa',          amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '508', name: 'Mr. Pradeep Dattajirao Desai',          amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 6
  { flat: '601', name: 'Mrs. Madhu Kaushik',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '602', name: 'Mr. Apurv',                             amount: 0,    status: 'PENDING' },
  { flat: '603', name: 'Mr. Jude Joseph Dsouza',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '604', name: 'Mr. Prabhat Singh & Mallika Singh',     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '605', name: 'Mr. Hansmukh Morarji',                  amount: 0,    status: 'PENDING' },
  { flat: '606', name: 'Mr. Yogita K',                          amount: 0,    status: 'PENDING' },
  { flat: '607', name: 'Mr. Rohan Uday Kavde',                  amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '608', name: 'Mrs. Pratibha Malik',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 7
  { flat: '701', name: 'Mrs. Samina Sajid Malik',               amount: 0,    status: 'PENDING' },
  { flat: '702', name: 'Ms. Priyanka Patil',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '703', name: 'Mr. Rohit Prachure',                    amount: 0,    status: 'PENDING' },
  { flat: '704', name: 'Ms. Aarti Dalvi',                       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '705', name: 'Mr. Anand Rakesh Tamang',               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '706', name: 'Mrs. Tejshree Deshmukh',                amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '707', name: 'Mr. Deepak Dharmaraj',                  amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '708', name: 'Mr. Manish Ranjan',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 8
  { flat: '801', name: 'Mr. Shubham Kumar Singh',               amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '802', name: 'Mr. Sachin Singh & Rajbala Devi',       amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '803', name: 'Mr. Satish Shivram Bhosale',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '804', name: 'Mr. Moin Munir Shaikh Nuzhat',          amount: 0,    status: 'PENDING' },
  { flat: '805', name: 'Mr. Imran Deshmukh',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '806', name: 'Mr. Ankush Ramrao Shinde',              amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '807', name: 'Mr. Ludhani',                           amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '808', name: 'Mr. Mohit',                             amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 9
  { flat: '901', name: 'Mr. Ganesh Jagannath Jagtap',           amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '902', name: 'Mrs. Suprabha Nandi',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '903', name: 'Mrs. Seema Manoj Pallod',               amount: 0,    status: 'PENDING' },
  { flat: '904', name: 'Mr. Amar Wale',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '905', name: 'Mr. Yusuf Ampanwala',                   amount: 0,    status: 'PENDING' },
  { flat: '906', name: 'Mr. Rajesh Bapusaheb Khude',            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '907', name: 'Mr. Atul Ashok Jagtap',                 amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '908', name: 'Mrs. Ekta Gaikwad',                     amount: 2702, mode: 'ONLINE', status: 'PAID' },

  // Floor 10
  { flat: '1001', name: 'Glyniis Aubey',                        amount: 0,    status: 'PENDING' },
  { flat: '1002', name: 'Mr. Ramraje Kakde',                    amount: 0,    status: 'PENDING' },
  { flat: '1003', name: 'Mrs. Sampada Mohan Nagraj',            amount: 0,    status: 'PENDING' },
  { flat: '1004', name: 'Miss. Rashida Madraswala',             amount: 0,    status: 'PENDING' },
  { flat: '1005', name: 'Mr. Surendra Dubey',                   amount: 0,    status: 'PENDING' },
  { flat: '1006', name: 'Mrs. Alka Dubey',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1007', name: 'Mr. Mayur Vilasrao Jagtap',            amount: 0,    status: 'PENDING' },
  { flat: '1008', name: 'Mr. Rajiv Arora',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 11
  { flat: '1101', name: 'Mr. Aryan Pandey',                     amount: 500,  mode: 'ONLINE', status: 'PAID' },
  { flat: '1102', name: 'Agnelo Norman',                        amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1103', name: 'Mr. Ravindra Dixit & Swagata Dixit',   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1104', name: 'Mrs. Sweta Prasad',                    amount: 0,    status: 'PENDING' },
  { flat: '1105', name: 'Mr. Hussain',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1106', name: 'Mr. Ramesh Solanki',                   amount: 0,    status: 'PENDING' },
  { flat: '1107', name: 'Mrs. Nivedita Maheshwari',             amount: 0,    status: 'PENDING' },
  { flat: '1108', name: 'Mr. Sanjit Shenoy',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 12
  { flat: '1201', name: 'Mrs. Priyanka Shah',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1202', name: 'Mr. Deepak Nagdev',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1203', name: 'Mrs. Samina Lokhandwala',              amount: 0,    status: 'PENDING' },
  { flat: '1204', name: 'Mrs. Tina Arun Rohra',                 amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1205', name: 'Mr. Manoj Madhavdas Lakhi',            amount: 0,    status: 'PENDING' },
  { flat: '1206', name: 'Mr. Rayan Barretto',                   amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '1207', name: 'Mr. Rajan Duggal & Monika Sharma',     amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '1208', name: 'Mr. Rishabh Kumar',                    amount: 0,    status: 'PENDING' },
];

export const B_BUILDING_2025_26_SUMMARY = computeSummary(B_BUILDING_2025_26);

// ─── C BUILDING (48 flats: Floors 1 to 6) ───────────────────────────────────

export const C_BUILDING_2025_26: PrevYearFlat[] = [
  // Floor 1
  { flat: '101', name: 'Clinton Fernandes',                     amount: 0,    status: 'PENDING' },
  { flat: '102', name: 'Dhanraj Mane',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '103', name: 'Samrat Choudhury',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '104', name: 'Saud Shaikh',                           amount: 0,    status: 'PENDING' },
  { flat: '105', name: 'Raheal Rathod',                         amount: 0,    status: 'PENDING' },
  { flat: '106', name: 'Ms. Veronica Francis',                  amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '107', name: 'Sanmay Jagtap',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '108', name: 'Yogita Shirdhankar',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 2
  { flat: '201', name: 'Imrankhan Pathan',                      amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '202', name: 'Ashley Carrasco',                       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '203', name: 'Garima Rana',                           amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '204', name: 'Sufiyan Tamboli',                       amount: 1301, mode: 'ONLINE', status: 'PAID' },
  { flat: '205', name: 'Chetan Habib',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '206', name: 'Shriniketan',                           amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '207', name: 'Nishad Mohandas',                       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '208', name: 'Madhu Verma',                           amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 3
  { flat: '301', name: 'Sameer Kaulagekar',                     amount: 0,    status: 'PENDING' },
  { flat: '302', name: 'Amol Sathe',                            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '303', name: 'Sunil Agrawal',                         amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '304', name: 'Nitesh A',                              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '305', name: 'Abid S',                                amount: 0,    status: 'PENDING' },
  { flat: '306', name: 'Mr. Rohan Kotkar',                      amount: 0,    status: 'PENDING' },
  { flat: '307', name: 'Rajesh Sapkal',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '308', name: 'Aamay Arora',                           amount: 1200, mode: 'ONLINE', status: 'PAID' },

  // Floor 4
  { flat: '401', name: 'Kaustubh',                              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '402', name: 'Rohan Veer',                            amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '403', name: 'Anosh',                                 amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '404', name: 'Sameer Perampalli',                     amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '405', name: 'Rahul Khade',                           amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '406', name: 'Noel Paul',                             amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '407', name: 'Parikshit Dharmale',                    amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '408', name: 'Aniket',                                amount: 1500, mode: 'ONLINE', status: 'PAID' },

  // Floor 5
  { flat: '501', name: 'Anirudh',                               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '502', name: 'Sandhya Gaikwad',                       amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '503', name: 'Rachel',                                amount: 0,    status: 'PENDING' },
  { flat: '504', name: 'Santanu Gauratra',                      amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '505', name: 'Vivek Chavan',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '506', name: 'Hussain',                               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '507', name: 'Satish Shetty',                         amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '508', name: 'Surajit Das',                           amount: 1201, mode: 'ONLINE', status: 'PAID' },

  // Floor 6
  { flat: '601', name: 'Amber',                                 amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '602', name: 'Naveen Gupta',                          amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '603', name: 'Param N',                               amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '604', name: 'Hasina S',                              amount: 1200, mode: 'ONLINE', status: 'PAID' },
  { flat: '605', name: 'Tasneem Palodawala',                    amount: 0,    status: 'PENDING' },
  { flat: '606', name: 'Vivek Rahate',                          amount: 1201, mode: 'ONLINE', status: 'PAID' },
  { flat: '607', name: 'Husham',                                amount: 0,    status: 'PENDING' },
  { flat: '608', name: 'Amal Nair',                             amount: 1200, mode: 'ONLINE', status: 'PAID' },
];

export const C_BUILDING_2025_26_SUMMARY = computeSummary(C_BUILDING_2025_26);

// ─── Combined 3-Building Summary ─────────────────────────────────────────────

export const ALL_BUILDINGS_2025_26 = [
  { buildingId: 'A', label: 'A Building', flats: A_BUILDING_2025_26, summary: A_BUILDING_2025_26_SUMMARY },
  { buildingId: 'B', label: 'B Building', flats: B_BUILDING_2025_26, summary: B_BUILDING_2025_26_SUMMARY },
  { buildingId: 'C', label: 'C Building', flats: C_BUILDING_2025_26, summary: C_BUILDING_2025_26_SUMMARY },
];

export const COMBINED_2025_26_SUMMARY = (() => {
  const all = [...A_BUILDING_2025_26, ...B_BUILDING_2025_26, ...C_BUILDING_2025_26];
  return computeSummary(all);
})();

// ─── Other / Special Contributions (2025-26) ─────────────────────────────────
// These are non-flat contributions — donations, transfers, sponsor payments, etc.
// Entered separately as requested.

export interface OtherIncomeEntry {
  id: string;
  description: string;
  reference?: string;   // flat no., person name, or source
  amount: number;
  mode: 'ONLINE' | 'CASH' | 'TRANSFER';
}

export const OTHER_INCOME_2025_26: OtherIncomeEntry[] = [
  {
    id: 'other-1',
    description: 'Pooja Samagri Contribution',
    reference: 'B-1207',
    amount: 1000,
    mode: 'ONLINE',
  },
  {
    id: 'other-2',
    description: 'Transfer From Ganesh (Last Year Balance)',
    reference: 'Carry-forward from 2024-25',
    amount: 453,
    mode: 'TRANSFER',
  },
  {
    id: 'other-3',
    description: 'Decoration Sponsorship — Rahul Singh',
    reference: 'B-307 (Rahul Singh)',
    amount: 10000,
    mode: 'ONLINE',
  },
  {
    id: 'other-4',
    description: 'Flat Contribution — Mr. Darshan',
    reference: 'B-306',
    amount: 1200,
    mode: 'ONLINE',
  },
  {
    id: 'other-5',
    description: 'Daan Peti Collection',
    reference: 'Donation Box',
    amount: 5850,
    mode: 'CASH',
  },
  {
    id: 'other-6',
    description: 'Ganpati Murti Sponsorship — Prashant Mahindrakar',
    reference: 'A-505',
    amount: 10000,
    mode: 'ONLINE',
  },
];

export const OTHER_INCOME_2025_26_TOTAL = OTHER_INCOME_2025_26.reduce(
  (sum, e) => sum + e.amount, 0,
);

// Grand total across flats + other income
export const GRAND_TOTAL_2025_26 = COMBINED_2025_26_SUMMARY.totalCollected + OTHER_INCOME_2025_26_TOTAL;

// ─── EXPENSES 2025-26 ────────────────────────────────────────────────────────
export interface PrevYearExpense {
  id: string;
  particulars: string;
  estimatedExp: number;
  remarks?: string;
  category?: string;
}

export const EXPENSES_2025_26: PrevYearExpense[] = [
  { id: 'exp-1',  particulars: 'Dhol',                estimatedExp: 35000, category: 'Dhol Pathak / Band' },
  { id: 'exp-2',  particulars: 'Tractor+ rath',       estimatedExp: 9500,  remarks: '1st day', category: 'Stage & Mandap' },
  { id: 'exp-3',  particulars: 'Club House Décor',    estimatedExp: 10000, category: 'Decoration' },
  { id: 'exp-4',  particulars: 'Stage + Sound',       estimatedExp: 11500, category: 'Sound & Light' },
  { id: 'exp-5',  particulars: 'Visarjan Sound',      estimatedExp: 8000,  category: 'Sound & Light' },
  { id: 'exp-6',  particulars: 'Tractor+ rath',       estimatedExp: 8000,  remarks: 'Visarjan', category: 'Stage & Mandap' },
  { id: 'exp-7',  particulars: 'Visarjan Snacks',     estimatedExp: 5000,  category: 'Catering & Food' },
  { id: 'exp-8',  particulars: 'Gulal',               estimatedExp: 500,   category: 'Pooja & Rituals' },
  { id: 'exp-9',  particulars: 'Satyanarayan Pooja',  estimatedExp: 5000,  category: 'Pooja & Rituals' },
  { id: 'exp-10', particulars: 'Water bottle',        estimatedExp: 5000,  category: 'Catering & Food' },
  { id: 'exp-11', particulars: 'Table + Chair + Mat', estimatedExp: 5000,  category: 'Stage & Mandap' },
  { id: 'exp-12', particulars: 'Disposable',          estimatedExp: 2000,  category: 'Catering & Food' },
  { id: 'exp-13', particulars: 'Fireworks',          estimatedExp: 5000,  category: 'Cultural Events' },
  { id: 'exp-14', particulars: 'Haar + Prasad',       estimatedExp: 5000,  category: 'Pooja & Rituals' },
  { id: 'exp-15', particulars: 'Pooja Samagiri',      estimatedExp: 2000,  category: 'Pooja & Rituals' },
  { id: 'exp-16', particulars: 'Misc',                estimatedExp: 5000,  category: 'Miscellaneous' },
];

export const EXPENSES_2025_26_TOTAL = EXPENSES_2025_26.reduce(
  (sum, e) => sum + e.estimatedExp,
  0
);

// Net Surplus / Savings for 2025-26 (Income minus Expenses)
export const SURPLUS_2025_26 = GRAND_TOTAL_2025_26 - EXPENSES_2025_26_TOTAL;

