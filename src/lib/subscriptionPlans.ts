export interface SubscriptionPlan {
  id: string;
  price: string;
  nameKey: string;
  allowanceKey: string;
  descriptionKey: string;
  periodKey: string;
  badgeKey?: string;
  popular?: boolean;
  featureKeys: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    price: "₹0",
    nameKey: "freePlanTitle",
    allowanceKey: "freeAllowance",
    descriptionKey: "freePlanDesc",
    periodKey: "forever",
    popular: false,
    featureKeys: [
      "feat1QuestionPerDay",
      "featBrowsePublicForum",
      "featSocialPreview",
      "featEarnRewards",
      "feat6Languages",
    ],
  },
  {
    id: "bronze",
    price: "₹100",
    nameKey: "bronzePlanName",
    allowanceKey: "bronzeAllowance",
    descriptionKey: "bronzePlanDesc",
    periodKey: "perMonth",
    popular: true,
    badgeKey: "mostPopular",
    featureKeys: [
      "feat5QuestionsPerDay",
      "featPhotoVideoUpload",
      "featExpandedPostLimits",
      "featPriorityVisibility",
      "featPdfInvoices",
    ],
  },
  {
    id: "silver",
    price: "₹300",
    nameKey: "silverPlanName",
    allowanceKey: "silverAllowance",
    descriptionKey: "silverPlanDesc",
    periodKey: "perMonth",
    popular: false,
    featureKeys: [
      "feat10QuestionsPerDay",
      "feat10MbMediaUpload",
      "featHighPriorityRanking",
      "featP2pTransfer",
      "featAutomatedBillingLogs",
    ],
  },
  {
    id: "gold",
    price: "₹1000",
    nameKey: "goldPlanName",
    allowanceKey: "goldAllowance",
    descriptionKey: "goldPlanDesc",
    periodKey: "perMonth",
    popular: false,
    featureKeys: [
      "featUnlimitedQuestions",
      "featUnlimitedMediaSharing",
      "featGoldBadge",
      "featFullAuditLogs",
      "featRazorpayTestMode",
    ],
  },
];
