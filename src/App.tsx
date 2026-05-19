import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
