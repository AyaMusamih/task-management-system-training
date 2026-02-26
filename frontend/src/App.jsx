import { useState } from "react";
import Button from "./components/shared/Button";
import Input from "./components/shared/Input";
import Modal from "./components/shared/Modal";

function App() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col gap-6 w-full max-w-md">

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={() => setOpen(true)}>Open Modal</Button>

        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <h2 className="text-xl font-bold mb-2">Modal</h2>
          <p className="text-gray-500 text-sm mb-6">Choose Cancel or Confirm.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;