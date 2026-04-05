import mockDb from "./mockDb";

const TOKEN_KEY = "@token";
const ADMIN_KEY = "@admintoken";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const createToken = (userId) => `token-${userId}`;

const getUserIdFromToken = () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token && token.startsWith("token-")) {
    return token.replace("token-", "");
  }
  return null;
};

const getCurrentUser = () => {
  const tokenUserId = getUserIdFromToken();
  const userId = tokenUserId || mockDb.session.currentUserId;
  return mockDb.users.find((user) => user._id === userId) || mockDb.users[0];
};

const respond = (status, data = null, message = null) => ({
  status,
  data,
  message,
});

const listByUser = (items, userId) => items.filter((item) => item.userId === userId);

const parseQuery = (link) => {
  const [path, queryString] = link.split("?");
  const query = {};
  if (queryString) {
    queryString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      query[key] = decodeURIComponent(value || "");
    });
  }
  return { path, query };
};

const ensureMeta = (userId) => {
  if (!mockDb.userMeta[userId]) {
    mockDb.userMeta[userId] = {
      limits: { hellolimit: 100000, ibftlimit: 30000 },
      transactions: { hellodebit: 0, ibftdebit: 0 },
    };
  }
  return mockDb.userMeta[userId];
};

const addTransaction = (userId, { name, credit = 0, debit = 0, type }) => {
  const txn = {
    _id: mockDb.createId("txn"),
    userId,
    time: mockDb.todayIso(),
    name,
    credit,
    debit,
    type: type || (credit > 0 ? "credit" : "debit"),
  };
  mockDb.transactions.unshift(txn);
  return txn;
};

