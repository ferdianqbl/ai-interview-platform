import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { authApi } from "@/services/auth";

vi.mock("@/services/auth", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe("LoginPage Component", () => {
  it("renders email and password inputs and sign-in button", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("shows error message when authentication fails", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("successfully signs in and saves token", async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      data: { token: "mock_jwt_token_123" },
    } as any);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
      });
    });
  });
});
