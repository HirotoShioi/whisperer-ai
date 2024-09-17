import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import Header from "@/components/header";
import { useTranslation } from "react-i18next";
import { translations } from "@aws-amplify/ui-react";

import { I18n } from "aws-amplify/utils";
export default function SignInPage() {
  const { user } = useAuthenticator((c) => [c.user]);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);
  const { i18n } = useTranslation();
  I18n.putVocabularies(translations);
  I18n.setLanguage(i18n.language);
  I18n.putVocabularies({
    ja: {
      "Enter your Password": "パスワードを入力してください",
      "Sign in": "ログイン",
      "Signing in": "ログイン中",
      Password: "パスワード",
      "Sign Up with Google": "Googleでサインアップ",
      "Enter your Username": "ユーザーIDを入力してください",
      "Incorrect username or password.": "ユーザー名かパスワードが異なります。",
      "User does not exist.": "ユーザーが存在しません。",
      "Username/client id combination not found.": "ユーザーが存在しません。",
      "User password cannot be reset in the current state.":
        "パスワードのリセットは現在の状態ではできません。",
      "Change Password": "パスワード変更",
      "Your passwords must match": "パスワードが一致しません",
      "Attempt limit exceeded, please try after some time.":
        "試行回数が超過しました。時間をおいて再度お試しください。",
      "Password must have at least 8 characters":
        "パスワードは8文字以上で入力してください",
      "Password must have upper case letters":
        "パスワードは大文字を1文字以上含めてください",
      "Password must have numbers": "パスワードは数字を1文字以上含めてください",
      "Create Account": "アカウント作成",
      "Enter your email": "メールアドレスを入力してください",
    },
  });
  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Authenticator />
      </div>
    </div>
  );
}
