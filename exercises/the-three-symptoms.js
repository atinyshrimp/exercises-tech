// The 3 Complexity Symptoms Exercise
//
// This component exhibits all three symptoms of complexity:
//
// 1. Unknown Unknowns: Incomplete error handling in data fetching
//    - API errors are not properly handled
//    - Network failures aren't properly communicated to users
//
// 2. Cognitive Load: Too many responsibilities in one component
//    - Mixing UI, data fetching, filtering, sorting, and business logic
//    - Complex calculations and transformations
//    - Difficult to understand the data flow
//
// 3. Change Amplification: Tight coupling between different concerns
//    - Changes to one feature might affect others
//    - UI, data fetching, and business logic are intertwined
//
// Your task: Refactor this component to address these symptoms by:
// 1. Improving error handling for better predictability
// 2. Breaking down the component to reduce cognitive load
// 3. Decoupling functionality to reduce change amplification
// 4. Applying proper separation of concerns

import React, { useState, useEffect } from "react";

const useProductSearch = (query, filters, page, sortBy) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query.length) return;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", page);
      params.append("sort", sortBy);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false) params.append(key, value);
      });

      try {
        const response = await fetch(
          `/api/products/search?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Server responded with ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, page, sortBy, filters]);

  return { products, loading, error };
};

const SearchBar = ({ query, setQuery }) => (
  <div className="mb-6">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search products..."
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const FilterSection = ({ filters, handleFilterChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <select
      name="category"
      value={filters.category}
      onChange={handleFilterChange}
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Categories</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
      <option value="home">Home & Garden</option>
    </select>

    <input
      type="number"
      name="minPrice"
      value={filters.minPrice}
      onChange={handleFilterChange}
      placeholder="Min Price"
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="number"
      name="maxPrice"
      value={filters.maxPrice}
      onChange={handleFilterChange}
      placeholder="Max Price"
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <div className="flex items-center">
      <input
        type="checkbox"
        id="inStock"
        name="inStock"
        checked={filters.inStock}
        onChange={handleFilterChange}
        className="mr-2 h-5 w-5 text-blue-600"
      />
      <label htmlFor="inStock" className="text-gray-700">
        In Stock Only
      </label>
    </div>
  </div>
);

const SortDropdown = ({ sortBy, setSortBy, sortOptions }) => (
  <div className="mb-6">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {sortOptions.map((option) => (
        <option key={option} value={option}>
          {option === "relevance"
            ? "Relevance"
            : option === "price-low"
            ? "Price: Low to High"
            : option === "price-high"
            ? "Price: High to Low"
            : option}
        </option>
      ))}
    </select>
  </div>
);

const ProductCard = ({ product, showRatings }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        {product.name}
      </h3>
      <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
      {showRatings && (
        <div className="flex mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < product.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full transition-colors">
        Add to Cart
      </button>
    </div>
  </div>
);

const ProductList = ({ products, showRatings }) => {
  // Group products by category
  const categorizedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(categorizedProducts).map(
        ([category, categoryProducts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showRatings={showRatings}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

const Pagination = ({ page, setPage }) => (
  <div className="flex justify-center mt-8">
    <button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-4 py-2 mx-1 bg-gray-100 text-gray-700 rounded-md">
      Page {page}
    </span>
    <button
      onClick={() => setPage((p) => p + 1)}
      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md"
    >
      Next
    </button>
  </div>
);

// Local storage hook for search state persistence
const useSearchStateStorage = (
  initialQuery,
  initialFilters,
  saveSearchState
) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (saveSearchState) {
      localStorage.setItem("lastSearchQuery", query);
      localStorage.setItem("lastSearchFilters", JSON.stringify(filters));
    }
    return () => {
      if (saveSearchState) {
        localStorage.removeItem("lastSearchQuery");
        localStorage.removeItem("lastSearchFilters");
      }
    };
  }, [query, filters, saveSearchState]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
  };
};

// Main component
const ProductSearch = ({
  initialQuery = "",
  showRatings = true,
  allowFiltering = true,
  sortOptions = ["relevance", "price-low", "price-high"],
  saveSearchState = true,
}) => {
  // State management for filters and search
  const { query, setQuery, filters, setFilters } = useSearchStateStorage(
    initialQuery,
    {
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    },
    saveSearchState
  );

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");

  // Get products with error handling
  const { products, loading, error } = useProductSearch(
    query,
    filters,
    page,
    sortBy
  );

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setPage(1); // Reset page when filters change
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar query={query} setQuery={setQuery} />

      {allowFiltering && (
        <FilterSection
          filters={filters}
          handleFilterChange={handleFilterChange}
        />
      )}

      <SortDropdown
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={sortOptions}
      />

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No products found. Try adjusting your search criteria.
        </div>
      ) : (
        <ProductList products={products} showRatings={showRatings} />
      )}

      {!loading && !error && products.length > 0 && (
        <Pagination page={page} setPage={setPage} />
      )}
    </div>
  );
};

export default ProductSearch;
