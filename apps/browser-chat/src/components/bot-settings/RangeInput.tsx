import React, { useState, useEffect } from "react";

const RangeInput: React.FC<{
  label: string;
  value: number;
  helperText?: string;
  min: number;
  max: number;
  step: number;
}> = (props) => {
  const [value, setValue] = useState<number>(props.value);

  function updateRangeSliders() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.style.backgroundSize = `${
        ((Number(input.value) - Number(input.min)) * 100) /
        (Number(input.max) - Number(input.min))
      }% 100%`;
    });
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    updateRangeSliders();
  };

  useEffect(() => {
    updateRangeSliders();
  }, []);

  return (
    <div className="relative pt-1">
      <ul className="w-full">
        <label className="form-label block-block">{props.label}</label>
        <input
          className="float-right w-36 inline-block border border-[#7957D2] rounded-md outline-none bg-transparent"
          value={value}
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          onInput={onInput}
        />
      </ul>
      {props.helperText ? (
        <p className="mt-[-0.125rem] pb-2 text-sm text-gray-500">
          {props.helperText}
        </p>
      ) : null}
      <input
        type="range"
        className="
        h-1
        w-full
        cursor-ew-resize
        appearance-none
        rounded-xl
        focus:shadow-none focus:outline-none focus:ring-0
      "
        min={props.min}
        max={props.max}
        step={props.step}
        onInput={onInput}
        value={value}
      />
    </div>
  );
};

export default RangeInput;
