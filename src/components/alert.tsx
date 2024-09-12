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
    variant?: "cancel" | "action";
    disabled?: boolean;
    loading?: boolean;
  }[];
};
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
          {actions.map((action, index) =>
            action.variant === "cancel" ? (
              <AlertDialogCancel key={index} onClick={action.onClick}>
                {action.label}
              </AlertDialogCancel>
            ) : (
              <AlertDialogAction key={index} onClick={action.onClick}>
                {action.label}
              </AlertDialogAction>
            )
          )}
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
