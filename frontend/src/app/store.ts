import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "@features/auth/authSlice";
import { api } from "@shared";
import { errorToastMiddleware } from "./toastMiddleware";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
  blacklist: [api.reducerPath],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [api.reducerPath]: api.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware, errorToastMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
