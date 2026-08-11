require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const doctors = [
  {
    name: "Dr. Ahmed Rahman",
    specialization: "Cardiologist",
    hospital: "Dhaka Medical Center",
    phone: "01711000001",
    email: "ahmed.rahman@doctortracker.com",
  },
  {
    name: "Dr. Nusrat Jahan",
    specialization: "Dermatologist",
    hospital: "Square Hospital",
    phone: "01711000002",
    email: "nusrat.jahan@doctortracker.com",
  },
  {
    name: "Dr. Tanvir Hasan",
    specialization: "Neurologist",
    hospital: "United Hospital",
    phone: "01711000003",
    email: "tanvir.hasan@doctortracker.com",
  },
  {
    name: "Dr. Sadia Karim",
    specialization: "Pediatrician",
    hospital: "Evercare Hospital",
    phone: "01711000004",
    email: "sadia.karim@doctortracker.com",
  },
  {
    name: "Dr. Farhan Kabir",
    specialization: "Orthopedic Surgeon",
    hospital: "Labaid Specialized Hospital",
    phone: "01711000005",
    email: "farhan.kabir@doctortracker.com",
  },
  {
    name: "Dr. Mehedi Hasan",
    specialization: "General Physician",
    hospital: "Popular Diagnostic Center",
    phone: "01711000006",
    email: "mehedi.hasan@doctortracker.com",
  },
  {
    name: "Dr. Samira Islam",
    specialization: "Gynecologist",
    hospital: "Ibn Sina Hospital",
    phone: "01711000007",
    email: "samira.islam@doctortracker.com",
  },
  {
    name: "Dr. Rakib Hossain",
    specialization: "ENT Specialist",
    hospital: "Holy Family Hospital",
    phone: "01711000008",
    email: "rakib.hossain@doctortracker.com",
  },
  {
    name: "Dr. Mahin Chowdhury",
    specialization: "Psychiatrist",
    hospital: "National Mental Health Institute",
    phone: "01711000009",
    email: "mahin.chowdhury@doctortracker.com",
  },
  {
    name: "Dr. Tania Ahmed",
    specialization: "Ophthalmologist",
    hospital: "Bangladesh Eye Hospital",
    phone: "01711000010",
    email: "tania.ahmed@doctortracker.com",
  },
  {
    name: "Dr. Nabila Sultana",
    specialization: "Endocrinologist",
    hospital: "Apollo Hospital Dhaka",
    phone: "01711000011",
    email: "nabila.sultana@doctortracker.com",
  },
  {
    name: "Dr. Zahidul Islam",
    specialization: "Urologist",
    hospital: "Dhaka Central International Medical College",
    phone: "01711000012",
    email: "zahidul.islam@doctortracker.com",
  },
  {
    name: "Dr. Farzana Yasmin",
    specialization: "Radiologist",
    hospital: "Bangabandhu Sheikh Mujib Medical University",
    phone: "01711000013",
    email: "farzana.yasmin@doctortracker.com",
  },
  {
    name: "Dr. Kamrul Hasan",
    specialization: "Nephrologist",
    hospital: "Kidney Foundation Hospital",
    phone: "01711000014",
    email: "kamrul.hasan@doctortracker.com",
  },
  {
    name: "Dr. Sabrina Alam",
    specialization: "Dentist",
    hospital: "Delta Dental Care",
    phone: "01711000015",
    email: "sabrina.alam@doctortracker.com",
  },
];

const basePatients = [
  { name: "Rahim Uddin", age: 42, gender: "male", phone: "01811000001", condition: "High blood pressure" },
  { name: "Fatema Begum", age: 35, gender: "female", phone: "01811000002", condition: "Migraine" },
  { name: "Sakib Ahmed", age: 28, gender: "male", phone: "01811000003", condition: "Skin allergy" },
  { name: "Nusrat Akter", age: 24, gender: "female", phone: "01811000004", condition: "Asthma" },
  { name: "Karim Mia", age: 56, gender: "male", phone: "01811000005", condition: "Diabetes" },
  { name: "Jannatul Ferdous", age: 31, gender: "female", phone: "01811000006", condition: "Thyroid disorder" },
  { name: "Imran Hossain", age: 47, gender: "male", phone: "01811000007", condition: "Back pain" },
  { name: "Sumaiya Rahman", age: 19, gender: "female", phone: "01811000008", condition: "Iron deficiency" },
  { name: "Arif Khan", age: 63, gender: "male", phone: "01811000009", condition: "Heart disease" },
  { name: "Mim Sultana", age: 27, gender: "female", phone: "01811000010", condition: "Eye infection" },
  { name: "Shakil Ahmed", age: 39, gender: "male", phone: "01811000011", condition: "Gastritis" },
  { name: "Rima Islam", age: 45, gender: "female", phone: "01811000012", condition: "Arthritis" },
  { name: "Hasan Mahmud", age: 51, gender: "male", phone: "01811000013", condition: "High cholesterol" },
  { name: "Sadia Afrin", age: 22, gender: "female", phone: "01811000014", condition: "Anemia" },
  { name: "Naim Rahman", age: 34, gender: "male", phone: "01811000015", condition: "Sinusitis" },
  { name: "Ayesha Siddika", age: 29, gender: "female", phone: "01811000016", condition: "PCOS" },
  { name: "Rashed Karim", age: 58, gender: "male", phone: "01811000017", condition: "Hypertension" },
  { name: "Tanjila Noor", age: 33, gender: "female", phone: "01811000018", condition: "Dermatitis" },
  { name: "Fahim Hasan", age: 16, gender: "male", phone: "01811000019", condition: "Seasonal allergy" },
  { name: "Mariya Akter", age: 67, gender: "female", phone: "01811000020", condition: "Osteoporosis" },
  { name: "Jubayer Ahmed", age: 25, gender: "male", phone: "01811000021", condition: "Acne" },
  { name: "Farhana Yasmin", age: 38, gender: "female", phone: "01811000022", condition: "Kidney stone" },
  { name: "Rafiul Islam", age: 44, gender: "male", phone: "01811000023", condition: "Chronic cough" },
  { name: "Nazia Haque", age: 30, gender: "female", phone: "01811000024", condition: "Vitamin D deficiency" },
  { name: "Shahriar Kabir", age: 52, gender: "male", phone: "01811000025", condition: "Prostate issue" },
  { name: "Tahmina Khatun", age: 26, gender: "female", phone: "01811000026", condition: "Urinary tract infection" },
  { name: "Delwar Hossain", age: 60, gender: "male", phone: "01811000027", condition: "Cataract" },
  { name: "Ruma Begum", age: 41, gender: "female", phone: "01811000028", condition: "Fibroid" },
  { name: "Emon Chowdhury", age: 33, gender: "male", phone: "01811000029", condition: "Kidney infection" },
  { name: "Nusaiba Tabassum", age: 20, gender: "female", phone: "01811000030", condition: "Tooth decay" },
];

