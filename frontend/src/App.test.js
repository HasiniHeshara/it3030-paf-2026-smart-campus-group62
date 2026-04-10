import { render, screen } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element }) => element,
  }),
  { virtual: true }
);

jest.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
}));

jest.mock("./Components/NavBar", () => () => <div>NavBar</div>);
jest.mock("./Components/ProtectedRoute", () => ({ children }) => children);
jest.mock("./Components/AdminRoute", () => ({ children }) => children);

jest.mock("./Pages/Home/Home", () => () => <div>Home Page</div>);
jest.mock("./Pages/Auth/LoginPage", () => () => <div>Login Page</div>);
jest.mock("./Pages/Auth/RegisterPage", () => () => <div>Register Page</div>);
jest.mock("./Pages/Dashboard/UserDashboard", () => () => (
  <div>User Dashboard</div>
));
jest.mock("./Pages/Admin/AdminDash", () => () => <div>Admin Dashboard</div>);
jest.mock("./Pages/Admin/ManageUsers", () => () => <div>Manage Users</div>);
jest.mock("./Pages/Home/Bookings/BookingPage.jsx", () => () => (
  <div>Booking Page</div>
));
jest.mock("./Pages/Maintenance/IncidentTicketsPage", () => () => <div>Incident Tickets Page</div>);

import App from "./App";

test("renders the app shell", () => {
  render(<App />);

  expect(screen.getByText("NavBar")).toBeInTheDocument();
  expect(screen.getAllByText("Home Page")).toHaveLength(1);
});
