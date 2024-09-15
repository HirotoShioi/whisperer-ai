import { Loader2 } from "lucide-react";

export type FullPageLoaderProps = {
  label?: string;
};

export const FullPageLoader = ({ label }: FullPageLoaderProps) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin" />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
};
