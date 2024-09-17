import { useNavigate } from "react-router-dom";

export function Logo() {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => navigate("/")}
    >
      <h1 className="text-2xl font-bold">Whisperer</h1>
    </div>
  );
}
