import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Rocket,
  Gift,
  CreditCard,
  X,
  LucideIcon,
} from "lucide-react";
import StripeCheckoutModal from "../stripe/StripeCheckout";
import { useSupabase } from "../../contexts/SupabaseContext";
interface Plan {
  name: string;
  price: string;
  priceId: string;
  icon: LucideIcon;
  description: string;
  prizeEligible: boolean;
  trialDays: number;
  promoCode: boolean;
}
interface SubscriptionPlanProps {
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function SubscriptionPlan({ onOpenChange }: SubscriptionPlanProps) {
  const { session: token } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<boolean>(false);
  const [activeSubscription, setActiveSubscription] = useState<string | null>(
    null
  );
  const [loadingActiveSubscriptions, setLoadingActiveSubscriptions] =
    useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const plans = [
    {
      name: "Free Plan",
      price: "$0/month",
      priceId: "price_1Qt7haHPnFqUVCZdl33y9bET",
      comingSoon: false,
      icon: Rocket,
      description: "Start your health optimization journey",
      prizeEligible: false,
      trialDays: 0,
      promoCode: false,
    },
    {
      name: "Pro Plan",
      price: "$59.95/month",
      priceId: "price_1Qt7jVHPnFqUVCZdutw3mSWN",
      comingSoon: false,
      icon: Shield,
      description: "Level up with prizes and premium features",
      prizeEligible: true,
      trialDays: 60,
      promoCode: false,
    },
    {
      name: "Pro + Family",
      price: "$89.95/month",
      priceId: "price_1Qt7lXHPnFqUVCZdlpS1vrfs",
      comingSoon: true,
      icon: Users,
      description: "Gamify health for your entire family",
      prizeEligible: true,
      trialDays: 0,
      promoCode: true,
    },
    {
      name: "Pro + Team",
      price: "$149.95/month",
      priceId: "price_1Qt7mVHPnFqUVCZdqvWROuTD",
      comingSoon: true,
      icon: Building2,
      description: "Optimize and gamify health for your entire team",
      prizeEligible: true,
      trialDays: 0,
      promoCode: true,
    },
  ];
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(plans[1]);
  const getUserActiveSubscriptions = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/get-active-subscription`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to get subscription");
      }

      const data = await response.json();
      setActiveSubscription(data[0]?.plan?.id);
      setLoadingActiveSubscriptions(false);
    } catch (err) {
      console.error("Error fetching subscription:", err.message);
      setLoadingActiveSubscriptions(false);
    }
  };

  useEffect(() => {
    if (token) {
      getUserActiveSubscriptions();
    }
  }, [token]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBillingClick = () => {
    // TODO: Implement billing management
    setIsOpen(false);
  };

  const handleSubscribePlanClick = (plan: Plan) => {
    if (activeSubscription === plan.priceId) {
      alert("You are already subscribed to this plan.");
      return;
    }
    setCurrentPlan(plan);
    setPaymentModal(true);
    setIsOpen(false);
  };
  const handleCancelSubscribePlanClick = async (plan: Plan) => {
    if (activeSubscription !== plan.priceId) {
      alert("You are not subscribed to this plan.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to cancel subscription");
      }

      setActiveSubscription(null); // Remove active subscription
      alert("Subscription canceled successfully.");
    } catch (err) {
      console.error("Error canceling subscription:", err.message);
    }
  };
 
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-orange-500 font-medium hover:text-orange-400 transition-colors relative z-10"
        >
          <Shield size={16} />
          <span>{currentPlan?.name}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-[200]">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 text-sm border-b border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400">
                    Select a Plan to View or Change
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Plans */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isSubscribed = activeSubscription === plan.priceId;
                    if (loadingActiveSubscriptions) {
                      return (
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={plan.name}
                        className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                          isSubscribed
                            ? "bg-gray-700/50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            size={16}
                            className={
                              currentPlan?.name === plan.name
                                ? "text-orange-500"
                                : "text-gray-400"
                            }
                          />
                          <div className="font-medium text-white">
                            {plan.name}
                          </div>
                          {plan.comingSoon && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-medium">
                            {plan.price}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {plan.description}
                        </div>
                        {plan.prizeEligible && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-lime-500">
                            <Gift size={12} />
                            <span>Eligible for Prize Pool Rewards</span>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-4">
                          {!isSubscribed && (
                            <button
                              onClick={() => handleSubscribePlanClick(plan)}
                              className="p-2 rounded-md border-2 border-orange-400 text-green-400 text-md font-bold"
                            >
                              Subscribe
                            </button>
                          )}
                          {isSubscribed && (
                            <button
                              onClick={() =>
                                handleCancelSubscribePlanClick(plan)
                              }
                              className="p-2 rounded-md border-2 border-orange-400 text-red-500 text-md font-bold"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700"></div>

                {/* Billing Management */}
                <button
                  onClick={handleBillingClick}
                  className="w-full px-4 py-3 text-sm text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-300"
                >
                  <CreditCard size={16} />
                  <span>Update Card Info</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {paymentModal && (
        <StripeCheckoutModal
          priceId={currentPlan?.priceId}
          trialDays={currentPlan?.trialDays}
          promoCode={currentPlan?.promoCode}
          onClose={() => setPaymentModal(false)}
        />
      )}
    </>
  );
}
