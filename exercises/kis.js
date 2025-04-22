// KISS Principle Exercise
//
// This component violates the KISS principle in several ways:
// - It uses unnecessary abstractions (useCallback, useMemo)
// - It has complex state management that's hard to follow
// - It mixes concerns between data fetching, processing, and UI rendering
//
// Your task: Simplify this component by:
// 1. Removing unnecessary abstractions
// 2. Streamlining the data fetching
// 3. Making the code more straightforward
// 4. Keeping the existing functionality and Tailwind styling

import React, { useState, useEffect } from "react";

const UserStatistics = ({ userId, preferences }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const userResponse = await fetch(`/api/users/${userId}`);
        const userData = await userResponse.json();

        const transactionResponse = await fetch(
          `/api/transactions?userId=${userId}`
        );
        const transactionData = await transactionResponse.json();

        if (userData.ok && transactionData.ok) {
          setUser(userData.data);
          setTransactions(transactionData.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  let averageSpend = 0;
  let topCategory = "None";
  let userTier = "Silver";

  if (transactions.length > 0) {
    averageSpend =
      transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

    // Find top category
    const frequencyMap = {};
    transactions.forEach((t) => {
      frequencyMap[t.category] = (frequencyMap[t.category] || 0) + 1;
    });

    let maxCount = 0;
    for (const category in frequencyMap) {
      if (frequencyMap[category] > maxCount) {
        maxCount = frequencyMap[category];
        topCategory = category;
      }
    }

    if (user?.totalSpent > 10000) {
      userTier = "Platinum";
    } else if (user?.totalSpent > 5000) {
      userTier = "Gold";
    }
  }

  return (
    <div
      className={`bg-${
        preferences?.darkMode ? "gray-800" : "white"
      } shadow-lg rounded-lg p-6 m-4 transition-all duration-300 ${
        preferences?.animations ? "animate-fade-in" : ""
      }`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h3
            className={`text-${
              preferences?.darkMode ? "white" : "gray-800"
            } font-bold text-xl mb-4`}
          >
            User Statistics
          </h3>
          <div
            className={`text-${
              preferences?.darkMode ? "gray-300" : "gray-600"
            }`}
          >
            <p className="mb-2">
              Average Spend: {preferences?.currencySymbol || "$"}
              {averageSpend.toFixed(2)}
            </p>
            <p className="mb-2">Top Category: {topCategory}</p>
            <p className="mb-2">
              User Tier:
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  userTier === "Platinum"
                    ? "bg-purple-200 text-purple-800"
                    : userTier === "Gold"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {userTier}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserStatistics;
