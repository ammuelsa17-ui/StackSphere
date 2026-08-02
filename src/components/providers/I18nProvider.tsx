"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Shield, Mail, Phone, Clock, AlertCircle } from "lucide-react";

export type Language = "en" | "es" | "hi" | "pt" | "zh" | "fr";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    socialSpace: "Social Space",
    dashboard: "Dashboard",
    profile: "Profile",
    subscription: "Subscription",
    login: "Login",
    logout: "Logout",
    register: "Register",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    backToHome: "Back to Home",
    qaForum: "Q&A Forum",
    loginHistory: "Login History",
    settings: "Settings",
    menuNavigation: "Menu Navigation",
    
    // Login
    signInTitle: "Sign In to StackSphere",
    signInSubtitle: "Enter your details below to log into your account",
    emailAddress: "Email Address",
    password: "Password",
    forgotPasswordLink: "Forgot Password?",
    otpCode: "OTP Code",
    signInButton: "Sign In",
    noAccount: "Don't have an account?",
    signUpNow: "Sign Up Now",
    
    // Registration
    signUpTitle: "Create Your Account",
    signUpSubtitle: "Join the developer community today",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    confirmPassword: "Confirm Password",
    signUpButton: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInNow: "Sign In",

    // Forgot Password
    forgotPasswordTitle: "Reset Password",
    forgotPasswordSubtitle: "Recover your account credentials securely",
    sendResetLink: "Send Recovery Code",
    enterOtpCode: "Enter the code sent to your recovery channel",
    verifyOtpButton: "Verify Recovery Code",
    newPasswordLabel: "New Password",
    newPasswordHint: "Generated passwords contain only alphabetical letters",
    resetPasswordBtn: "Reset My Password",
    backToLogin: "Back to Login",

    // Profile & Rewards
    userProfile: "User Profile",
    pointsDashboard: "Points Dashboard",
    totalPoints: "Total Points",
    activeTier: "Current Tier",
    pointsTransfer: "Share Reward Points",
    receiverPlaceholder: "Enter receiver email or name...",
    transferAmount: "Transfer Amount",
    submitTransferBtn: "Confirm Transfer",
    pointsTransferSuccess: "Points transferred successfully!",

    // Subscription
    choosePlan: "Choose Your Plan",
    activePlanLabel: "Active Membership Plan",
    billingHistory: "Billing & Transactions History",
    downloadInvoice: "Download PDF",
    subscribeBtn: "Subscribe Now",
    timeGateWarning: "Subscribing is restricted to 10:00 AM - 11:00 AM IST window.",
  },
  es: {
    socialSpace: "Espacio Social",
    dashboard: "Panel",
    profile: "Perfil",
    subscription: "Suscripción",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    register: "Registrarse",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    backToHome: "Volver al inicio",
    qaForum: "Foro de preguntas y respuestas",
    loginHistory: "Historial de inicio de sesión",
    settings: "Ajustes",
    menuNavigation: "Menú de Navegación",
    
    signInTitle: "Iniciar sesión en StackSphere",
    signInSubtitle: "Ingrese sus datos a continuación para iniciar sesión",
    emailAddress: "Correo Electrónico",
    password: "Contraseña",
    forgotPasswordLink: "¿Olvidó su contraseña?",
    otpCode: "Código OTP",
    signInButton: "Iniciar sesión",
    noAccount: "¿No tienes una cuenta?",
    signUpNow: "Regístrate ahora",

    signUpTitle: "Crea tu Cuenta",
    signUpSubtitle: "Únete a la comunidad de desarrolladores hoy",
    fullName: "Nombre completo",
    phoneNumber: "Número de Teléfono",
    confirmPassword: "Confirmar Contraseña",
    signUpButton: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signInNow: "Inicia Sesión",

    forgotPasswordTitle: "Restablecer Contraseña",
    forgotPasswordSubtitle: "Recupere las credenciales de su cuenta de forma segura",
    sendResetLink: "Enviar Código de Recuperación",
    enterOtpCode: "Ingrese el código enviado a su canal de recuperación",
    verifyOtpButton: "Verificar Código de Recuperación",
    newPasswordLabel: "Nueva Contraseña",
    newPasswordHint: "Las contraseñas generadas contienen solo letras del abecedario",
    resetPasswordBtn: "Restablecer mi Contraseña",
    backToLogin: "Volver al Inicio",

    userProfile: "Perfil de Usuario",
    pointsDashboard: "Panel de Puntos",
    totalPoints: "Puntos Totales",
    activeTier: "Nivel Actual",
    pointsTransfer: "Compartir Puntos de Recompensa",
    receiverPlaceholder: "Ingrese correo o nombre del receptor...",
    transferAmount: "Monto de Transferencia",
    submitTransferBtn: "Confirmar Transferencia",
    pointsTransferSuccess: "¡Puntos transferidos con éxito!",

    choosePlan: "Elige tu Plan",
    activePlanLabel: "Plan de Membresía Activo",
    billingHistory: "Historial de Facturación y Transacciones",
    downloadInvoice: "Descargar PDF",
    subscribeBtn: "Suscribirse Ahora",
    timeGateWarning: "La suscripción está restringida al horario de 10:00 AM - 11:00 AM IST.",
  },
  hi: {
    socialSpace: "सोशल स्पेस",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    subscription: "सदस्यता",
    login: "लॉगिन",
    logout: "लॉगआउट",
    register: "रजिस्टर",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    backToHome: "होमपेज पर वापस",
    qaForum: "प्रश्न और उत्तर मंच",
    loginHistory: "लॉगिन इतिहास",
    settings: "सेटिंग्स",
    menuNavigation: "मेनू नेविगेशन",
    
    signInTitle: "स्टैकस्फीयर में लॉगिन करें",
    signInSubtitle: "अपने खाते में लॉग इन करने के लिए नीचे अपना विवरण दर्ज करें",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    forgotPasswordLink: "पासवर्ड भूल गए?",
    otpCode: "ओटीपी कोड",
    signInButton: "लॉग इन करें",
    noAccount: "खाता नहीं है?",
    signUpNow: "अभी रजिस्टर करें",

    signUpTitle: "अपना खाता बनाएं",
    signUpSubtitle: "आज ही डेवलपर समुदाय में शामिल हों",
    fullName: "पूरा नाम",
    phoneNumber: "फ़ोन नंबर",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    signUpButton: "खाता बनाएं",
    alreadyHaveAccount: "पहले से ही एक खाता है?",
    signInNow: "लॉग इन करें",

    forgotPasswordTitle: "पासवर्ड रीसेट करें",
    forgotPasswordSubtitle: "अपने खाते की साख सुरक्षित रूप से पुनर्प्राप्त करें",
    sendResetLink: "रिकवरी कोड भेजें",
    enterOtpCode: "अपने रिकवरी चैनल पर भेजा गया कोड दर्ज करें",
    verifyOtpButton: "रिकवरी कोड सत्यापित करें",
    newPasswordLabel: "नया पासवर्ड",
    newPasswordHint: "उत्पन्न पासवर्ड में केवल वर्णमाला के अक्षर होते हैं",
    resetPasswordBtn: "मेरा पासवर्ड रीसेट करें",
    backToLogin: "लॉगिन पर लौटें",

    userProfile: "उपयोगकर्ता प्रोफ़ाइल",
    pointsDashboard: "अंक डैशबोर्ड",
    totalPoints: "कुल अंक",
    activeTier: "वर्तमान स्तर",
    pointsTransfer: "इनाम अंक साझा करें",
    receiverPlaceholder: "प्राप्तकर्ता का ईमेल या नाम दर्ज करें...",
    transferAmount: "अन्तरण राशि",
    submitTransferBtn: "स्थानांतरण की पुष्टि करें",
    pointsTransferSuccess: "अंक सफलतापूर्वक स्थानांतरित कर दिए गए!",

    choosePlan: "अपना प्लान चुनें",
    activePlanLabel: "सक्रिय सदस्यता योजना",
    billingHistory: "बिलिंग और लेनदेन इतिहास",
    downloadInvoice: "पीडीएफ डाउनलोड करें",
    subscribeBtn: "अभी सदस्यता लें",
    timeGateWarning: "सदस्यता 10:00 AM - 11:00 AM IST विंडो तक सीमित है।",
  },
  pt: {
    socialSpace: "Espaço Social",
    dashboard: "Painel de Controle",
    profile: "Perfil",
    subscription: "Assinatura",
    login: "Entrar",
    logout: "Sair",
    register: "Registrar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    backToHome: "Voltar ao Início",
    qaForum: "Fórum de Q&A",
    loginHistory: "Histórico de Login",
    settings: "Configurações",
    menuNavigation: "Menu de Navegação",
    
    signInTitle: "Entrar no StackSphere",
    signInSubtitle: "Insira seus dados abaixo para fazer login na sua conta",
    emailAddress: "Endereço de E-mail",
    password: "Senha",
    forgotPasswordLink: "Esqueceu a senha?",
    otpCode: "Código OTP",
    signInButton: "Entrar",
    noAccount: "Não tem uma conta?",
    signUpNow: "Cadastre-se agora",

    signUpTitle: "Crie sua Conta",
    signUpSubtitle: "Junte-se à comunidade de desenvolvedores hoje",
    fullName: "Nome Completo",
    phoneNumber: "Número de Telefone",
    confirmPassword: "Confirmar Senha",
    signUpButton: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    signInNow: "Entrar",

    forgotPasswordTitle: "Redefinir Senha",
    forgotPasswordSubtitle: "Recupere as credenciais da sua conta com segurança",
    sendResetLink: "Enviar Código de Recuperação",
    enterOtpCode: "Insira o código enviado ao seu canal de recuperação",
    verifyOtpButton: "Verificar Código",
    newPasswordLabel: "Nova Senha",
    newPasswordHint: "As senhas geradas contêm apenas letras alfabéticas",
    resetPasswordBtn: "Redefinir Minha Senha",
    backToLogin: "Voltar para Login",

    userProfile: "Perfil do Usuário",
    pointsDashboard: "Painel de Pontos",
    totalPoints: "Total de Pontos",
    activeTier: "Nível Atual",
    pointsTransfer: "Compartilhar Pontos de Recompensa",
    receiverPlaceholder: "Insira e-mail ou nome do destinatário...",
    transferAmount: "Valor de Transferência",
    submitTransferBtn: "Confirmar Transferência",
    pointsTransferSuccess: "Pontos transferidos com sucesso!",

    choosePlan: "Escolha seu Plano",
    activePlanLabel: "Plano de Assinatura Ativo",
    billingHistory: "Histórico de Cobrança e Transações",
    downloadInvoice: "Baixar PDF",
    subscribeBtn: "Assinar Agora",
    timeGateWarning: "A assinatura é restrita ao horário de 10:00 AM - 11:00 AM IST.",
  },
  zh: {
    socialSpace: "社交空间",
    dashboard: "控制面板",
    profile: "个人资料",
    subscription: "订阅计划",
    login: "登录",
    logout: "退出登录",
    register: "注册",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    backToHome: "返回首页",
    qaForum: "问答论坛",
    loginHistory: "登录历史",
    settings: "设置",
    menuNavigation: "菜单导航",
    
    signInTitle: "登录 StackSphere",
    signInSubtitle: "在下方输入您的详细信息以登录您的账户",
    emailAddress: "电子邮箱",
    password: "密码",
    forgotPasswordLink: "忘记密码？",
    otpCode: "OTP 验证码",
    signInButton: "登录",
    noAccount: "还没有账户？",
    signUpNow: "立即注册",

    signUpTitle: "创建您的账户",
    signUpSubtitle: "今天就加入开发者社区",
    fullName: "全名",
    phoneNumber: "电话号码",
    confirmPassword: "确认密码",
    signUpButton: "创建账户",
    alreadyHaveAccount: "已经有账户了？",
    signInNow: "登录",

    forgotPasswordTitle: "重置密码",
    forgotPasswordSubtitle: "安全地恢复您的账户凭证",
    sendResetLink: "发送恢复验证码",
    enterOtpCode: "输入发送到您恢复通道的验证码",
    verifyOtpButton: "验证恢复码",
    newPasswordLabel: "新密码",
    newPasswordHint: "生成的密码仅包含英文字母",
    resetPasswordBtn: "重置我的密码",
    backToLogin: "返回登录",

    userProfile: "用户个人资料",
    pointsDashboard: "积分控制面板",
    totalPoints: "总积分",
    activeTier: "当前等级",
    pointsTransfer: "分享奖励积分",
    receiverPlaceholder: "输入接收者邮箱或姓名...",
    transferAmount: "划转金额",
    submitTransferBtn: "确认划转",
    pointsTransferSuccess: "积分划转成功！",

    choosePlan: "选择您的订阅计划",
    activePlanLabel: "有效会员计划",
    billingHistory: "账单与交易历史",
    downloadInvoice: "下载 PDF",
    subscribeBtn: "立即订阅",
    timeGateWarning: "订阅受限于 10:00 AM - 11:00 AM IST 窗口。",
  },
  fr: {
    socialSpace: "Espace Social",
    dashboard: "Tableau de Bord",
    profile: "Profil",
    subscription: "Abonnement",
    login: "Connexion",
    logout: "Déconnexion",
    register: "S'inscrire",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    backToHome: "Retour à l'Accueil",
    qaForum: "Forum Q&R",
    loginHistory: "Historique de Connexion",
    settings: "Paramètres",
    menuNavigation: "Navigation Menu",
    
    signInTitle: "Se connecter à StackSphere",
    signInSubtitle: "Saisissez vos identifiants pour vous connecter",
    emailAddress: "Adresse E-mail",
    password: "Mot de passe",
    forgotPasswordLink: "Mot de passe oublié ?",
    otpCode: "Code OTP",
    signInButton: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUpNow: "Créer un compte",
    
    signUpTitle: "Créer votre Compte",
    signUpSubtitle: "Rejoignez la communauté de développeurs aujourd'hui",
    fullName: "Nom Complet",
    phoneNumber: "Numéro de Téléphone",
    confirmPassword: "Confirmer le Mot de passe",
    signUpButton: "Créer le Compte",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signInNow: "Se connecter",

    forgotPasswordTitle: "Réinitialiser le Mot de passe",
    forgotPasswordSubtitle: "Récupérez vos identifiants de compte en toute sécurité",
    sendResetLink: "Envoyer le Code de Récupération",
    enterOtpCode: "Saisissez le code envoyé à votre canal de récupération",
    verifyOtpButton: "Vérifier le Code",
    newPasswordLabel: "Nouveau Mot de passe",
    newPasswordHint: "Les mots de passe générés ne contiennent que des lettres de l'alphabet",
    resetPasswordBtn: "Réinitialiser mon Mot de passe",
    backToLogin: "Retour à la Connexion",

    userProfile: "Profil Utilisateur",
    pointsDashboard: "Tableau des Points",
    totalPoints: "Total des Points",
    activeTier: "Niveau Actuel",
    pointsTransfer: "Partager des Points de Récompense",
    receiverPlaceholder: "Entrez l'e-mail ou le nom du destinataire...",
    transferAmount: "Montant du Transfert",
    submitTransferBtn: "Confirmer le Transfert",
    pointsTransferSuccess: "Points transférés avec succès !",

    choosePlan: "Choisissez Votre Formule",
    activePlanLabel: "Formule d'Abonnement Active",
    billingHistory: "Historique de Facturation & Transactions",
    downloadInvoice: "Télécharger le PDF",
    subscribeBtn: "S'abonner Maintenant",
    timeGateWarning: "Les abonnements sont limités au créneau de 10h00 à 11h00 IST.",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>("en");
  const [isVerifying, setIsVerifying] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("stacksphere_lang") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const generateAndDispatchOtp = (targetLang: Language) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    setOtpCode(code);
    setOtpExpiry(expiry);
    setAttemptCount(0);
    setOtpError(null);
    setUserEnteredOtp("");

    const uEmail = session?.user?.email || "developer@stacksphere.com";
    const uPhone = (session?.user as any)?.phoneNumber || "+15551234567";

    if (targetLang === "fr") {
      // Route OTP verification to Email
      console.log(`[SECURE LANGUAGE EMAIL OTP] Sent language switcher verification code "${code}" to email "${uEmail}"`);
    } else {
      // Route OTP verification to Phone/SMS
      console.log(`[SECURE LANGUAGE SMS OTP] Sent language switcher verification code "${code}" via SMS to phone "${uPhone}"`);
    }
  };

  const setLanguage = (lang: Language) => {
    if (lang === language) return;

    // Guest users (not logged in) don't trigger security OTP checks
    if (!session) {
      setLanguageState(lang);
      localStorage.setItem("stacksphere_lang", lang);
      return;
    }

    // Trigger language change OTP verification flow
    setTargetLanguage(lang);
    setIsVerifying(true);
    generateAndDispatchOtp(lang);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpExpiry || otpExpiry.getTime() < Date.now()) {
      setOtpError("The verification code has expired. Please request a new one.");
      return;
    }

    if (attemptCount >= 3) {
      setOtpError("Maximum verification attempts reached. Language change cancelled.");
      setTimeout(() => handleCancel(), 2000);
      return;
    }

    if (userEnteredOtp.trim() === otpCode) {
      if (targetLanguage) {
        setLanguageState(targetLanguage);
        localStorage.setItem("stacksphere_lang", targetLanguage);
      }
      setIsVerifying(false);
      setTargetLanguage(null);
      setOtpError(null);
    } else {
      const nextCount = attemptCount + 1;
      setAttemptCount(nextCount);
      if (nextCount >= 3) {
        setOtpError("Maximum attempts reached. Resetting switcher.");
        setTimeout(() => handleCancel(), 1500);
      } else {
        setOtpError(`Incorrect verification code. (${3 - nextCount} attempts remaining)`);
      }
    }
  };

  const handleResend = () => {
    if (resendTimer > 0 || !targetLanguage) return;
    setResendTimer(60);
    generateAndDispatchOtp(targetLanguage);
  };

  const handleCancel = () => {
    setIsVerifying(false);
    setTargetLanguage(null);
    setOtpError(null);
    setUserEnteredOtp("");
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}

      {/* Global Language Change Security OTP Verification Modal */}
      {isVerifying && targetLanguage && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-full max-w-md rounded-2xl p-6 shadow-xl animate-fadeIn">
            <div className="text-center space-y-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-650 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Security Verification Required
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Confirm your request to change the application language to{" "}
                <strong className="text-indigo-600 dark:text-indigo-400 uppercase">
                  {targetLanguage}
                </strong>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {otpError && (
                <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-250 dark:border-rose-800 text-rose-650 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {targetLanguage === "fr" ? (
                    <>
                      <Mail className="h-4 w-4 text-indigo-650" />
                      <span>Sending OTP code to email: <strong>{session?.user?.email || "developer@stacksphere.com"}</strong></span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 text-indigo-650" />
                      <span>Sending OTP code via SMS to: <strong>{(session?.user as any)?.phoneNumber || "+15551234567"}</strong></span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-450 dark:text-neutral-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Code expires in 5 minutes</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Enter 6-Digit OTP Verification Code
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={userEnteredOtp}
                  onChange={(e) => setUserEnteredOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-lg font-bold tracking-widest text-neutral-850 dark:text-neutral-100 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResend}
                  className="font-bold text-indigo-650 hover:underline disabled:text-neutral-400"
                >
                  {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Verification Code"}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-xl hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 shadow-sm"
                >
                  Confirm Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
