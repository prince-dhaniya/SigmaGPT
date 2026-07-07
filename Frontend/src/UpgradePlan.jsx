import "./UpgradePlan.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function UpgradePlan() {
    const { user, token, updateUser, setCurrentPage, showToast } = useContext(MyContext);
    const currentPlan = user?.plan || "free";

    const handleSelectPlan = async (planId) => {
        if (!token) {
            showToast("Please log in to upgrade your plan.", "info");
            setCurrentPage("login");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/plan", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ plan: planId })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.error || "Failed to update plan.", "error");
                return;
            }

            updateUser(data);
            showToast(`Upgraded to ${planId.toUpperCase()} successfully!`, "success");
        } catch (err) {
            showToast("Failed to connect to server.", "error");
        }
    };

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "$0",
            features: ["10 messages/day", "Basic AI model", "7 day history"],
        },
        {
            id: "pro",
            name: "Pro",
            price: "$20/mo",
            features: ["Unlimited messages", "Advanced models", "Unlimited history"],
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "$50/mo",
            features: ["Everything in Pro", "Team management", "API access"],
        },
    ];

    return (
        <div className="upgrade-page">
            <div className="upgrade-container">
                <button className="upgrade-back-btn" onClick={() => setCurrentPage("chat")}>
                    ← Back
                </button>
                <h1 className="upgrade-title">Upgrade Plan</h1>

                <div className="upgrade-cards">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`upgrade-card ${currentPlan === plan.id ? "upgrade-card-active" : ""}`}>
                            <h3 className="upgrade-card-name">{plan.name}</h3>
                            <p className="upgrade-card-price">{plan.price}</p>
                            <ul className="upgrade-features">
                                {plan.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                            <button
                                className="upgrade-card-btn"
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={currentPlan === plan.id}
                            >
                                {currentPlan === plan.id ? "Current Plan" : `Get ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UpgradePlan;
