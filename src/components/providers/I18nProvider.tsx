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

    // Q&A & Social & Notifications
    questionsTitle: "Questions & Community Discussion",
    askQuestionBtn: "Ask Question",
    postComposerTitle: "Create New Post",
    postPlaceholder: "Share an update, snippet, or code thought...",
    attachMedia: "Attach Photo or Video",
    postButton: "Post Update",
    friendRequestsTitle: "Friend Requests",
    acceptBtn: "Accept",
    rejectBtn: "Decline",
    notificationsTitle: "Notifications",
    markAllReadBtn: "Mark all read",
    noNotifications: "No notifications yet",

    // Final UI Cleanup Keys
    fullNameLabel: "Full Name",
    viewSecurityLogs: "View Security Logs",
    verifiedLabel: "Verified",
    transferConfirmMsg: "Are you sure you want to transfer points?",
    secureCheckout: "Secure Checkout",
    dateHeader: "Date",
    statusHeader: "Status",
    limitReached: "(Limit Reached)",
    requestsTab: "Requests",
    addBtn: "Add",
    loadMorePosts: "Load More Posts",
    footerCopyright: "© 2026 StackSphere. All Rights Reserved.",
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

    questionsTitle: "Preguntas y Discusión de la Comunidad",
    askQuestionBtn: "Hacer Pregunta",
    postComposerTitle: "Crear Nueva Publicación",
    postPlaceholder: "Comparte una actualización, fragmento o idea de código...",
    attachMedia: "Adjuntar Foto o Video",
    postButton: "Publicar",
    friendRequestsTitle: "Solicitudes de Amistad",
    acceptBtn: "Aceptar",
    rejectBtn: "Rechazar",
    notificationsTitle: "Notificaciones",
    markAllReadBtn: "Marcar todas como leídas",
    noNotifications: "Aún no hay notificaciones",

    fullNameLabel: "Nombre completo",
    viewSecurityLogs: "Ver registros de seguridad",
    verifiedLabel: "Verificado",
    transferConfirmMsg: "¿Está seguro de que desea transferir puntos?",
    secureCheckout: "Pago seguro",
    dateHeader: "Fecha",
    statusHeader: "Estado",
    limitReached: "(Límite alcanzado)",
    requestsTab: "Solicitudes",
    addBtn: "Agregar",
    loadMorePosts: "Cargar más publicaciones",
    footerCopyright: "© 2026 StackSphere. Todos los derechos reservados.",
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
    dashboard: "Tableau de bord",
    profile: "Profil",
    subscription: "Abonnement",
    login: "Connexion",
    logout: "Déconnexion",
    register: "S'inscrire",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    backToHome: "Retour à l'accueil",
    qaForum: "Forum Questions & Réponses",
    loginHistory: "Historique de connexion",
    settings: "Paramètres",
    menuNavigation: "Menu de navigation",

    signInTitle: "Connexion à StackSphere",
    signInSubtitle: "Entrez vos identifiants ci-dessous",
    emailAddress: "Adresse E-mail",
    password: "Mot de passe",
    forgotPasswordLink: "Mot de passe oublié ?",
    otpCode: "Code OTP",
    signInButton: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUpNow: "S'inscrire maintenant",

    signUpTitle: "Créer votre compte",
    signUpSubtitle: "Rejoignez la communauté de développeurs",
    fullName: "Nom complet",
    phoneNumber: "Numéro de téléphone",
    confirmPassword: "Confirmer le mot de passe",
    signUpButton: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ?",
    signInNow: "Se connecter",

    forgotPasswordTitle: "Réinitialiser le mot de passe",
    forgotPasswordSubtitle: "Récupérez vos identifiants en toute sécurité",
    sendResetLink: "Envoyer le code de récupération",
    enterOtpCode: "Entrez le code reçu",
    verifyOtpButton: "Vérifier le code",
    newPasswordLabel: "Nouveau mot de passe",
    newPasswordHint: "Les mots de passe générés contiennent uniquement des lettres",
    resetPasswordBtn: "Réinitialiser mon mot de passe",
    backToLogin: "Retour à la connexion",

    userProfile: "Profil Utilisateur",
    pointsDashboard: "Tableau des Points",
    totalPoints: "Total des Points",
    activeTier: "Niveau Actuel",
    pointsTransfer: "Transférer des Points de Récompense",
    receiverPlaceholder: "Entrez l'email du destinataire...",
    transferAmount: "Montant du Transfert",
    submitTransferBtn: "Confirmer le Transfert",
    pointsTransferSuccess: "Points transférés avec succès !",

    choosePlan: "Choisissez votre Forfait",
    activePlanLabel: "Forfait d'Abonnement Actif",
    billingHistory: "Historique de Facturation",
    downloadInvoice: "Télécharger la Facture PDF",
    subscribeBtn: "S'abonner Maintenant",
    timeGateWarning: "Les abonnements sont limités au créneau de 10h00 à 11h00 IST.",

    topQuestions: "Meilleures Questions",
    askQuestion: "Poser une Question",
    searchQuestions: "Rechercher des questions...",
    answersTitle: "Réponses",
    yourAnswerLabel: "Votre Réponse",
    submitAnswerBtn: "Soumettre la Réponse",
    upvote: "Voter pour",
    downvote: "Voter contre",
    createPostTitle: "Créer une Publication",
    sharePlaceholder: "Partagez vos idées ou téléchargez des fichiers...",
    postBtn: "Publier",
    friendsList: "Liste d'Amis",
    acceptRequest: "Accepter",
    rejectRequest: "Refuser",
    memberSince: "Membre depuis",
    editProfileBtn: "Modifier le Profil",
    securityLogTitle: "Journal d'Audit de Sécurité",
    browserCol: "Navigateur",
    ipAddressCol: "Adresse IP",
    deviceCol: "Type d'Appareil",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>("en");
  const [isVerifying, setIsVerifying] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  
  const [resendTimer, setResendTimer] = useState(0);
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
  const requestLanguageOtp = async (lang: Language): Promise<boolean> => {
    try {
      setOtpError(null);
      const res = await fetch("/api/user/language-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to request verification code.");
        return false;
      }
      setResendTimer(data.resendCooldown || 60);
      return true;
    } catch (err: any) {
      setOtpError(err.message || "Failed to contact verification server.");
      return false;
    }
  };

  const setLanguage = async (lang: Language) => {
    if (lang === language) return;

    if (!session) {
      setLanguageState(lang);
      localStorage.setItem("stacksphere_lang", lang);
      return;
    }

    setTargetLanguage(lang);
    setUserEnteredOtp("");
    const ok = await requestLanguageOtp(lang);
    if (ok) {
      setIsVerifying(true);
    } else {
      setIsVerifying(true);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEnteredOtp.trim()) return;

    try {
      setOtpError(null);
      const res = await fetch("/api/user/language-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userEnteredOtp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Verification failed.");
        return;
      }

      if (data.success && data.language) {
        setLanguageState(data.language as Language);
        localStorage.setItem("stacksphere_lang", data.language);
        setIsVerifying(false);
        setTargetLanguage(null);
        setUserEnteredOtp("");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify verification code.");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !targetLanguage) return;
    await requestLanguageOtp(targetLanguage);
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
