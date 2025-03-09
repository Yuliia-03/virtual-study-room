import React from "react";
import { render, screen, within, act, fireEvent } from "@testing-library/react";
import GroupStudyPage from "../pages/GroupStudyPage"; 
import axios from "axios";
import exitLogo from '../assets/exit_logo.png';
import musicLogo from "../assets/music_logo.png";
import customLogo from "../assets/customisation_logo.png";
import copyLogo from "../assets/copy_logo.png";

//mock the necessary modules
jest.mock("axios");
jest.mock("@fontsource/vt323", () => {}); 
jest.mock("@fontsource/press-start-2p", () => {}); 
jest.mock('react-toastify', () => {
  const actual = jest.requireActual('react-toastify'); 
  return {
    ...actual, 
    toast: {
      error: jest.fn(),
      success: jest.fn(),
    },
  };
});

describe("GroupStudyPage", () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({
          data: { message: "Believe in yourself and all that you are." },
        });
    });
    
    afterEach(() => {
        // Clear all mocks after each test
        jest.clearAllMocks();
    });

    test("renders the main container", async () => {
        render(<GroupStudyPage />);
        const mainContainer = screen.getByTestId("groupStudyRoom-container");
        expect(mainContainer).toBeInTheDocument();
    });

    test("renders all three columns", () => {
        render(<GroupStudyPage />);
        const columns = screen.getAllByRole("column");
        expect(columns.length).toBe(3);
    });

    test("renders motivational message", async () => {
        await act(async () => {
          render(<GroupStudyPage />);
        });
    
        // Wait for the message to appear after the API response
        const messageElement = await screen.findByText("Believe in yourself and all that you are.");
        expect(messageElement).toBeInTheDocument();
    });
    
    test("displays error message when API call fails", async () => {
        // Mock the axios.get call to return a rejected promise
        axios.get.mockRejectedValue(new Error("API Error"));
    
        await act(async () => {
          render(<GroupStudyPage />);
        });
    
        // Wait for the error message to appear
        const errorMessage = await screen.findByText("Failed to load message");
        expect(errorMessage).toBeInTheDocument();
    });

    test("first column contains: todo-list, shared materials", () => {
        render(<GroupStudyPage />);

        const firstColumn = screen.getByTestId("column-1");
      
        // Verify the to-do list container is present
        const toDoListContainer = within(firstColumn).getByTestId("todo-list-container");
        expect(toDoListContainer).toBeInTheDocument();
      
        // Verify the shared materials container is present
        const sharedContainer = within(firstColumn).getByTestId("sharedMaterials-container");
        expect(sharedContainer).toBeInTheDocument();
    });

    test("second column contains: user-list, motivational messages", () => {
        render(<GroupStudyPage />);

        const secondColumn = screen.getByTestId("column-2");
      
        // Verify the to-do list container is present
        const userListContainer = within(secondColumn).getByTestId("user-list-container");
        expect(userListContainer).toBeInTheDocument();
      
        // Verify the shared materials container is present
        const motivMesgContainer = within(secondColumn).getByTestId("motivationalMessage-container");
        expect(motivMesgContainer).toBeInTheDocument();
    });

    test("third column contains: chatbox, timer", () => {
        render(<GroupStudyPage />);

        const thirdColumn = screen.getByTestId("column-3");
      
        // Verify the to-do list container is present
        const studyTimerContainer = within(thirdColumn).getByTestId("studyTimer-container");
        expect(studyTimerContainer).toBeInTheDocument();
      
        // Verify the shared materials container is present
        const chatBoxContainer = within(thirdColumn).getByTestId("chatBox-container");
        expect(chatBoxContainer).toBeInTheDocument();
    });

    test("renders the Add More button and handles mouse events", () => {
        render(<GroupStudyPage />);
        const todoListContainer = screen.getByTestId('todo-list-container');
        const addMoreButton = within(todoListContainer).getByText("Add More");

        // Verify the button is present
        expect(addMoreButton).toBeInTheDocument();
    
        // Simulate mouse down and verify the button is active
        fireEvent.mouseDown(addMoreButton);
        expect(addMoreButton).toHaveClass("active");
    
        // Simulate mouse up and verify the button is inactive
        fireEvent.mouseUp(addMoreButton);
        expect(addMoreButton).not.toHaveClass("active");
      });

    test("renders the Music button and handles mouse events", () => {
        render(<GroupStudyPage />);
        const userListContainer = screen.getByTestId('user-list-container');
        const utilityBar = within(userListContainer).getByTestId('utility-bar')
        const musicButton = within(utilityBar).getByRole("button", { name: /music/i });
    
        // Verify the button is present
        expect(musicButton).toBeInTheDocument();
        const musicImage = within(musicButton).getByRole('img', { name: /music/i });
        expect(musicImage).toHaveAttribute('src', musicLogo);
    
        // Simulate mouse down and verify the button is active
        fireEvent.mouseDown(musicButton);
        expect(musicButton).toHaveClass("active");
    
        // Simulate mouse up and verify the button is inactive
        fireEvent.mouseUp(musicButton);
        expect(musicButton).not.toHaveClass("active");
    });

    test("renders the Customisation button and handles mouse events", () => {
        render(<GroupStudyPage />);
        const userListContainer = screen.getByTestId('user-list-container');
        const utilityBar = within(userListContainer).getByTestId('utility-bar')
        const customButton = within(utilityBar).getByRole("button", { name: /customisation/i });
    
        // Verify the button is present
        expect(customButton).toBeInTheDocument();
        const customImage = within(customButton).getByRole('img', { name: /customisation/i });
        expect(customImage).toHaveAttribute('src', customLogo);
    
        // Simulate mouse down and verify the button is active
        fireEvent.mouseDown(customButton);
        expect(customButton).toHaveClass("active");
    
        // Simulate mouse up and verify the button is inactive
        fireEvent.mouseUp(customButton);
        expect(customButton).not.toHaveClass("active");
    });

    test("renders the Copy button and handles mouse events", () => {
        render(<GroupStudyPage />);
        const userListContainer = screen.getByTestId('user-list-container');
        const utilityBar = within(userListContainer).getByTestId('utility-bar-2')
        const copyButton = within(utilityBar).getByRole("button", { name: /copy/i });
    
        // Verify the button is present
        expect(copyButton).toBeInTheDocument();

        const copyImage = within(copyButton).getByRole('img', { name: /copy/i });
        expect(copyImage).toHaveAttribute('src', copyLogo);
    
        // Simulate mouse down and verify the button is active
        fireEvent.mouseDown(copyButton);
        expect(copyButton).toHaveClass("active");
    
        // Simulate mouse up and verify the button is inactive
        fireEvent.mouseUp(copyButton);
        expect(copyButton).not.toHaveClass("active");
    });

    test("renders the Exit button and handles mouse events", () => {
        render(<GroupStudyPage />);
        const userListContainer = screen.getByTestId('user-list-container');
        const utilityBar = within(userListContainer).getByTestId('utility-bar-2')
        const exitButton = within(utilityBar).getByRole("button", { name: /exit/i });
    
        // Verify the button is present
        expect(exitButton).toBeInTheDocument();

        const exitImage = within(exitButton).getByRole('img', { name: /exit/i });
        expect(exitImage).toHaveAttribute('src', exitLogo);
    
        // Simulate mouse down and verify the button is active
        fireEvent.mouseDown(exitButton);
        expect(exitButton).toHaveClass("active");
    
        // Simulate mouse up and verify the button is inactive
        fireEvent.mouseUp(exitButton);
        expect(exitButton).not.toHaveClass("active");

    });
});