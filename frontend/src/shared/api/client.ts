import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout } from "@features/auth/authSlice";
import { authApi } from "@features/auth/api/authApi";
import type { RootState } from "@/app/store";

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra
) => {
  let result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401) {
    try {
      const { jwt, user } = await api.dispatch(authApi.endpoints.getCurrentUser.initiate()).unwrap();
      api.dispatch(
        authApi.util.updateQueryData("getCurrentUser", undefined, () => ({
          jwt,
          user,
        }))
      );
      api.dispatch({ type: "auth/setToken", payload: jwt });
      api.dispatch({ type: "auth/setUser", payload: user });
      result = await rawBaseQuery(args, api, extra);
    } catch {
      api.dispatch(logout());
    }
  }
  return result;
};
