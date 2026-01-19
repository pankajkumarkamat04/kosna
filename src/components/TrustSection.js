import React from "react";
import VerifiedIcon from "@mui/icons-material/Verified";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import "./TrustSection.css";

const TrustSection = () => {
    const trustItems = [
        {
            icon: <VerifiedIcon className="trust-icon" />,
            title: "6 Years Experience",
            description: "Trusted by Community",
        },
        {
            icon: <FlashOnIcon className="trust-icon" />,
            title: "Instant Delivery",
            description: "No waiting time",
        },
        {
            icon: <LockIcon className="trust-icon" />,
            title: "Secure Payment",
            description: "KPay, Wave, Bank",
        },
    ];

    return (
        <div className="trust-section">
            <div className="trust-container">
                {trustItems.map((item, index) => (
                    <div key={index} className="trust-card">
                        <div className="trust-icon-wrapper">{item.icon}</div>
                        <h3 className="trust-title">{item.title}</h3>
                        <p className="trust-description">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrustSection;
