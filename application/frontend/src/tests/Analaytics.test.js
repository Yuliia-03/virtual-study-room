// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import Analytics from "../pages/Analytics"; 
// import axios from "axios";
// import MockAdapter from "axios-mock-adapter";

// // Mock localStorage
// const localStorageMock = (() => {
//     let store = {};
//     return {
//         getItem: (key) => store[key] || null,
//         setItem: (key, value) => (store[key] = value),
//         clear: () => (store = {}),
//     };
// })();
// Object.defineProperty(window, "localStorage", { value: localStorageMock });

// describe("Analytics Component", () => {
//     let mockAxios;

//     beforeEach(() => {
//         mockAxios = new MockAdapter(axios);
//         localStorage.setItem("access_token", "test-token"); // Mock token storage
//     });

//     afterEach(() => {
//         mockAxios.reset();
//         localStorage.clear();
//     });

//     test("renders loading state and fetches analytics", async () => {
//         // Mock API response
//         mockAxios.onGet("http://127.0.0.1:8000/api/analytics/").reply(200, {
//             streaks: 7,
//             average_study_hours: 4.5,
//         });

//         render(<Analytics />);

//         // Check that default values (0) are shown initially
//         expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
//         expect(screen.getByText("Streak Days")).toBeInTheDocument();
//         expect(screen.getByText("Avg Study Hours")).toBeInTheDocument();

//         // Wait for API data to be updated in the UI
//         await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument());
//         await waitFor(() =>
//             expect(screen.getByText("4.5")).toBeInTheDocument()
//         );
//     });

//     test("displays error message if API call fails", async () => {
//         // Mock API failure
//         mockAxios.onGet("http://127.0.0.1:8000/api/analytics/").reply(500);

//         render(<Analytics />);

//         // Expect error message in the console (but it won't break UI)
//         await waitFor(() =>
//             expect(console.error).toHaveBeenCalledWith(
//                 "Error fetching analytics:",
//                 500
//             )
//         );
//     });

//     test("does not make API request if no access token is found", async () => {
//         localStorage.clear(); // Remove token

//         render(<Analytics />);

//         await waitFor(() =>
//             expect(console.error).toHaveBeenCalledWith(
//                 "No access token found. Please log in."
//             )
//         );
//     });
// });
