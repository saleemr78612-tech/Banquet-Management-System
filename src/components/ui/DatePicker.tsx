import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "./Input";

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  return <Input ref={ref} type="date" {...props} />;
});
DatePicker.displayName = "DatePicker";
