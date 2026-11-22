"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

export type MenuOption<T extends string> = { value: T; label: string; description?: string };

type Props<T extends string> = {
  value: T;
  options: MenuOption<T>[];
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  variant?: "outline" | "plain";
  block?: boolean;
  id?: string;
  invalid?: boolean;
};

type Position = { top?: number; bottom?: number; left: number; minWidth: number };

const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 260;
const TYPEAHEAD_RESET_MS = 600;

export default function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
  variant = "outline",
  block,
  id: buttonId,
  invalid,
}: Props<T>) {
  const id = useId();
  const typed = useRef({ text: "", at: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  const place = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const roomBelow = window.innerHeight - rect.bottom;
    const left = Math.min(rect.left, window.innerWidth - Math.max(rect.width, 180) - 8);
    setPosition(
      roomBelow < MENU_MAX_HEIGHT && rect.top > roomBelow
        ? { bottom: window.innerHeight - rect.top + MENU_GAP, left, minWidth: rect.width }
        : { top: rect.bottom + MENU_GAP, left, minWidth: rect.width },
    );
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (open && position && document.activeElement !== listRef.current) {
      listRef.current?.focus({ preventScroll: true });
    }
  }, [open, position]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      const target = event.target as Node;
      if (listRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const follow = (event: Event) => {
      if (listRef.current?.contains(event.target as Node)) return;
      place();
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", follow);
    window.addEventListener("scroll", follow, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", follow);
      window.removeEventListener("scroll", follow, true);
    };
  }, [open, place]);

  function show() {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  function pick(index: number) {
    const option = options[index];
    setOpen(false);
    buttonRef.current?.focus();
    if (option && option.value !== value) onChange(option.value);
  }

  function onButtonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show();
    }
  }

  function onListKey(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(active);
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const text = (now - typed.current.at > TYPEAHEAD_RESET_MS ? "" : typed.current.text) + event.key.toLowerCase();
      typed.current = { text, at: now };
      const match = options.findIndex((option) => option.label.toLowerCase().startsWith(text));
      if (match >= 0) setActive(match);
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        className={`menu-button menu-button-${variant} ${block ? "menu-button-block" : ""} ${value === "" ? "is-placeholder" : ""}`}
        aria-invalid={invalid || undefined}
        aria-label={`${label}: ${current?.label ?? ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKey}
      >
        <span>{current?.label}</span>
        <svg className={`menu-chevron ${open ? "is-open" : ""}`} viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          className="menu-list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-option-${active}`}
          style={position ? { ...position, visibility: "visible" } : { visibility: "hidden" }}
          onKeyDown={onListKey}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={selected}
                className={`menu-option ${index === active ? "is-active" : ""}`}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(index)}
              >
                <span className="menu-option-text">
                  <strong>{option.label}</strong>
                  {option.description && <span>{option.description}</span>}
                </span>
                {selected && (
                  <svg className="menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
