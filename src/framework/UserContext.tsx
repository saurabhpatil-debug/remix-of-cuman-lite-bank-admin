import React, { createContext, useContext } from "react";
import currentUser from "@/assets/data/currentUser.json";

export const UserContext = createContext<any>(null);
export const UserLoadingContext = createContext<boolean>(false);

/**
 * Offline user context: the logged-in user is read from static JSON,
 * no authentication service or API call is involved.
 */
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserLoadingContext.Provider value={false}>
			<UserContext.Provider value={currentUser}>{children}</UserContext.Provider>
		</UserLoadingContext.Provider>
	);
};

export const useUserInfo = () => useContext(UserContext);
export const useUserLoading = () => useContext(UserLoadingContext);
