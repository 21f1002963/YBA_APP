// utils/playersData.js
export const playersData = [
  { id: 1, name: "Rhythm Pawar", position: 'Point Guard', dob: "2010-10-20", contact: "7568913051", address: "3/136 GoverdhanVilas Sector-14 Udaipur", joinDate: "2023-10-01" },
  { id: 2, name: "Ayona Eldos", position: 'Point Guard', dob: "2007-02-02", contact: "0987654321", address: "456 Avenue", joinDate: "2020-10-01" },
  { id: 3, name: "Mohit Kumar", position: 'Point Guard', dob: "2005-03-03", contact: "1122334455", address: "789 Boulevard", joinDate: "2023-08-01" },
  { id: 4, name: "Ponnu", position: 'Point Guard', dob: "2000-04-04", contact: "5566778899", address: "101 Parkway", joinDate: "2023-07-01" },
  { id: 5, name: "Pranav Nair", position: 'Shooting Guard', dob: "2002-11-15", contact: "7788990011", address: "22 MG Road, Bangalore", joinDate: "2022-05-15" },
  { id: 6, name: "Aditya Sharma", position: 'Small Forward', dob: "2001-07-30", contact: "9900112233", address: "45 Nehru Nagar, Delhi", joinDate: "2021-09-10" },
  { id: 7, name: "Ishaan Patel", position: 'Power Forward', dob: "2003-05-12", contact: "8877665544", address: "7 Lake View, Hyderabad", joinDate: "2023-01-20" },
  { id: 8, name: "Kavya Reddy", position: 'Center', dob: "2004-08-25", contact: "9988776655", address: "12 Hillside, Chennai", joinDate: "2022-11-05" },
  { id: 9, name: "Rahul Verma", position: 'Point Guard', dob: "2006-01-18", contact: "7766554433", address: "33 Green Park, Kolkata", joinDate: "2023-03-12" },
  { id: 10, name: "Neha Gupta", position: 'Shooting Guard', dob: "2005-09-22", contact: "8855443322", address: "9 Royal Apartments, Mumbai", joinDate: "2022-07-18" },
  { id: 11, name: "Vikram Singh", position: 'Small Forward', dob: "2003-12-05", contact: "9922334455", address: "18 Sports Complex, Pune", joinDate: "2021-12-01" },
  { id: 12, name: "Ananya Joshi", position: 'Power Forward', dob: "2004-04-30", contact: "7788996655", address: "5 Athlete Village, Ahmedabad", joinDate: "2023-02-14" },
  { id: 13, name: "Arjun Menon", position: 'Center', dob: "2002-06-17", contact: "8899001122", address: "14 Basketball Lane, Kochi", joinDate: "2020-08-25" },
  { id: 14, name: "Divya Ranganathan", position: 'Point Guard', dob: "2007-03-08", contact: "7766889944", address: "27 Hoops Colony, Chandigarh", joinDate: "2023-04-30" },
  { id: 15, name: "Rohan Malhotra", position: 'Shooting Guard', dob: "2005-10-11", contact: "9988770011", address: "3 Dunk Street, Jaipur", joinDate: "2022-09-15" },
  { id: 16, name: "P", position: 'Guard', dob: "2000-04-04", contact: "5566778899", address: "101 Parkway", joinDate: "2025-02-01" }
];

// Helper function to initialize attendance and fees data
export const initializePlayerData = (players) => {
  return players.map(player => ({
    ...player,
    attendance: {},
    fees: {}
  }));
};

export const getPlayerById = (id) => {
  return playersData.find(player => player.id === id);
};