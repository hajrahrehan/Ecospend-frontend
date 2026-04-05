const createId = (() => {
  let counter = 2000;
  return (prefix = "id") => {
    counter += 1;
    return `${prefix}-${counter}`;
  };
})();

const todayIso = () => new Date().toISOString();

const users = [
  {
    _id: "user-1001",
    fname: "Ayesha",
    lname: "Khan",
    cnic: "3520212345671",
    address: "Gulshan Avenue, Karachi",
    gender: "f",
    bdate: "1997-06-12",
    email: "user@hellobank.com",
    password: "password",
    account_no: "HB-002341",
    balance: 125000,
    closed: false,
    type: "Basic",
  },
  {
    _id: "user-1002",
    fname: "Hassan",
    lname: "Ali",
    cnic: "3520212345672",
    address: "Blue Area, Islamabad",
    gender: "m",
    bdate: "1994-02-03",
    email: "hassan@hellobank.com",
    password: "password",
    account_no: "HB-004882",
    balance: 98000,
    closed: false,
    type: "Gold",
  },
  {
    _id: "user-1003",
    fname: "Sara",
    lname: "Iqbal",
    cnic: "3520212345673",
    address: "Model Town, Lahore",
    gender: "f",
    bdate: "1991-09-21",
    email: "sara@hellobank.com",
    password: "password",
    account_no: "HB-006114",
    balance: 45200,
    closed: true,
    type: "Basic",
  },
];

const userMeta = {
  "user-1001": {
    limits: { hellolimit: 250000, ibftlimit: 80000 },
    transactions: { hellodebit: 14000, ibftdebit: 20000 },
  },
  "user-1002": {
    limits: { hellolimit: 200000, ibftlimit: 60000 },
    transactions: { hellodebit: 16000, ibftdebit: 11000 },
  },
  "user-1003": {
    limits: { hellolimit: 100000, ibftlimit: 30000 },
    transactions: { hellodebit: 7000, ibftdebit: 4000 },
  },
};

const cards = [
  {
    _id: "card-3001",
    userId: "user-1001",
    cardnumber: "5354 8821 1091 2887",
    cvc: "233",
    expiration: "2026-09-01",
    type: "Debit",
    isblocked: false,
  },
  {
    _id: "card-3002",
    userId: "user-1001",
    cardnumber: "4539 6841 2304 7723",
    cvc: "912",
    expiration: "2027-03-01",
    type: "Virtual",
    isblocked: false,
  },
  {
    _id: "card-3003",
    userId: "user-1002",
    cardnumber: "4256 9981 1023 1101",
    cvc: "811",
    expiration: "2025-12-01",
    type: "Debit",
    isblocked: true,
  },
];

const beneficiaries = [
  {
    _id: "ben-4001",
    userId: "user-1001",
    nickname: "Mom",
    name: "Rashida Khan",
    account_no: "HB-778899",
    bank: "Hello Bank",
  },
  {
    _id: "ben-4002",
    userId: "user-1001",
    nickname: "Rent",
    name: "Naveed Ahmed",
    account_no: "ALF-112200",
    bank: "Alfalah",
  },
  {
    _id: "ben-4003",
    userId: "user-1002",
    nickname: "Supplier",
    name: "Tech Traders",
    account_no: "HBL-300420",
    bank: "HBL",
  },
];

const tickets = [
  {
    _id: "ticket-5001",
    userId: "user-1001",
    message: "Card delivery status?",
    reply: "Your card ships this week.",
    status: "resolved",
    createdAt: "2024-08-12T10:15:00.000Z",
  },
  {
    _id: "ticket-5002",
    userId: "user-1001",
    message: "Transaction pending longer than usual.",
    reply: null,
    status: "active",
    createdAt: "2024-09-02T08:22:00.000Z",
  },
  {
    _id: "ticket-5003",
    userId: "user-1002",
    message: "Need account statement for tax.",
    reply: null,
    status: "active",
    createdAt: "2024-09-05T15:40:00.000Z",
  },
];

const transactions = [
  {
    _id: "txn-6001",
    userId: "user-1001",
    time: "2024-08-02T09:12:00.000Z",
    name: "Salary",
    credit: 85000,
    debit: 0,
    type: "credit",
  },
  {
    _id: "txn-6002",
    userId: "user-1001",
    time: "2024-08-15T12:30:00.000Z",
    name: "Rent",
    credit: 0,
    debit: 32000,
    type: "debit",
  },
  {
    _id: "txn-6003",
    userId: "user-1002",
    time: "2024-08-20T16:45:00.000Z",
    name: "Invoice Payment",
    credit: 42000,
    debit: 0,
    type: "credit",
  },
];

const admin = {
  email: "admin@hellobank.com",
  password: "admin123",
};

const session = {
  currentUserId: "user-1001",
  isAdmin: false,
};

const mockDb = {
  users,
  cards,
  beneficiaries,
  tickets,
  transactions,
  userMeta,
  admin,
  session,
  createId,
  todayIso,
};

export default mockDb;
