import { useState, useMemo } from "react";

const dummyData = [
  { date: "2024-01-01", likes: 10 },
  { date: "2024-02-01", likes: 20 },
  { date: "2024-03-01", likes: 30 },
  { date: "2024-04-01", likes: 40 },
  { date: "2024-05-01", likes: 50 },
  { date: "2024-06-01", likes: 60 },
];

const filterChartData = (data, range) => {
  const now = new Date();
  let filteredData = [];

  switch (range) {
    case "1d":
      filteredData = data.filter(
        (entry) => new Date(entry.date) >= new Date(now.setDate(now.getDate() - 1))
      );
      break;
    case "1w":
      filteredData = data.filter(
        (entry) => new Date(entry.date) >= new Date(now.setDate(now.getDate() - 7))
      );
      break;
    case "1m":
      filteredData = data.filter(
        (entry) => new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 1))
      );
      break;
    case "1y":
      filteredData = data.filter(
        (entry) => new Date(entry.date) >= new Date(now.setFullYear(now.getFullYear() - 1))
      );
      break;
    case "ALL":
    default:
      filteredData = data;
      break;
  }

  return filteredData;
};

export const useFilteredChartData = () => {
  const [selectedRange, setSelectedRange] = useState("1d");

  const filteredData = useMemo(() => filterChartData(dummyData, selectedRange), [selectedRange]);

  return { selectedRange, setSelectedRange, filteredData };
};
