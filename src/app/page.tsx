import { signIn } from "~/server/auth";


export default function HomePage() {
  return (
    <>
      <form
        action={async () => {
          "use server"
          await signIn("google",{redirectTo: "/dashboard"})
        }}
      >
        <button className="btn" type="submit">Signin with Google</button>
      </form>
      <form
        action={async () => {
          "use server"
          await signIn("github",{redirectTo: "/dashboard"})
        }}
      >
        <button className="btn" type="submit">Signin with GitHub</button>
      </form>
    </>
  );
}
