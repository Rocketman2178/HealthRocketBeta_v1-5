import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabase } from "../../contexts/SupabaseContext";

const Settings = () => {
  const { session: token } = useSupabase();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState<string>("Checking subscription...");
  const navigate = useNavigate();
  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setMessage("No session found.");
        return;
      }
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/verify-session?session_id=${sessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: { status?: string } = await response.json();

        if (response.ok && data.status === "complete") {
          setMessage("🎉 Subscription successful! Thank you for subscribing.");
        } else {
          setMessage(
            "⚠️ Subscription could not be verified. Please contact support."
          );
        }
      } catch (error) {
        setMessage("❌ Error verifying subscription. Try again later.");
      }
    };
    verifySubscription();
  }, []);

  return (
    <div className="flex flex-col items-center   bg-white shadow-lg  justify-center h-screen">
      <div className="p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-orange-400">{message}</h2>
      </div>
      <button
        className="text-black"
        onClick={() => {
          navigate("/");
        }}
      >
        Go Back To Home{" "}
      </button>
    </div>
  );
};

export default Settings;
