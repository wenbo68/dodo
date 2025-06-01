import { signOut } from "@/server/auth";

export default function Topbar() {
  return (
    <div className="flex gap-1">
      <button
        className="w-20 rounded-lg border shadow-md"
        onClick={async () => {
          "use server";
          await signOut({ redirectTo: "/api/auth/signin" });
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
