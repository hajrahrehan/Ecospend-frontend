import { toast } from "react-toastify";

// 🌟 Universal Fetch Wrapper
const CreateFetch = async (
  method: string,
  link: string,
  body?: object | null,
  istoken = true,
  noError = false,
) => {
  try {
    const token = istoken ? sessionStorage.getItem("@token") : null;

    const requestOptions: any = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const base = process.env.REACT_APP_BACKEND?.endsWith("/")
      ? process.env.REACT_APP_BACKEND
      : process.env.REACT_APP_BACKEND + "/";

    const res = await fetch(base + link, requestOptions);
    const json = await res.json();

    if (json.status === "fail" && !noError) {
      toast.error(json.message || "Something went wrong");
      return null;
    }

    if (json.status !== "success" && !noError) {
      toast.error(json.message || "Error");
      return null;
    }

    return json;
  } catch (err: any) {
    if (!noError) toast.error(err.message);
    return null;
  }
};

// ---------------- AUTH ----------------

export async function SignIn(body: { username: string; password: string }) {
  const res = await CreateFetch("POST", "auth/login", body, false);

  if (res?.data?.token) {
    sessionStorage.setItem("@token", res.data.token);
  }

  return res;
}

export async function Register(body: any) {
  return CreateFetch("POST", "auth/register", body, false);
}

export async function AdminSignIn(body: { email: string; password: string }) {
  const res = await CreateFetch("POST", "auth/admin-login", body, false);

  if (res?.data?.token) {
    sessionStorage.setItem("@token", res.data.token);
  }

  return res;
}

// ---------------- USER ----------------

export async function UserInfo() {
  const res = await CreateFetch("GET", "user");

  if (!res || !res.data) return null;

  return {
    ...res,
    data: {
      user: res.data.user,
      limits: res.data.limits || { hellolimit: 0, ibftlimit: 0 },
      transactions: res.data.transactions || { hellodebit: 0, ibftdebit: 0 },
    },
  };
}

export async function UserCards() {
  return CreateFetch("GET", "user");
}

export async function UpdateEmail(body: { email: string }) {
  return CreateFetch("PATCH", "user/update-email", body);
}

export async function UpdatePassword(body: { password: string }) {
  return CreateFetch("PATCH", "user/update-password", body);
}

// ------------------- Beneficiary -------------------
export async function BeneficiaryList() {
  return CreateFetch("GET", "beneficiary");
}

export async function AddBeneficiary(body: {
  nickname: string;
  account_no: string;
  bank: string;
}) {
  return CreateFetch("POST", "beneficiary/", body);
}

export async function EditBeneficiary(id: string, body: { nickname: string }) {
  return CreateFetch("PATCH", `beneficiary/${id}`, body);
}

export async function DeleteBeneficiary(id: string) {
  return CreateFetch("DELETE", `beneficiary/${id}`);
}

// ------------------- Transaction -------------------
export async function TransferToBeneficiary(
  id: string,
  body: { amount: number },
) {
  return CreateFetch("POST", `transaction/transfer/${id}`, body);
}

export async function GetStatement(body: { start: string; end?: string }) {
  let ex = `?start=${body.start}`;
  if (body?.end) ex += `&end=${body.end}`;
  return CreateFetch("GET", `transaction/statement${ex}`);
}

// ------------------- Ticket -------------------
export async function UserTicketList() {
  return CreateFetch("GET", "ticket/"); // FIXED: singular
}

export async function CreateTicket(body: {
  subject?: string;
  message: string;
}) {
  return CreateFetch("POST", "ticket/", body);
}

// ------------------- Admin -------------------
export async function AdminTicketList() {
  return CreateFetch("GET", "admin/tickets");
}

export async function AdminResolveTicket(body: { id: number; reply: string }) {
  return CreateFetch("POST", "admin/resolve-ticket", body);
}

export async function AdminUserList() {
  return CreateFetch("GET", "admin/users", undefined, true);
}

export async function AdminUserCards(id: string) {
  return CreateFetch("GET", `admin/user-cards/${id}`, undefined, true);
}

export async function AdminChangeAccountPlan(body: {
  cid: number;
  type: string;
}) {
  return CreateFetch("POST", "admin/change-account-plan", body);
}

export async function AdminIssueCard(id: string, body: { type: string }) {
  return CreateFetch("POST", `admin/issue-card/${id}`, body);
}

export async function AdminBlockCard(body: { cardId: number }) {
  return CreateFetch("POST", "admin/block-card", body);
}

export async function AdminCloseAccount(id: string) {
  return CreateFetch("POST", `admin/close-account/${id}`);
}

export async function AdminAddMoney(id: string, body: { amount: number }) {
  return CreateFetch("POST", `admin/add-money/${id}`, body);
}
export async function BuyCompanyProduct(body: any) {
  return CreateFetch("POST", "product/buy", body);
}
