import { createContext, useContext, useState } from "react";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";

type AlertProps = {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  actions: {
    label: string;
    onClick?: () => void;
    variant?: "cancel" | "action" | "destructive";
    disabled?: boolean;
    loading?: boolean;
  }[];
};

function AlertButton({
  label,
  onClick,
  disabled,
  variant,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "cancel" | "action" | "destructive";
}) {
  if (variant === "cancel") {
    return (
      <AlertDialogCancel disabled={disabled} onClick={onClick}>
        {label}
      </AlertDialogCancel>
    );
  }
  if (variant === "destructive") {
    return (
      <AlertDialogAction
        disabled={disabled}
        onClick={onClick}
        className="bg-red-600 hover:bg-red-700"
      >
        {label}
      </AlertDialogAction>
    );
  }
  return (
    <AlertDialogAction disabled={disabled} onClick={onClick}>
      {label}
    </AlertDialogAction>
  );
}

function Alert({
  isOpen,
  onOpenChange,
  title,
  description,
  actions,
}: AlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {actions.map((action, index) => (
            <AlertButton key={index} {...action} />
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// context provider
type AlertContextType = {
  isOpen: boolean;
  openAlert: ({
    title,
    description,
    actions,
  }: Omit<AlertProps, "isOpen" | "onOpenChange">) => void;
  closeAlert: () => void;
};
const AlertContext = createContext<AlertContextType>({
  isOpen: false,
  openAlert: () => {},
  closeAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, onOpenChange] = useState(false);
  const [state, setState] = useState<
    Omit<AlertProps, "isOpen" | "onOpenChange">
  >({
    title: "",
    description: "",
    actions: [],
  });
  return (
    <AlertContext.Provider
      value={{
        isOpen,
        openAlert: (props) => {
          onOpenChange(false);
          setState(props);
          onOpenChange(true);
        },
        closeAlert: () => onOpenChange(false),
      }}
    >
      <Alert isOpen={isOpen} onOpenChange={onOpenChange} {...state} />
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
