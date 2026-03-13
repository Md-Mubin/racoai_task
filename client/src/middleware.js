import { NextResponse } from "next/server";

const PROTECTED = ["/admin", "/buyer", "/solver"];
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log(pathname)
  const token = request.cookies.get("token")?.value;
  console.log(token)

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token)
    return NextResponse.redirect(new URL("/login", request.url));

  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && token)
    return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/buyer/:path*", "/solver/:path*", "/login", "/register"],
};
