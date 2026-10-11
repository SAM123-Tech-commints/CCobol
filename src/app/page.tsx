import { redirect } from "next/navigation";
import { lessons } from "@/content";

export const metadata = {
  title: "Learn COBOL Programming - Free Online COBOL Tutorial & Compiler",
  description:
    "A complete step-by-step COBOL tutorial with a free online COBOL compiler: syntax, data types, variables, arithmetic and logical operators, control structures, tables, string handling, file handling, debugging, mainframe concepts and more.",
};

/** No landing dashboard - the site opens directly on the tutorial. */
export default function HomePage() {
  redirect(`/learn/${lessons[0]?.slug ?? "hello-world"}`);
}
