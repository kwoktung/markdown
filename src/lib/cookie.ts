import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie as serverGetCookie } from "@tanstack/react-start/server";
import Cookies from "js-cookie";

export const getCookie = createIsomorphicFn()
  .client((name: string) => Cookies.get(name))
  .server((name: string) => serverGetCookie(name));

export const setCookie = createIsomorphicFn()
  .client((name: string, value: string, options?: Cookies.CookieAttributes) =>
    Cookies.set(name, value, options),
  )
  .server(
    (_name: string, _value: string, _options?: Cookies.CookieAttributes) => {},
  );

export const removeCookie = createIsomorphicFn()
  .client((name: string, options?: Cookies.CookieAttributes) =>
    Cookies.remove(name, options),
  )
  .server((_name: string, _options?: Cookies.CookieAttributes) => {});
