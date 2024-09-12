import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div id="not-found-page">
      <div className={cn(pageWrapperStyles, "space-y-4")}>
        <h1 className="text-2xl">404</h1>
        <div>
          <p>Sorry, the page you are looking for does not exist.</p>
        </div>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
