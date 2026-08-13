import React from "react";
import { Select } from "../ui/Select";

interface LLMFilterProps {
  providers: string[];
  selectedProvider: string | undefined;
  onChange: (provider: string | undefined) => void;
}

export const LLMFilter: React.FC<LLMFilterProps> = ({ providers, selectedProvider, onChange }) => {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value === "All" ? undefined : value);
  };

  return (
    <div className="mb-4">
      <Select
        value={selectedProvider ?? "All"}
        onChange={handleSelect}
        className="bold-large"
      >
        <option value="All">All Providers</option>
        {providers.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
    </div>
  );
};
