import { FullPageLoader } from "@/components/fulll-page-loader";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  redirect,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export function loader(arg: LoaderFunctionArgs) {
  const params = arg.params;
  if (params.error || !params.code) {
    return redirect("/");
  }
  return null;
}

export default function Callback() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate, params]);
  return <FullPageLoader label={t("callback.redirecting")} />;
}