export const localApi = {
  async request(method, link, body) {
    await delay();

    const { path, query } = parseQuery(link);

    if (method === "POST" && path === "auth/login") {
      const user = mockDb.users.find(
        (item) => item.email === body.email && item.password === body.password,
      );
      if (!user) return respond("fail", null, "Invalid credentials");
      const token = createToken(user._id);
      sessionStorage.setItem(TOKEN_KEY, token);
      mockDb.session.currentUserId = user._id;
      mockDb.session.isAdmin = false;
      return respond("success", { logintoken: token, token });
    }

    if (method === "POST" && path === "auth/register") {
      const id = mockDb.createId("user");
      const newUser = {
        _id: id,
        fname: body.fname,
        lname: body.lname,
        cnic: body.cnic,
        address: body.address,
        gender: body.gender,
        bdate: body.bdate,
        email: body.email,
        password: body.password,
        account_no: `HB-${Math.floor(100000 + Math.random() * 900000)}`,
        balance: 5000,
        closed: false,
        type: body.type || "Basic",
      };
      mockDb.users.unshift(newUser);
      ensureMeta(newUser._id);
      const token = createToken(newUser._id);
      sessionStorage.setItem(TOKEN_KEY, token);
      mockDb.session.currentUserId = newUser._id;
      mockDb.session.isAdmin = false;
      return respond("success", { logintoken: token, token });
    }

    if (method === "POST" && path === "auth/admin-login") {
      if (body.email !== mockDb.admin.email || body.password !== mockDb.admin.password) {
        return respond("fail", null, "Invalid admin credentials");
      }
      const token = `admin-${Date.now()}`;
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_KEY, token);
      mockDb.session.isAdmin = true;
      return respond("success", { logintoken: token, token });
    }

    if (method === "GET" && path === "user") {
      const user = getCurrentUser();
      const meta = ensureMeta(user._id);
      return respond("success", {
        user,
        limits: meta.limits,
        transactions: meta.transactions,
      });
    }

    if (method === "GET" && path === "user/cards") {
      const user = getCurrentUser();
      return respond(
        "success",
        mockDb.cards.filter((card) => card.userId === user._id),
      );
    }

    if (method === "PATCH" && path === "user/update-email") {
      const user = getCurrentUser();
      user.email = body.email;
      return respond("success", { user });
    }

    if (method === "PATCH" && path === "user/update-password") {
      const user = getCurrentUser();
      user.password = body.password;
      return respond("success", { user });
    }

    if (method === "GET" && path === "beneficiary") {
      const user = getCurrentUser();
      return respond("success", listByUser(mockDb.beneficiaries, user._id));
    }

    if (method === "POST" && path === "beneficiary/") {
      const user = getCurrentUser();
      const beneficiary = {
        _id: mockDb.createId("ben"),
        userId: user._id,
        nickname: body.nickname,
        name: body.nickname,
        account_no: body.account_no,
        bank: body.bank,
      };
      mockDb.beneficiaries.unshift(beneficiary);
      return respond("success", beneficiary);
    }

    if (path.startsWith("beneficiary/") && (method === "PATCH" || method === "DELETE")) {
      const id = path.split("/")[1];
      if (method === "PATCH") {
        const beneficiary = mockDb.beneficiaries.find((item) => item._id === id);
        if (!beneficiary) return respond("fail", null, "Beneficiary not found");
        beneficiary.nickname = body.nickname || beneficiary.nickname;
        beneficiary.name = body.nickname || beneficiary.name;
        return respond("success", beneficiary);
      }
      const index = mockDb.beneficiaries.findIndex((item) => item._id === id);
      if (index === -1) return respond("fail", null, "Beneficiary not found");
      const removed = mockDb.beneficiaries.splice(index, 1)[0];
      return respond("success", removed);
    }

    if (path.startsWith("transaction/transfer/") && method === "POST") {
      const id = path.split("/")[2];
      const user = getCurrentUser();
      const beneficiary = mockDb.beneficiaries.find((item) => item._id === id);
      if (!beneficiary) return respond("fail", null, "Beneficiary not found");
      user.balance -= body.amount || 0;
      addTransaction(user._id, {
        name: `Transfer to ${beneficiary.nickname}`,
        debit: body.amount || 0,
      });
      return respond("success", { balance: user.balance });
    }

    if (path.startsWith("transaction/statement") && method === "GET") {
      const user = getCurrentUser();
      const startDate = query.start ? new Date(query.start) : null;
      const endDate = query.end ? new Date(query.end) : null;
      const list = listByUser(mockDb.transactions, user._id).filter((txn) => {
        const time = new Date(txn.time);
        if (startDate && time < startDate) return false;
        if (endDate && time > endDate) return false;
        return true;
      });
      return respond("success", list);
    }

    if (path === "ticket/" && method === "GET") {
      const user = getCurrentUser();
      return respond("success", listByUser(mockDb.tickets, user._id));
    }

    if (path === "ticket/" && method === "POST") {
      const user = getCurrentUser();
      const ticket = {
        _id: mockDb.createId("ticket"),
        userId: user._id,
        message: body.message,
        reply: null,
        status: "active",
        createdAt: mockDb.todayIso(),
      };
      mockDb.tickets.unshift(ticket);
      return respond("success", ticket);
    }

    if (path === "admin/tickets" && method === "GET") {
      return respond("success", mockDb.tickets);
    }

    if (path === "admin/resolve-ticket" && method === "POST") {
      const ticket = mockDb.tickets.find((item) => item._id === body.id || item._id === body._id);
      if (!ticket) return respond("fail", null, "Ticket not found");
      ticket.reply = body.reply;
      ticket.status = "resolved";
      return respond("success", ticket);
    }

    if (path === "admin/users" && method === "GET") {
      return respond("success", mockDb.users);
    }

    if (path.startsWith("admin/user-cards/") && method === "GET") {
      const id = path.split("/")[2];
      return respond("success", mockDb.cards.filter((card) => card.userId === id));
    }

    if (path === "admin/change-account-plan" && method === "POST") {
      const user = mockDb.users.find((item) => item._id === body.cid);
      if (!user) return respond("fail", null, "User not found");
      user.type = body.type;
      return respond("success", user);
    }

    if (path.startsWith("admin/issue-card/") && method === "POST") {
      const id = path.split("/")[2];
      const newCard = {
        _id: mockDb.createId("card"),
        userId: id,
        cardnumber: `${Math.floor(4000 + Math.random() * 1000)} ${Math.floor(
          1000 + Math.random() * 9000,
        )} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
        cvc: `${Math.floor(100 + Math.random() * 900)}`,
        expiration: "2027-12-01",
        type: body.type || "Debit",
        isblocked: false,
      };
      mockDb.cards.unshift(newCard);
      return respond("success", newCard);
    }

    if (path === "admin/block-card" && method === "POST") {
      const card = mockDb.cards.find((item) => item._id === body.cardId);
      if (!card) return respond("fail", null, "Card not found");
      card.isblocked = true;
      return respond("success", card);
    }

    if (path.startsWith("admin/close-account/") && method === "POST") {
      const id = path.split("/")[2];
      const user = mockDb.users.find((item) => item._id === id);
      if (!user) return respond("fail", null, "User not found");
      user.closed = true;
      return respond("success", user);
    }

    if (path.startsWith("admin/add-money/") && method === "POST") {
      const id = path.split("/")[2];
      const user = mockDb.users.find((item) => item._id === id);
      if (!user) return respond("fail", null, "User not found");
      user.balance += body.amount || 0;
      addTransaction(user._id, { name: "Admin top-up", credit: body.amount || 0 });
      return respond("success", { balance: user.balance });
    }

    if (path === "product/buy" && method === "POST") {
      const user = getCurrentUser();
      addTransaction(user._id, {
        name: body.name || "Product",
        debit: body.price || 0,
      });
      user.balance -= body.price || 0;
      return respond("success", { balance: user.balance });
    }

    return respond("fail", null, `No local handler for ${method} ${path}`);
  },
};
