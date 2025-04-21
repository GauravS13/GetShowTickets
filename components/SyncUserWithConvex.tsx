"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";

const SynUserWithConvex = () => {
  const { user } = useUser();
  const updateUser = useMutation(api.users.updateUser);

  useEffect(() => {
    if (!user) return;
    const syncUser = async () => {
      try {
        await updateUser({
          userId: user.id,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.emailAddresses[0]?.emailAddress ?? "",
        });
      } catch (error) {
        console.error("Error while syncting the usewr", error);
      }
    };

    syncUser();
  }, [user, updateUser]);

  return null;
};

export default SynUserWithConvex;
