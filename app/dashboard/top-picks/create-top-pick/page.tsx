import CreateTopPickForm from "@/components/ui/top-picks/create-top-pick-form";

export default async function Page() {
  return (
    <div>
      <h1>Create Top-Pick</h1>
      <div className="border-t border-white my-4"></div>
      <CreateTopPickForm />
    </div>
  );
}
