import { createContext, useContext } from "react";

export const SlotRegistryContext = createContext(null);

export const useSlotRegistry = () => {
  const registry = useContext(SlotRegistryContext);
  if (!registry) {
    throw new Error("useSlotRegistry must be used within SlotRegistryContext");
  }
  return registry;
};
