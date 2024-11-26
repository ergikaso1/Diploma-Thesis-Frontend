import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from './App';
import axios from 'axios';
import { getByText } from "@testing-library/react";


test('renders App without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});


test('renders Home page when visiting "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/welcome to ERGI FITNESS/i)).toBeInTheDocument();
  });



  test('renders Foods page when visiting "/foods"', () => {
    render(
      <MemoryRouter initialEntries={['/foods']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/No foods available. Please add some!/i)).toBeInTheDocument();  // Adjust the text to something present on the Foods page
  });

  

  test('renders Navbar and Footer on every page', () => {
    render(
      <MemoryRouter initialEntries={['/foods']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();  // Replace with actual text in your Navbar
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();  // Replace with actual text in your Footer
  });

  


jest.mock('axios');

test('fetches foods on Foods page', async () => {
  const foods = [{ name: 'Apple', calories: 95 }];
  axios.get.mockResolvedValue({ data: foods });

  render(
    <MemoryRouter initialEntries={['/foods']}>
      <App />
    </MemoryRouter>
  );

  const foodItem = await screen.findByText(/apple/i);
  expect(foodItem).toBeInTheDocument();
});
