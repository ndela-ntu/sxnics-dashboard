import { useEffect, useState } from "react";

const StyledCheckbox = ({
  initChecked,
  checked,
  onChange,
  label,
  name,
}: {
  initChecked?: boolean;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  name: string;
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        name={name}
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.checked);
          }
        }}
      />
      <div
        className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-all duration-200 ${
          checked ? "bg-black border-2 border-white" : "bg-white"
        }`}
      >
        {checked && <span className="text-white">✓</span>}
      </div>
      <span className="ml-2 text-white">{label}</span>
    </label>
  );
};

export default StyledCheckbox;
