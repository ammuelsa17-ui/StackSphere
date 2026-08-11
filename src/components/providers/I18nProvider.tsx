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
    homeOverview: "Home Overview",
    qaCommunity: "Q&A Community",
    socialSpacePreview: "Social Space Preview",
    plansPricing: "Plans & Pricing",
    rewardsSystem: "Rewards System",
    platformFeatures: "Platform Features",
    signIn: "Sign In",
    createAccount: "Create Account",
    explorePlatform: "EXPLORE PLATFORM",
    getStarted: "GET STARTED",
    general: "GENERAL",
    qaForumGroup: "Q&A FORUM",
    socialSpaceGroup: "SOCIAL SPACE",
    rewardsGroup: "REWARDS",
    membershipGroup: "MEMBERSHIP",
    accountSecurityGroup: "ACCOUNT & SECURITY",
    askQuestion: "Ask Question",
    myQuestions: "My Questions",
    friendsNetwork: "Friends & Network",
    myReputationPoints: "My Reputation Points",
    transferPoints: "Transfer Points",
    developerEcosystem: "Developer Ecosystem Platform",
    menu: "Menu",
    navigationMenu: "Navigation Menu",
    
    // Auth & Registration
    signInTitle: "Sign In to StackSphere",
    signInSubtitle: "Enter your details below to log into your account",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPasswordLink: "Forgot Password?",
    otpCode: "OTP Code",
    signInButton: "Sign In",
    noAccount: "Don't have an account?",
    signUpNow: "Sign Up Now",
    signUpTitle: "Create Your Account",
    signUpSubtitle: "Join the developer community today",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    signUpButton: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInNow: "Sign In",
    sendOtpCode: "Send OTP Code",
    verificationCode: "Verification Code",
    verify: "Verify",
    phoneVerified: "Phone number verified ✓",
    readyForSignup: "Ready for signup",

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

    // Profile & Settings & Danger Zone
    userProfile: "User Profile",
    pointsDashboard: "Points Dashboard",
    totalPoints: "Total Points",
    activeTier: "Current Tier",
    pointsTransfer: "Share Reward Points",
    receiverPlaceholder: "Enter receiver email or name...",
    transferAmount: "Transfer Amount",
    submitTransferBtn: "Confirm Transfer",
    pointsTransferSuccess: "Points transferred successfully!",
    dangerZoneTitle: "Danger Zone",
    deleteAccountTitle: "Delete Account",
    deleteAccountDesc: "Permanently remove your account and all associated private data. This action cannot be undone.",
    deleteAccountBtn: "Delete My Account",
    typeDeleteToConfirm: "Type DELETE to confirm",
    enterPasswordToDelete: "Enter your account password to confirm deletion:",
    languagePreference: "Language Preference",
    selectLanguage: "Select Application Language",

    // Subscription & Pricing
    choosePlan: "Choose Your Plan",
    activePlanLabel: "Active Membership Plan",
    billingHistory: "Billing & Transactions History",
    downloadInvoice: "Download PDF",
    subscribeBtn: "Subscribe Now",
    freePlanTitle: "Free Tier",
    proPlanTitle: "Pro Membership",
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

    // Login History
    loginHistoryTitle: "Login Security & Audit Logs",
    loginHistorySubtitle: "Track active sessions, browser metadata, IP addresses, and device security history.",
    browserCol: "Browser",
    osCol: "Operating System",
    ipCol: "IP Address",
    deviceCol: "Device Type",
    timeCol: "Session Time",
    statusCol: "Status",

    // UI Cleanup
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
    homeOverview: "Inicio",
    qaCommunity: "Comunidad Q&A",
    socialSpacePreview: "Vista de Espacio Social",
    plansPricing: "Planes y Precios",
    rewardsSystem: "Sistema de Recompensas",
    platformFeatures: "Características",
    signIn: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    explorePlatform: "EXPLORAR PLATAFORMA",
    getStarted: "COMENZAR",
    general: "GENERAL",
    qaForumGroup: "FORO Q&A",
    socialSpaceGroup: "ESPACIO SOCIAL",
    rewardsGroup: "RECOMPENSAS",
    membershipGroup: "MEMBRESÍA",
    accountSecurityGroup: "CUENTA Y SEGURIDAD",
    askQuestion: "Hacer Pregunta",
    myQuestions: "Mis Preguntas",
    friendsNetwork: "Amigos y Red",
    myReputationPoints: "Mis Puntos de Reputación",
    transferPoints: "Transferir Puntos",
    developerEcosystem: "Plataforma para Desarrolladores",
    menu: "Menú",
    navigationMenu: "Menú de Navegación",
    
    signInTitle: "Iniciar sesión en StackSphere",
    signInSubtitle: "Ingrese sus datos a continuación para iniciar sesión",
    emailAddress: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    forgotPasswordLink: "¿Olvidó su contraseña?",
    otpCode: "Código OTP",
    signInButton: "Iniciar sesión",
    noAccount: "¿No tienes una cuenta?",
    signUpNow: "Regístrate ahora",
    signUpTitle: "Crea tu Cuenta",
    signUpSubtitle: "Únete a la comunidad de desarrolladores hoy",
    fullName: "Nombre completo",
    phoneNumber: "Número de Teléfono",
    signUpButton: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signInNow: "Inicia Sesión",
    sendOtpCode: "Enviar Código OTP",
    verificationCode: "Código de Verificación",
    verify: "Verificar",
    phoneVerified: "Número de teléfono verificado ✓",
    readyForSignup: "Listo para registrarse",

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
    dangerZoneTitle: "Zona de Peligro",
    deleteAccountTitle: "Eliminar Cuenta",
    deleteAccountDesc: "Elimine permanentemente su cuenta y todos los datos privados asociados.",
    deleteAccountBtn: "Eliminar mi Cuenta",
    typeDeleteToConfirm: "Escriba DELETE para confirmar",
    enterPasswordToDelete: "Ingrese su contraseña para confirmar la eliminación:",
    languagePreference: "Preferencia de Idioma",
    selectLanguage: "Seleccionar Idioma de la Aplicación",

    choosePlan: "Elige tu Plan",
    activePlanLabel: "Plan de Membresía Activo",
    billingHistory: "Historial de Facturación y Transacciones",
    downloadInvoice: "Descargar PDF",
    subscribeBtn: "Suscribirse Ahora",
    freePlanTitle: "Plan Gratuito",
    proPlanTitle: "Membresía Pro",
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

    loginHistoryTitle: "Seguridad de Inicio de Sesión y Registros",
    loginHistorySubtitle: "Rastree sesiones activas, metadatos del navegador e IP.",
    browserCol: "Navegador",
    osCol: "Sistema Operativo",
    ipCol: "Dirección IP",
    deviceCol: "Dispositivo",
    timeCol: "Hora",
    statusCol: "Estado",

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
    homeOverview: "होम अवलोकन",
    qaCommunity: "Q&A समुदाय",
    socialSpacePreview: "सोशल स्पेस पूर्वावलोकन",
    plansPricing: "योजनाएं और मूल्य निर्धारण",
    rewardsSystem: "पुरस्कार प्रणाली",
    platformFeatures: "प्लेटफ़ॉर्म विशेषताएं",
    signIn: "साइन इन करें",
    createAccount: "खाता बनाएं",
    explorePlatform: "प्लेटफ़ॉर्म एक्सप्लोर करें",
    getStarted: "प्रारंभ करें",
    general: "सामान्य",
    qaForumGroup: "Q&A फ़ोरम",
    socialSpaceGroup: "सोशल स्पेस",
    rewardsGroup: "पुरस्कार",
    membershipGroup: "सदस्यता",
    accountSecurityGroup: "खाता और सुरक्षा",
    askQuestion: "प्रश्न पूछें",
    myQuestions: "मेरे प्रश्न",
    friendsNetwork: "मित्र और नेटवर्क",
    myReputationPoints: "मेरे प्रतिष्ठा अंक",
    transferPoints: "अंक स्थानांतरित करें",
    developerEcosystem: "डेवलपर इकोसिस्टम प्लेटफॉर्म",
    menu: "मेनू",
    navigationMenu: "नेविगेशन मेनू",
    
    signInTitle: "स्टैकस्फीयर में लॉगिन करें",
    signInSubtitle: "अपने खाते में लॉग इन करने के लिए नीचे अपना विवरण दर्ज करें",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    forgotPasswordLink: "पासवर्ड भूल गए?",
    otpCode: "ओटीपी कोड",
    signInButton: "लॉग इन करें",
    noAccount: "खाता नहीं है?",
    signUpNow: "अभी रजिस्टर करें",
    signUpTitle: "अपना खाता बनाएं",
    signUpSubtitle: "आज ही डेवलपर समुदाय में शामिल हों",
    fullName: "पूरा नाम",
    phoneNumber: "फ़ोन नंबर",
    signUpButton: "खाता बनाएं",
    alreadyHaveAccount: "पहले से ही एक खाता है?",
    signInNow: "लॉग इन करें",
    sendOtpCode: "ओटीपी कोड भेजें",
    verificationCode: "सत्यापन कोड",
    verify: "सत्यापित करें",
    phoneVerified: "फ़ोन नंबर सत्यापित ✓",
    readyForSignup: "साइनअप के लिए तैयार",

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
    dangerZoneTitle: "खतरा क्षेत्र",
    deleteAccountTitle: "खाता हटाएं",
    deleteAccountDesc: "अपने खाते और सभी डेटा को स्थायी रूप से हटाएं।",
    deleteAccountBtn: "मेरा खाता हटाएं",
    typeDeleteToConfirm: "पुष्टि के लिए DELETE टाइप करें",
    enterPasswordToDelete: "हटाने की पुष्टि करने के लिए पासवर्ड दर्ज करें:",
    languagePreference: "भाषा प्राथमिकता",
    selectLanguage: "एप्लिकेशन भाषा चुनें",

    choosePlan: "अपना प्लान चुनें",
    activePlanLabel: "सक्रिय सदस्यता योजना",
    billingHistory: "बिलिंग और लेनदेन इतिहास",
    downloadInvoice: "पीडीएफ डाउनलोड करें",
    subscribeBtn: "अभी सदस्यता लें",
    freePlanTitle: "मुफ्त योजना",
    proPlanTitle: "प्रो सदस्यता",
    timeGateWarning: "सदस्यता 10:00 AM - 11:00 AM IST विंडो तक सीमित है।",

    questionsTitle: "प्रश्न और समुदाय चर्चा",
    askQuestionBtn: "प्रश्न पूछें",
    postComposerTitle: "नई पोस्ट बनाएं",
    postPlaceholder: "कोई अपडेट या विचार साझा करें...",
    attachMedia: "फोटो या वीडियो संलग्न करें",
    postButton: "पोस्ट प्रकाशित करें",
    friendRequestsTitle: "मित्र अनुरोध",
    acceptBtn: "स्वीकार करें",
    rejectBtn: "अस्वीकार करें",
    notificationsTitle: "सूचनाएं",
    markAllReadBtn: "सभी को पढ़ा हुआ चिह्नित करें",
    noNotifications: "कोई सूचना नहीं",

    loginHistoryTitle: "लॉगिन सुरक्षा और ऑडिट लॉग",
    loginHistorySubtitle: "सक्रिय सत्र और डिवाइस इतिहास को ट्रैक करें।",
    browserCol: "ब्राउज़र",
    osCol: "ऑपरेटिंग सिस्टम",
    ipCol: "आईपी पता",
    deviceCol: "डिवाइस",
    timeCol: "समय",
    statusCol: "स्थिति",

    fullNameLabel: "पूरा नाम",
    viewSecurityLogs: "सुरक्षा लॉग देखें",
    verifiedLabel: "सत्यापित",
    transferConfirmMsg: "क्या आप अंक स्थानांतरित करना चाहते हैं?",
    secureCheckout: "सुरक्षित चेकआउट",
    dateHeader: "दिनांक",
    statusHeader: "स्थिति",
    limitReached: "(सीमा समाप्त)",
    requestsTab: "अनुरोध",
    addBtn: "जोड़ें",
    loadMorePosts: "और पोस्ट लोड करें",
    footerCopyright: "© 2026 StackSphere. सर्वाधिकार सुरक्षित।",
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
    homeOverview: "Início",
    qaCommunity: "Comunidade Q&A",
    socialSpacePreview: "Prévia do Espaço Social",
    plansPricing: "Planos e Preços",
    rewardsSystem: "Sistema de Recompensas",
    platformFeatures: "Recursos da Plataforma",
    signIn: "Entrar",
    createAccount: "Criar Conta",
    explorePlatform: "EXPLORAR PLATAFORMA",
    getStarted: "COMEÇAR",
    general: "GERAL",
    qaForumGroup: "FÓRUM Q&A",
    socialSpaceGroup: "ESPAÇO SOCIAL",
    rewardsGroup: "RECOMPENSAS",
    membershipGroup: "ASSINATURA",
    accountSecurityGroup: "CONTA E SEGURANÇA",
    askQuestion: "Fazer Pergunta",
    myQuestions: "Minhas Perguntas",
    friendsNetwork: "Amigos e Rede",
    myReputationPoints: "Meus Pontos de Reputação",
    transferPoints: "Transferir Pontos",
    developerEcosystem: "Plataforma para Desenvolvedores",
    menu: "Menu",
    navigationMenu: "Menu de Navegação",
    
    signInTitle: "Entrar no StackSphere",
    signInSubtitle: "Insira seus dados abaixo para fazer login na sua conta",
    emailAddress: "Endereço de E-mail",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    forgotPasswordLink: "Esqueceu a senha?",
    otpCode: "Código OTP",
    signInButton: "Entrar",
    noAccount: "Não tem uma conta?",
    signUpNow: "Cadastre-se agora",
    signUpTitle: "Crie sua Conta",
    signUpSubtitle: "Junte-se à comunidade de desenvolvedores hoje",
    fullName: "Nome Completo",
    phoneNumber: "Número de Telefone",
    signUpButton: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    signInNow: "Entrar",
    sendOtpCode: "Enviar Código OTP",
    verificationCode: "Código de Verificação",
    verify: "Verificar",
    phoneVerified: "Número de telefone verificado ✓",
    readyForSignup: "Pronto para cadastro",

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
    dangerZoneTitle: "Zona de Perigo",
    deleteAccountTitle: "Excluir Conta",
    deleteAccountDesc: "Exclua permanentemente sua conta e todos os dados associados.",
    deleteAccountBtn: "Excluir minha Conta",
    typeDeleteToConfirm: "Digite DELETE para confirmar",
    enterPasswordToDelete: "Digite sua senha para confirmar a exclusão:",
    languagePreference: "Preferência de Idioma",
    selectLanguage: "Selecionar Idioma do Aplicativo",

    choosePlan: "Escolha seu Plano",
    activePlanLabel: "Plano de Assinatura Ativo",
    billingHistory: "Histórico de Cobrança e Transações",
    downloadInvoice: "Baixar PDF",
    subscribeBtn: "Assinar Agora",
    freePlanTitle: "Plano Gratuito",
    proPlanTitle: "Assinatura Pro",
    timeGateWarning: "A assinatura é restrita ao horário de 10:00 AM - 11:00 AM IST.",

    questionsTitle: "Perguntas e Discussão da Comunidade",
    askQuestionBtn: "Fazer Pergunta",
    postComposerTitle: "Criar Nova Publicação",
    postPlaceholder: "Compartilhe uma atualização ou código...",
    attachMedia: "Anexar Foto ou Vídeo",
    postButton: "Publicar",
    friendRequestsTitle: "Solicitações de Amizade",
    acceptBtn: "Aceitar",
    rejectBtn: "Recusar",
    notificationsTitle: "Notificações",
    markAllReadBtn: "Marcar todas como lidas",
    noNotifications: "Nenhuma notificação",

    loginHistoryTitle: "Segurança de Login e Auditoria",
    loginHistorySubtitle: "Rastreie sessões ativas e histórico de dispositivos.",
    browserCol: "Navegador",
    osCol: "Sistema Operacional",
    ipCol: "Endereço IP",
    deviceCol: "Dispositivo",
    timeCol: "Hora",
    statusCol: "Status",

    fullNameLabel: "Nome Completo",
    viewSecurityLogs: "Ver registros de segurança",
    verifiedLabel: "Verificado",
    transferConfirmMsg: "Deseja realmente transferir pontos?",
    secureCheckout: "Pagamento seguro",
    dateHeader: "Data",
    statusHeader: "Status",
    limitReached: "(Limite Atingido)",
    requestsTab: "Solicitações",
    addBtn: "Adicionar",
    loadMorePosts: "Carregar Mais Publicações",
    footerCopyright: "© 2026 StackSphere. Todos os direitos reservados.",
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
    homeOverview: "首页概览",
    qaCommunity: "问答社区",
    socialSpacePreview: "社交空间预览",
    plansPricing: "计划与价格",
    rewardsSystem: "奖励系统",
    platformFeatures: "平台特性",
    signIn: "登录",
    createAccount: "创建账户",
    explorePlatform: "探索平台",
    getStarted: "开始使用",
    general: "常规",
    qaForumGroup: "问答论坛",
    socialSpaceGroup: "社交空间",
    rewardsGroup: "奖励积分",
    membershipGroup: "会员订阅",
    accountSecurityGroup: "账户与安全",
    askQuestion: "提问",
    myQuestions: "我的问题",
    friendsNetwork: "好友与网络",
    myReputationPoints: "我的声望积分",
    transferPoints: "划转积分",
    developerEcosystem: "开发者生态系统平台",
    menu: "菜单",
    navigationMenu: "导航菜单",
    
    signInTitle: "登录 StackSphere",
    signInSubtitle: "在下方输入您的详细信息以登录您的账户",
    emailAddress: "电子邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    forgotPasswordLink: "忘记密码？",
    otpCode: "OTP 验证码",
    signInButton: "登录",
    noAccount: "还没有账户？",
    signUpNow: "立即注册",
    signUpTitle: "创建您的账户",
    signUpSubtitle: "今天就加入开发者社区",
    fullName: "全名",
    phoneNumber: "电话号码",
    signUpButton: "创建账户",
    alreadyHaveAccount: "已经有账户了？",
    signInNow: "登录",
    sendOtpCode: "发送验证码",
    verificationCode: "验证码",
    verify: "验证",
    phoneVerified: "手机号码已验证 ✓",
    readyForSignup: "可以注册",

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
    dangerZoneTitle: "危险区域",
    deleteAccountTitle: "删除账户",
    deleteAccountDesc: "永久删除您的账户及所有相关私有数据。",
    deleteAccountBtn: "删除我的账户",
    typeDeleteToConfirm: "输入 DELETE 以确认",
    enterPasswordToDelete: "输入您的密码以确认删除：",
    languagePreference: "语言偏好",
    selectLanguage: "选择应用语言",

    choosePlan: "选择您的订阅计划",
    activePlanLabel: "有效会员计划",
    billingHistory: "账单与交易历史",
    downloadInvoice: "下载 PDF",
    subscribeBtn: "立即订阅",
    freePlanTitle: "免费版",
    proPlanTitle: "Pro 会员",
    timeGateWarning: "订阅受限于 10:00 AM - 11:00 AM IST 窗口。",

    questionsTitle: "问题与社区讨论",
    askQuestionBtn: "提问",
    postComposerTitle: "发布新动态",
    postPlaceholder: "分享代码想法或动态...",
    attachMedia: "上传图片或视频",
    postButton: "发布",
    friendRequestsTitle: "好友请求",
    acceptBtn: "接受",
    rejectBtn: "拒绝",
    notificationsTitle: "通知中心",
    markAllReadBtn: "全部标记为已读",
    noNotifications: "暂无通知",

    loginHistoryTitle: "登录安全与审计日志",
    loginHistorySubtitle: "跟踪活动会话、浏览器元数据及 IP。",
    browserCol: "浏览器",
    osCol: "操作系统",
    ipCol: "IP 地址",
    deviceCol: "设备类型",
    timeCol: "时间",
    statusCol: "状态",

    fullNameLabel: "全名",
    viewSecurityLogs: "查看安全日志",
    verifiedLabel: "已验证",
    transferConfirmMsg: "确定要划转积分吗？",
    secureCheckout: "安全结账",
    dateHeader: "日期",
    statusHeader: "状态",
    limitReached: "(已达上限)",
    requestsTab: "请求",
    addBtn: "添加",
    loadMorePosts: "加载更多动态",
    footerCopyright: "© 2026 StackSphere. 版权所有。",
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
    homeOverview: "Aperçu de l'accueil",
    qaCommunity: "Communauté Q&R",
    socialSpacePreview: "Aperçu Espace Social",
    plansPricing: "Offres & Tarifs",
    rewardsSystem: "Système de Récompenses",
    platformFeatures: "Fonctionnalités",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    explorePlatform: "EXPLORER LA PLATEFORME",
    getStarted: "COMMENCER",
    general: "GÉNÉRAL",
    qaForumGroup: "FORUM Q&R",
    socialSpaceGroup: "ESPACE SOCIAL",
    rewardsGroup: "RÉCOMPENSES",
    membershipGroup: "ABONNEMENT",
    accountSecurityGroup: "COMPTE ET SÉCURITÉ",
    askQuestion: "Poser une Question",
    myQuestions: "Mes Questions",
    friendsNetwork: "Amis & Réseau",
    myReputationPoints: "Mes Points de Réputation",
    transferPoints: "Transférer des Points",
    developerEcosystem: "Plateforme Écosystème Développeur",
    menu: "Menu",
    navigationMenu: "Menu de Navigation",

    signInTitle: "Connexion à StackSphere",
    signInSubtitle: "Entrez vos identifiants ci-dessous",
    emailAddress: "Adresse E-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPasswordLink: "Mot de passe oublié ?",
    otpCode: "Code OTP",
    signInButton: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUpNow: "S'inscrire maintenant",
    signUpTitle: "Créer votre compte",
    signUpSubtitle: "Rejoignez la communauté de développeurs",
    fullName: "Nom complet",
    phoneNumber: "Numéro de téléphone",
    signUpButton: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ?",
    signInNow: "Se connecter",
    sendOtpCode: "Envoyer le Code OTP",
    verificationCode: "Code de Vérification",
    verify: "Vérifier",
    phoneVerified: "Numéro de téléphone vérifié ✓",
    readyForSignup: "Prêt pour l'inscription",

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
    dangerZoneTitle: "Zone de Danger",
    deleteAccountTitle: "Supprimer le Compte",
    deleteAccountDesc: "Supprimez définitivement votre compte et toutes vos données associées.",
    deleteAccountBtn: "Supprimer mon Compte",
    typeDeleteToConfirm: "Tapez DELETE pour confirmer",
    enterPasswordToDelete: "Entrez votre mot de passe pour confirmer la suppression :",
    languagePreference: "Préférence Linguistique",
    selectLanguage: "Sélectionner la Langue de l'Application",

    choosePlan: "Choisissez votre Forfait",
    activePlanLabel: "Forfait d'Abonnement Actif",
    billingHistory: "Historique de Facturation",
    downloadInvoice: "Télécharger la Facture PDF",
    subscribeBtn: "S'abonner Maintenant",
    freePlanTitle: "Forfait Gratuit",
    proPlanTitle: "Abonnement Pro",
    timeGateWarning: "Les abonnements sont limités au créneau de 10h00 à 11h00 IST.",

    questionsTitle: "Questions et Discussion de la Communauté",
    askQuestionBtn: "Poser une Question",
    postComposerTitle: "Créer une Publication",
    postPlaceholder: "Partagez vos idées ou du code...",
    attachMedia: "Joindre Photo ou Vidéo",
    postButton: "Publier",
    friendRequestsTitle: "Demandes d'Amis",
    acceptBtn: "Accepter",
    rejectBtn: "Refuser",
    notificationsTitle: "Notifications",
    markAllReadBtn: "Marquer tout comme lu",
    noNotifications: "Aucune notification",

    loginHistoryTitle: "Sécurité & Registres d'Audit",
    loginHistorySubtitle: "Suivez les sessions actives et l'historique des appareils.",
    browserCol: "Navigateur",
    osCol: "Système d'Exploitation",
    ipCol: "Adresse IP",
    deviceCol: "Appareil",
    timeCol: "Heure",
    statusCol: "Statut",

    fullNameLabel: "Nom complet",
    viewSecurityLogs: "Voir les journaux de sécurité",
    verifiedLabel: "Vérifié",
    transferConfirmMsg: "Voulez-vous vraiment transférer des points ?",
    secureCheckout: "Paiement sécurisé",
    dateHeader: "Date",
    statusHeader: "Statut",
    limitReached: "(Limite Atteinte)",
    requestsTab: "Demandes",
    addBtn: "Ajouter",
    loadMorePosts: "Charger Plus de Publications",
    footerCopyright: "© 2026 StackSphere. Tous droits réservés.",
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
