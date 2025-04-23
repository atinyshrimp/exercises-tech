// Architecture Understanding & Separation of Concerns Exercise
//
// This component violates proper architecture principles by:
// 1. Mixing data fetching, business logic, and UI rendering all in one place
// 2. Performing multiple responsibilities within a single component
// 3. Lacking proper separation between API calls, data processing, and UI
// 4. Containing both data fetching and state updates for unrelated features
//
// Your task: Refactor this component by:
// 1. Separating API calls into a dedicated service
// 2. Breaking down the UI into smaller, focused components
// 3. Properly separating business logic from presentation
// 4. Creating a proper architecture with clear separation of concerns

// services/api.js
import "isomorphic-fetch";
import { apiURL } from "../config";

class api {
  constructor() {
    this.token = "";
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
  }

  removeToken() {
    this.token = "";
  }

  get(path) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${this.token}`,
          },
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  put(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${this.token}`,
          },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }

  post(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiURL}${path}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${this.token}`,
          },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        if (response.status !== 200) {
          return reject(res);
        }
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const API = new api();

// services/mail.js
const sendReminderEmail = async (orderId) => {
  try {
    const response = await API.post(`/orders/${orderId}/send-reminder`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send reminder");
    }

    alert("Reminder email sent successfully");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

// utils/index.js
const calculateTotalRevenue = (orders) => {
  return orders.reduce((sum, order) => sum + order.total, 0);
};

const getCustomerEmails = (orders) => {
  return [...new Set(orders.map((order) => order.customerEmail))];
};

// components/LoadingSpinner.jsx
const LoadingSpinner = (message = "Loading orders...") => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

// components/ErrorAlert.jsx
const ErrorAlert = ({ message }) => {
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{message}</div>
  );
};

// components/OrdersDashboard.jsx
import React, { useState, useEffect } from "react";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    sort: "date",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.post("/orders/search", filters);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch orders");

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Mark order as shipped
  const markAsShipped = async (orderId) => {
    try {
      const response = await API.put(`/orders/${orderId}`, {
        status: "shipped",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "shipped" } : order
        )
      );
      alert("Order marked as shipped");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Dashboard Summary</h2>
        <p className="mb-1">Total Orders: {orders.length}</p>
        <p className="mb-1">
          Total Revenue: ${calculateTotalRevenue(orders).toFixed(2)}
        </p>
        <p>Unique Customers: {getCustomerEmails(orders).length}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Orders</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="date">Sort by Date</option>
          <option value="total">Sort by Total</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                    <br />
                    {order.customerEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => sendReminderEmail(order.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Send Reminder
                    </button>
                    {order.status !== "shipped" && (
                      <button
                        onClick={() => markAsShipped(order.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Shipped
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;
