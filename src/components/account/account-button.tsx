import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./account-form.module.css";

type Variant = "primary" | "secondary" | "outline" | "danger";
type Size = "md" | "sm" | "lg";

interface AccountButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  outline: styles.btnOutline,
  danger: styles.btnDanger,
};

const SIZE_CLASS: Record<Size, string> = {
  md: "",
  sm: styles.btnSm,
  lg: styles.btnLg,
};

/** The three button looks used on the Account page. */
export const AccountButton = forwardRef<HTMLButtonElement, AccountButtonProps>(
  function AccountButton(
    { variant = "primary", size = "md", type = "button", className, ...props },
    ref
  ) {
    const classes = [
      styles.btn,
      VARIANT_CLASS[variant],
      SIZE_CLASS[size],
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={classes} {...props} />;
  }
);
