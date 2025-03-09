
import React, { useState, useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ToDoList from "../../ToDoListComponents/ToDoList";

jest.mock("../../../utils/authService", () => ({
    getAuthenticatedRequest: jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([{ id: 1, name: "Test To-Do List" }]),
        })
    ),
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: "Sample To-Do List" }]),
    })
);

test("renders the list of to-do lists correctly", async () => {
    render(<ToDoList />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(await screen.findByText("To-Do Lists")).toBeInTheDocument();
});
