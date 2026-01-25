"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

enum FormFieldType {
  INPUT = "input",
  CHECKBOX = "checkbox",
  SELECT = "select",
}

interface CustomFormFieldProps {
  control: Control<any>;
  fieldType: FormFieldType;
  inputType?: "text" | "email" | "password" | "number" | "url";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  showPasswordStrength?: boolean;
}

const RenderField = ({
  props,
  field,
}: {
  props: CustomFormFieldProps;
  field: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      const isPassword = props.inputType === "password";

      return (
        <div className="relative">
          <Input
            placeholder={props.placeholder}
            type={isPassword && showPassword ? "text" : props.inputType}
            className={cn(isPassword && "pr-10", props.className)}
            disabled={props.disabled}
            {...field}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      );

    case FormFieldType.SELECT:
      return (
        <Select
          onValueChange={field.onChange}
          value={field.value}
          disabled={props.disabled}
        >
          <SelectTrigger className={props.className}>
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>{props.children}</SelectContent>
        </Select>
      );

    default:
      return null;
  }
};

// Password requirements checker
const checkPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
};

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const checks = checkPasswordRequirements(password);

  if (!password) return null;

  const requirements = [
    { key: "length", label: "At least 8 characters", met: checks.length },
    { key: "uppercase", label: "One uppercase letter", met: checks.uppercase },
    { key: "lowercase", label: "One lowercase letter", met: checks.lowercase },
    { key: "number", label: "One number", met: checks.number },
  ];

  return (
    <div className="space-y-2 mt-2">
      {requirements.map((req) => (
        <div key={req.key} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <svg
              className="h-4 w-4 text-green-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-gray-400 dark:text-gray-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span
            className={cn(
              req.met
                ? "text-green-600 dark:text-green-500"
                : "text-gray-600 dark:text-gray-400",
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomFormField = (props: CustomFormFieldProps) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          {props.fieldType != FormFieldType.CHECKBOX && props.label && (
            <FormLabel>{props.label}</FormLabel>
          )}
          <FormControl>
            <RenderField props={props} field={field} />
          </FormControl>
          {props.showPasswordStrength && props.inputType === "password" && (
            <PasswordStrengthIndicator password={field.value} />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { CustomFormField, FormFieldType };
