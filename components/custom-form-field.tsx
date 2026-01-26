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
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

enum FormFieldType {
  INPUT = "input",
  CHECKBOX = "checkbox",
  SELECT = "select",
  TEXTAREA = "textarea",
}

interface SelectOption {
  label: string;
  value: string;
  badges?: string[];
  cost?: number;
  badgeColors?: Record<string, string>;
}

interface CustomFormFieldProps {
  control: Control<any>;
  fieldType: FormFieldType;
  inputType?: "text" | "email" | "password" | "number" | "url" | "tel";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  showPasswordStrength?: boolean;
  selectOptions?: SelectOption[];
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
          <SelectContent>
            {props.selectOptions?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                textValue={option.label}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.cost !== undefined && (
                      <span className="select-dropdown-only text-xs text-muted-foreground">
                        ${option.cost.toFixed(3)} /min
                      </span>
                    )}
                  </div>
                  {option.badges && option.badges.length > 0 && (
                    <div className="select-dropdown-only flex flex-wrap gap-1">
                      {option.badges.map((badge, i) => {
                        let className = "text-xs px-1.5 py-0";

                        // Apply color based on badgeColors mapping
                        if (option.badgeColors && option.badgeColors[badge]) {
                          const color = option.badgeColors[badge];
                          switch (color) {
                            case "green":
                              className =
                                "text-xs px-1.5 py-0 bg-green-500/10 text-green-700 border-green-200";
                              break;
                            case "purple":
                              className =
                                "text-xs px-1.5 py-0 bg-purple-500/10 text-purple-700 border-purple-200";
                              break;
                            case "orange":
                              className =
                                "text-xs px-1.5 py-0 bg-orange-500/10 text-orange-700 border-orange-200";
                              break;
                            case "blue":
                              className =
                                "text-xs px-1.5 py-0 bg-blue-500/10 text-blue-700 border-blue-200";
                              break;
                          }
                        }

                        return (
                          <Badge
                            key={i}
                            variant={
                              option.badgeColors ? "outline" : "secondary"
                            }
                            className={className}
                          >
                            {badge}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
            {props.children}
          </SelectContent>
        </Select>
      );

    case FormFieldType.TEXTAREA:
      return (
        <Textarea
          placeholder={props.placeholder}
          className={props.className}
          disabled={props.disabled}
          {...field}
        />
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
            <Check className="text-green-600" size={16} />
          ) : (
            <X className="text-gray-400" size={16} />
          )}
          <span className={cn(req.met ? "text-green-600" : "text-gray-600 ")}>
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
