import Dashboard from "views/Dashboard.js";
import PersonalInfo from "views/PersonalInfo.js";
import Beneficiary from "views/Beneficiary.js";
import Transfer from "views/Transfer.js";
import Statement from "views/Statement.js";
import Cards from "views/Cards.js";
import Tickets from "views/Tickets.js";
// admin routes
import AdminDashboard from "views/admin/AdminDashboard";
import AdminUserList from "views/admin/AdminUserList";
var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "fa fa-solid fa-house",
    component: <Dashboard />,
    layout: "/main",
  },
  {
    path: "/personal",
    name: "Personal Info",
    icon: "fa fa-solid fa-user",
    component: <PersonalInfo />,
    layout: "/main",
  },
  {
    path: "/beneficiary",
    name: "Beneficiary",
    icon: "fa fa-solid fa-list",
    component: <Beneficiary />,
    layout: "/main",
  },
  {
    path: "/transfer",
    name: "Transfer",
    icon: "fa fa-solid fa-money-bill",
    component: <Transfer />,
    layout: "/main",
  },
  {
    path: "/statement",
    name: "Statement",
    icon: "fa fa-solid fa-newspaper",
    component: <Statement />,
    layout: "/main",
  },
  {
    path: "/cards",
    name: "Cards",
    icon: "fa fa-solid fa-credit-card",
    component: <Cards />,
    layout: "/main",
  },
  {
    path: "/ticket",
    name: "Tickets",
    icon: "fa fa-solid fa-ticket",
    component: <Tickets />,
    layout: "/main",
  },

  // Admin Routes

  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "fa fa-solid fa-house",
    component: <AdminDashboard />,
    layout: "/admin",
  },
  {
    path: "/user-list",
    name: "User list",
    icon: "fa fa-solid fa-user",
    component: <AdminUserList />,
    layout: "/admin",
  },
];

export default routes;
