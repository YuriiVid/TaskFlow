import { api } from "@shared";
import type {
  LoginCredentials,
  UserDataResponse,
  RegisterCredentials,
  EmailConfirmation,
  PasswordReset,
  TitleMessageResponse,
} from "../types";
import { logout, setToken, setUser } from "../authSlice";
import { rawBaseQuery } from "@shared/api/client";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<UserDataResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.jwt));
          dispatch(setUser(data.user));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    getCurrentUser: build.query<UserDataResponse, void>({
      // Use queryFn with rawBaseQuery to avoid circular reauth
      queryFn: async (_, api, extraOptions) => {
        const result = await rawBaseQuery({ url: "/auth/refresh-user-token", method: "GET" }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as UserDataResponse };
      },
      // only fetch once per session:
      keepUnusedDataFor: 800,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.jwt));
          dispatch(setUser(data.user));
        } catch {
          dispatch(logout());
        }
      },
    }),

    logout: build.mutation<TitleMessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.title === "Success") {
          dispatch(logout());
        }
      },
    }),

    register: build.mutation<TitleMessageResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    confirmEmail: build.mutation<TitleMessageResponse, EmailConfirmation>({
      query: (confirmation) => ({
        url: "/auth/confirm-email",
        method: "PUT",
        body: confirmation,
      }),
    }),

    resendConfirmation: build.mutation<TitleMessageResponse, string>({
      query: (email) => ({
        url: `/auth/resend-email-confirmation-link/${email}`,
        method: "POST",
      }),
    }),

    requestPasswordReset: build.mutation<TitleMessageResponse, string>({
      query: (email) => ({
        url: `/auth/forgot-password/${email}`,
        method: "POST",
      }),
    }),

    resetPassword: build.mutation<TitleMessageResponse, PasswordReset>({
      query: (resetData) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: resetData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useConfirmEmailMutation,
  useResendConfirmationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
} = authApi;
