"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

    choosePlan: "选择您的订阅计划",
    activePlanLabel: "有效会员计划",
    billingHistory: "账单与交易历史",
    downloadInvoice: "下载 PDF",
    subscribeBtn: "立即订阅",
    timeGateWarning: "订阅受限于 10:00 AM - 11:00 AM IST 窗口。",
  },
  fr: {
    // Nav & Common
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
    
    // Login
    signInTitle: "Se connecter à StackSphere",
    signInSubtitle: "Saisissez vos identifiants pour vous connecter",
    emailAddress: "Adresse E-mail",
    password: "Mot de passe",
    forgotPasswordLink: "Mot de passe oublié ?",
    otpCode: "Code OTP",
    signInButton: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUpNow: "Créer un compte",
    
    // Registration
    signUpTitle: "Créer votre Compte",
    signUpSubtitle: "Rejoignez la communauté de développeurs aujourd'hui",
    fullName: "Nom Complet",
    phoneNumber: "Numéro de Téléphone",
    confirmPassword: "Confirmer le Mot de passe",
    signUpButton: "Créer le Compte",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signInNow: "Se connecter",

    // Forgot Password
    forgotPasswordTitle: "Réinitialiser le Mot de passe",
    forgotPasswordSubtitle: "Récupérez vos identifiants de compte en toute sécurité",
    sendResetLink: "Envoyer le Code de Récupération",
    enterOtpCode: "Saisissez le code envoyé à votre canal de récupération",
    verifyOtpButton: "Vérifier le Code",
    newPasswordLabel: "Nouveau Mot de passe",
    newPasswordHint: "Les mots de passe générés ne contiennent que des lettres de l'alphabet",
    resetPasswordBtn: "Réinitialiser mon Mot de passe",
    backToLogin: "Retour à la Connexion",

    // Profile & Rewards
    userProfile: "Profil Utilisateur",
    pointsDashboard: "Tableau des Points",
    totalPoints: "Total des Points",
    activeTier: "Niveau Actuel",
    pointsTransfer: "Partager des Points de Récompense",
    receiverPlaceholder: "Entrez l'e-mail ou le nom du destinataire...",
    transferAmount: "Montant du Transfert",
    submitTransferBtn: "Confirmer le Transfert",

    // Subscription
    choosePlan: "Choisissez Votre Formule",
    activePlanLabel: "Formule d'Abonnement Active",
    billingHistory: "Historique de Facturation & Transactions",
    downloadInvoice: "Télécharger le PDF",
    subscribeBtn: "S'abonner Maintenant",
    timeGateWarning: "Les abonnements sont limités au créneau de 10h00 à 11h00 IST.",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("stacksphere_lang") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("stacksphere_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  // Prevent flash or hydration error: render children normally once mounted
  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
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
