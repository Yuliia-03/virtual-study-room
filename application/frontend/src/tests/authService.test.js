import axios from "axios";
import {
    getAccessToken,
    getRefreshToken,
    isTokenExpired,
    refreshToken,
    getAuthenticatedRequest,
} from "../utils/authService"; // Update the path accordingly
import { jwtDecode } from "jwt-decode";

// Mock localStorage
beforeEach(() => {
    jest.spyOn(Storage.prototype, "getItem");
    jest.spyOn(Storage.prototype, "setItem");
    jest.spyOn(Storage.prototype, "removeItem");

    // Fix for window.location.href issue
    delete window.location;
    window.location = { href: "" };
});


jest.mock("jwt-decode", () => ({
    jwtDecode: jest.fn(),
}));

jest.mock("axios");

describe("Auth Service Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("isTokenExpired should return true for expired tokens", () => {
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 60 }); // Expired 60 sec ago
        expect(isTokenExpired("fake_token")).toBe(true);
    });

    test("isTokenExpired should return false for valid tokens", () => {
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 600 }); // Expires in 10 minutes
        expect(isTokenExpired("valid_token")).toBe(false);
    });

    test("refreshToken should return new access token on success", async () => {
        localStorage.getItem.mockImplementation((key) =>
            key === "refresh_token" ? "valid_refresh_token" : null
        );

        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 600 });

        axios.post.mockResolvedValue({
            data: { access: "new_access_token", refresh: "new_refresh_token" },
        });

        const newToken = await refreshToken();
        expect(newToken).toBe("new_access_token");
        expect(localStorage.setItem).toHaveBeenCalledWith("access_token", "new_access_token");
        expect(localStorage.setItem).toHaveBeenCalledWith("refresh_token", "new_refresh_token");
    });

    test("refreshToken should logout user if refresh token is expired", async () => {
        localStorage.getItem.mockImplementation(() => "expired_refresh_token");
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 600 }); // Expired

        await refreshToken();
        expect(localStorage.removeItem).toHaveBeenCalledWith("access_token");
        expect(localStorage.removeItem).toHaveBeenCalledWith("refresh_token");
        expect(window.location.href).toBe("/login");
    });

    test("refreshToken should logout on API failure", async () => {
        localStorage.getItem.mockImplementation(() => "valid_refresh_token");
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 600 });

        axios.post.mockRejectedValue({ response: { status: 401 } });

        await refreshToken();
        expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
        expect(window.location.href).toBe("/login");
    });

    test("getAuthenticatedRequest should fetch data when token is valid", async () => {
        localStorage.getItem.mockImplementation((key) => (key === "access_token" ? "valid_token" : null));
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 600 });

        axios.mockResolvedValue({ data: { message: "success" } });

        const data = await getAuthenticatedRequest("/test");
        expect(data).toEqual({ message: "success" });
        expect(axios).toHaveBeenCalledWith({
            method: "GET",
            url: "http://127.0.0.1:8000/api/test",
            headers: { Authorization: "Bearer valid_token" },
            data: null,
        });
    });

    test("getAuthenticatedRequest should refresh token if expired", async () => {
        localStorage.getItem.mockImplementation((key) =>
            key === "access_token" ? "expired_token" : "valid_refresh_token"
        );

        jwtDecode.mockImplementation((token) =>
            token === "expired_token" ? { exp: Date.now() / 1000 - 60 } : { exp: Date.now() / 1000 + 600 }
        );

        axios.post.mockResolvedValue({ data: { access: "new_access_token" } });
        axios.mockResolvedValue({ data: { message: "success" } });

        const data = await getAuthenticatedRequest("/test");
        expect(data).toEqual({ message: "success" });
        expect(localStorage.setItem).toHaveBeenCalledWith("access_token", "new_access_token");
    });

    test("getAuthenticatedRequest should logout on 401 error", async () => {
        localStorage.getItem.mockImplementation(() => "valid_token");
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 600 });

        axios.mockRejectedValue({ response: { status: 401 } });

        await expect(getAuthenticatedRequest("/test")).rejects.toThrow("Request failed with status code 401");
        expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
        expect(window.location.href).toBe("/login");
    });
});
