import axios from "axios";
import { axiosInstanceGPGGet } from "./InterceptedHttp/axiosInstance";
import { CumanBankAdminLoggedinVM } from "@/Model/CumanBankAdminLoggedinVM.model";

// src/framework/auth.service.ts
// NOTE: Do not commit real tokens here. Use environment variables or secure configuration instead.
const local = [
  {
    userid: "hdfc_dev_supriya@wy712.onmicrosoft.com",
    id_token: "YOUR_TOKEN_HERE", // Replace with actual token from secure config
  },
];


export class AuthService {
  strMessage: string = " is required";
  InvalidMessage: string = "Invalid ";
  static UserInfo: CumanBankAdminLoggedinVM | null = null;

  private static readonly errorMessages: {
    [key: string]: (theFieldName: string, params?: any, strMessage?: any, InvalidMessage?: any) => string;
  } = {
    required: (theFieldName: string) => theFieldName + " is required",
    pattern: (theFieldName: string) => "Invalid " + theFieldName,
  };

  public static getLoginUrl(returnPath = window.location.pathname + window.location.search) {
    const postLoginRedirectUri = `${window.location.origin}${returnPath}`;
    return `${window.location.origin}/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(postLoginRedirectUri)}`;
  }

  public static redirectToLogin(returnPath?: string) {
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    this.UserInfo = null;
    // Redirect to Azure logout endpoint
    const postLogoutRedirectUri = `${window.location.origin}/`;
    window.location.replace(
      `${window.location.origin}/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`
    );
  }

  public static logout() {
    this.UserInfo = null;
    const postLogoutRedirectUri = `${window.location.origin}/`;
    window.location.replace(
      `${window.location.origin}/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`,
    );
  }

   //// -------------------
  ////  <!-- For Azure Env -->
  //// -------------------

  public static async getAuthToken(): Promise<any> {
    // Using axios for HTTP GET request
    try {
      const response = await axios.get("/.auth/me", {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: {
          _: Date.now(),
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //// -------------------
  ////  <!-- For Local Env -->
  //// -------------------

  //  public static getAuthToken(): Promise<any> {
  //   //  Simulate axiosInstance for local env by returning local data as a resolved Promise
  //    return Promise.resolve(local);
  //  }
  
  public static async isAuthenticated(): Promise<boolean> {
    try {
      const auth = await this.getAuthToken();
      return Boolean(auth?.[0]?.id_token);
    } catch {
      this.UserInfo = null;
      return false;
    }
  }

  public static GetCumanBankAdminLoggedinUser = async () => {
    const auth = await this.getAuthToken(); // local or /.auth/me
    const token = auth[0]?.id_token;

    if (!token) {
      this.UserInfo = null;
      throw new Error("User is not authenticated");
    }

    const response = await axiosInstanceGPGGet.get(`AuthorizationR/GetCumanBankAdminLoggedinUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.UserInfo = response.data;
    console.log("User Info fetched in Leaderboard page1:", this.UserInfo);
    return this.UserInfo;
  };

  ////------Message---------
  private getMessage(
    errorKey: string,
    fieldName: string,
    params?: any,
    strMessage = " is required",
    invalidMessage = "Invalid ",
  ) {
    if (AuthService.errorMessages[errorKey]) {
      return AuthService.errorMessages[errorKey](fieldName, params, strMessage, invalidMessage);
    }
    return "";
  }

  public formIsValid(
    formValues: Record<string, any>,
    formErrors: Record<string, any>,
    setMessages: (msgs: string[]) => void,
  ) {
    let errorList: string[] = [];

    const strMessage = " is required";
    const invalidMessage = "Invalid ";

    Object.keys(formErrors).forEach((field) => {
      const errors = formErrors[field];

      if (errors) {
        Object.keys(errors).forEach((errorKey) => {
          const inputElement = document.getElementsByName(field)[0];
          const placeholder = inputElement?.getAttribute("placeholder") ?? field;

          const msg = this.getMessage(errorKey, placeholder, errors[errorKey], strMessage, invalidMessage);

          if (msg) {
            errorList.push(msg);
          }
        });
      }
    });

    if (errorList.length > 0) {
      setMessages(errorList);
      return false;
    }

    setMessages([]);
    return true;
  }
}
