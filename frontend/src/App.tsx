import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { InvoiceList } from "./components/InvoiceList";
import "./index.css";

// Create the root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Invoice Manager
            </h1>
            <a
              href="/logout"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Navigation Tabs */}
          <nav className="flex space-x-8 mb-8">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              All Invoices
            </button>
            <button className="text-gray-500 hover:text-gray-700 pb-2">
              Monthly Checklist
            </button>
          </nav>

          <InvoiceList />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});

// Create the index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => null, // Content is in the root route for now
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute]);

// Create the router
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