// ---------- Random patient generator ----------
// Builds additional patients on top of basePatients so re-running the seed
// gives you a fresh, differently-shuffled batch each time (good for
// pagination/testing since the dataset isn't identical run to run).

const maleFirstNames = [
  "Tanvir", "Rakibul", "Shuvo", "Anisur", "Mostafa", "Jahid", "Nayeem",
  "Rubel", "Sohel", "Asif", "Foysal", "Mizanur", "Rezaul", "Iqbal",
  "Shafiqul", "Golam", "Habibur", "Wasim", "Riyad", "Manik",
];
const femaleFirstNames = [
  "Nasrin", "Shirin", "Kamrun", "Lubna", "Rowshan", "Halima", "Sultana",
  "Parvin", "Nasima", "Rehana", "Momtaz", "Shahida", "Farida", "Anowara",
  "Rokeya", "Salma", "Marium", "Kohinoor", "Jesmin", "Afroza",
];
const lastNames = [
  "Islam", "Rahman", "Hossain", "Ahmed", "Khan", "Chowdhury", "Akter",
  "Uddin", "Miah", "Sarkar", "Talukder", "Molla", "Bhuiyan", "Sheikh",
  "Mahmud", "Kabir", "Alam", "Haque", "Karim", "Siddique",
];
const conditionsPool = [
  "Common cold", "Typhoid", "Food poisoning", "Jaundice", "Chikungunya",
  "Dengue fever", "Bronchitis", "Gout", "Insomnia", "Vertigo",
  "Peptic ulcer", "Hepatitis B", "Malnutrition", "Kidney stone",
  "Hearing loss", "Varicose veins", "Chronic fatigue", "Eczema",
  "Sciatica", "Tonsillitis", "Sinus infection", "Anxiety disorder",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(usedPhones) {
  let phone;
  do {
    const digits = Math.floor(10000000 + Math.random() * 90000000);
    phone = "018" + digits;
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
}

function generateRandomPatients(count, usedPhones) {
  const generated = [];
  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const firstName = gender === "male" ? randomFrom(maleFirstNames) : randomFrom(femaleFirstNames);
    const name = `${firstName} ${randomFrom(lastNames)}`;

    generated.push({
      name,
      age: Math.floor(Math.random() * (75 - 15 + 1)) + 15, // 15–75
      gender,
      phone: randomPhone(usedPhones),
      condition: randomFrom(conditionsPool),
    });
  }
  return generated;
}

const usedPhones = new Set(basePatients.map((p) => p.phone));
const patients = [...basePatients, ...generateRandomPatients(20, usedPhones)];

async function run() {
  try {
    console.log("Connecting to MongoDB...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await User.deleteMany({});
    console.log("Users cleared");

    await Doctor.deleteMany({});
    console.log("Doctors cleared");

    await Patient.deleteMany({});
    console.log("Patients cleared");

    const admin = new User({
      email: "admin",
      password: "admin",
      name: "Admin",
    });

    await admin.save();

    console.log("Admin created");
    console.log("Email: admin");
    console.log("Password: admin");

    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(createdDoctors.length + " doctors created");

    const patientsWithDoctors = patients.map((p, i) => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      condition: p.condition,
      doctor: createdDoctors[i % createdDoctors.length]._id,
    }));

    const createdPatients = await Patient.insertMany(patientsWithDoctors);
    console.log(createdPatients.length + " patients created");

    console.log("");
    console.log("===============================");
    console.log("       SEED COMPLETED");
    console.log("===============================");
    console.log("");
    console.log("Admin Login");
    console.log("Email: admin");
    console.log("Password: admin");
    console.log("");
    console.log("Doctors: " + createdDoctors.length);
    console.log("Patients: " + createdPatients.length);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("===============================");
    console.error("          SEED FAILED");
    console.error("===============================");
    console.error(error);
    console.error("");
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    }
  }
}

run();