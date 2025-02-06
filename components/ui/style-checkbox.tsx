import { useState } from "react";

const StyledCheckbox = ({ onChange, label }: { onChange?: (checked: boolean) => void, label:string }) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={handleChange}
      />
      <div
        className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-all duration-200 ${
          checked ? "bg-black" : "bg-white"
        }`}
      >
        {checked && <span className="text-white">✓</span>}
      </div>
      <span className="ml-2 text-white">{label}</span>
    </label>
  );
};

export default StyledCheckbox;
