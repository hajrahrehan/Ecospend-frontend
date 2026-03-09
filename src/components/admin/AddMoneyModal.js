import React, { useState } from "react";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import * as ApiManager from "../../helpers/ApiManager.tsx";
function AddMoneyModal({ userId, Reset }) {
  const [amount, setamount] = useState("0");
  const [APIWorking, setAPIWorking] = useState(false);
  return (
    <div>
      <Input
        placeholder="Rs. 1000"
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setamount(e.target.value)}
      />
      <Button
        className="mt-4"
        onClick={async () => {
          try {
            if (APIWorking) return;
            setAPIWorking(true);
            const res = await ApiManager.AdminAddMoney(userId, {
              amount: Number(amount),
            });
            if (res) {
              toast.success(`Money added successfully`);
              Reset();
            }
            setAPIWorking(false);
          } catch (e) {
            setAPIWorking(false);
            toast.error(`${e.message}`);
          }
        }}
        disabled={APIWorking}
      >
        {!APIWorking ? "Add Money" : "Adding..."}
      </Button>
    </div>
  );
}

export default AddMoneyModal;
