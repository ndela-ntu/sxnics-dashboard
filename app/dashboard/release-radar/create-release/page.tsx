import CreateReleaseForm from "@/components/ui/release-radar/create-release-form";

export default async function Page() {
  return (
    <div>
      <h1>Create Release</h1>
      <div className="border-t border-white my-4"></div>
      <CreateReleaseForm />
    </div>
  );
}
