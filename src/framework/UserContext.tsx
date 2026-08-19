
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthService } from "./auth.service";

export const UserContext = createContext<any>(null);
export const UserLoadingContext = createContext<boolean>(true);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [userInfo, setUserInfo] = useState<any>(null);
const [loading, setLoading] = useState(true);

const loadUser = async () => {
	try {
	  const user = await AuthService.GetCumanBankAdminLoggedinUser();
	  AuthService.UserInfo = user;
	  setUserInfo(user);
	} catch {
	  AuthService.UserInfo = null;
	  setUserInfo(null);
	} finally {
	  setLoading(false);
	}
  };

	useEffect(() => {
		loadUser();
	}, []);

	return (
		<UserLoadingContext.Provider value={loading}>
		  <UserContext.Provider value={userInfo}>
			{children}
		  </UserContext.Provider>
		</UserLoadingContext.Provider>
	  );
};

export const useUserInfo = () => useContext(UserContext);
export const useUserLoading = () => useContext(UserLoadingContext);	
