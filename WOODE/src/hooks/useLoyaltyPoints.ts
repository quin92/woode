import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  setupLoyaltyPointsListener,
  removeLoyaltyPointsListener,
} from "../lib/socket";

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(
    user?.loyaltyPoint ?? 0
  );

  useEffect(() => {
    // Cập nhật từ user context
    if (user?.loyaltyPoint) {
      setLoyaltyPoints(user.loyaltyPoint);
    }
  }, [user?.loyaltyPoint]);

  useEffect(() => {
    if (!user?.id) return;

    // Lắng nghe WebSocket realtime updates
    setupLoyaltyPointsListener(user.id, (points) => {
      setLoyaltyPoints(points);
    });

    return () => {
      removeLoyaltyPointsListener(user.id);
    };
  }, [user?.id]);

  return loyaltyPoints;
};
