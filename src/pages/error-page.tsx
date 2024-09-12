import { pageWrapperStyles } from "@/styles/common";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRouteError } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ErrorPage() {
  const error = useRouteError() as Error;
  if (error) {
    console.error(error);
  }

  return (
    <div id="error-page">
      <div className={cn(pageWrapperStyles, "space-y-4")}>
        <h1 className="text-2xl">Oops!</h1>
        <div>
          <p>Sorry, an unexpected error has occurred.</p>
          <p>
            <i>{error.message}</i>
          </p>
        </div>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
