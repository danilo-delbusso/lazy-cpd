import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./use-auth";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush }),
}));

function createWrapper() {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={qc}>{children}</QueryClientProvider>
	);
}

describe("useAuth", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
		mockPush.mockClear();
	});

	it("reports isAuthenticated=true when session returns authenticated", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ authenticated: true }),
		} as Response);

		const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.isAuthenticated).toBe(true);
	});

	it("reports isAuthenticated=false when session returns unauthenticated", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ authenticated: false }),
		} as Response);

		const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("login calls POST /api/admin/login and redirects on success", async () => {
		// Session query
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ authenticated: false }),
		} as Response);

		const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Login call + re-fetched session
		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ authenticated: true }),
			} as Response);

		await act(() => result.current.login("secret"));
		expect(mockPush).toHaveBeenCalledWith("/admin");
	});

	it("login surfaces error message on failure", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ authenticated: false }),
		} as Response);

		const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Invalid password" }),
		} as Response);

		await act(async () => {
			try {
				await result.current.login("wrong");
			} catch {
				// expected — mutateAsync throws on error
			}
		});

		await waitFor(() => expect(result.current.loginError).toBe("Invalid password"));
	});

	it("logout calls DELETE and redirects to /", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ authenticated: true }),
		} as Response);

		const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Logout call + re-fetched session
		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true } as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ authenticated: false }),
			} as Response);

		await act(() => result.current.logout());
		expect(mockPush).toHaveBeenCalledWith("/");
	});
});
