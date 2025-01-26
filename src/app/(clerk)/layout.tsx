import { PropsWithChildren } from "react";

export default function ClerkLayout({ children }: PropsWithChildren) {

  return <div className="h-screen flex-center">
    {children}
  </div>
}