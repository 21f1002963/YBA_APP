// utils/dateUtils.js
export const getISTDateString = () => {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
};